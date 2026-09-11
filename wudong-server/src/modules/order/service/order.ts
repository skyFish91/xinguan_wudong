import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { OrderEntity } from '../entity/order';
import { OrderItemEntity } from '../entity/orderItem';
import { OrderRefundEntity } from '../entity/orderRefund';
import { OrderLogEntity } from '../entity/orderLog';
import { OrderExtService } from './orderExt';
import { OrderStatus, canTransit } from '../../../common/order-status';
import { ErrorCode } from '../../../common/constants/error-code';
import { genOrderNo } from '../../../common/order-no';
import { bizError } from '../../../common/biz-error';

/**
 * 统一订单中心（设计文档 §8）
 * 状态变更唯一入口是 changeStatus()，其余板块只读订单。
 */
@Provide()
export class OrderService extends BaseService {
  @InjectEntityModel(OrderEntity)
  orderEntity: Repository<OrderEntity>;

  @InjectEntityModel(OrderItemEntity)
  orderItemEntity: Repository<OrderItemEntity>;

  @InjectEntityModel(OrderRefundEntity)
  orderRefundEntity: Repository<OrderRefundEntity>;

  @InjectEntityModel(OrderLogEntity)
  orderLogEntity: Repository<OrderLogEntity>;

  @Inject()
  orderExtService: OrderExtService;

  /**
   * 创建订单（事务 + clientRequestId 幂等）
   * @param userId 下单用户
   * @param data { bizType, merchantId?, totalAmount, payAmount?, items[], ext?, addressSnapshot?, remark?, clientRequestId?, expireTime? }
   */
  async create(userId: number, data: any) {
    // 幂等：同一 clientRequestId 重复提交返回已创建的订单
    if (data.clientRequestId) {
      const exist = await this.orderEntity.findOne({
        where: { clientRequestId: data.clientRequestId },
      });
      if (exist) {
        return this.detail(exist.id, userId);
      }
    }

    const orderNo = genOrderNo('WD');
    const order = await this.orderEntity.manager.transaction(async em => {
      const o = await em.save(OrderEntity, {
        orderNo,
        userId,
        merchantId: data.merchantId ?? null,
        bizType: data.bizType,
        totalAmount: data.totalAmount ?? 0,
        payAmount: data.payAmount ?? data.totalAmount ?? 0,
        status: OrderStatus.PENDING,
        payStatus: 0,
        expireTime: data.expireTime || moment().add(15, 'minutes').toDate(),
        clientRequestId: data.clientRequestId ?? null,
        addressSnapshot: data.addressSnapshot ?? null,
        remark: data.remark ?? null,
      });

      for (const it of data.items || []) {
        await em.save(OrderItemEntity, { orderId: o.id, ...it });
      }

      if (data.ext) {
        await this.orderExtService.write(o.id, data.bizType, data.ext, em);
      }

      await em.save(OrderLogEntity, {
        orderId: o.id,
        orderNo,
        fromStatus: null,
        toStatus: OrderStatus.PENDING,
        operatorId: userId,
        remark: '创建订单',
      });

      return o;
    });

    return this.detail(order.id, userId);
  }

  /**
   * 状态机唯一入口：校验 + 乐观更新 + 日志 + 事件
   */
  async changeStatus(
    id: number,
    to: string,
    operatorId?: number,
    remark?: string
  ) {
    const order = await this.orderEntity.findOne({ where: { id } });
    if (!order) {
      throw bizError(ErrorCode.ORDER_NOT_FOUND, '订单不存在');
    }
    if (!canTransit(order.status as OrderStatus, to as OrderStatus)) {
      throw bizError(
        ErrorCode.ORDER_STATUS_INVALID,
        `订单状态 ${order.status} 不允许变更为 ${to}`
      );
    }

    // 乐观锁：以旧状态为条件更新，防止并发覆盖
    const res = await this.orderEntity.update(
      { id, status: order.status },
      { status: to, payStatus: to === OrderStatus.PAID ? 1 : order.payStatus }
    );
    if (!res.affected) {
      throw bizError(ErrorCode.ORDER_STATUS_INVALID, '订单状态已变更，请刷新后重试');
    }

    await this.orderLogEntity.save({
      orderId: id,
      orderNo: order.orderNo,
      fromStatus: order.status,
      toStatus: to,
      operatorId: operatorId ?? null,
      remark: remark ?? null,
    });

    // 广播事件（本进程），供各板块订阅（如 order.paid / order.cancelled）
    this.coolEventManager.emit('order.' + to.toLowerCase(), {
      ...order,
      status: to,
    });

    return this.detail(id);
  }

  /**
   * 取消订单（用户）
   */
  async cancel(id: number, userId: number, reason?: string) {
    await this.checkOwner(id, userId);
    return this.changeStatus(id, OrderStatus.CANCELLED, userId, reason || '用户取消订单');
  }

  /**
   * 申请退款：生成退款单 + 状态流转
   */
  async refund(id: number, userId: number, reason?: string, penaltyRate = 0) {
    const order = await this.checkOwner(id, userId);
    if (order.status === OrderStatus.REFUNDED) {
      throw bizError(ErrorCode.ORDER_STATUS_INVALID, '订单已退款');
    }
    const amount = Math.round(order.payAmount * (1 - penaltyRate));
    await this.orderRefundEntity.save({
      orderId: id,
      refundNo: genOrderNo('RF'),
      amount,
      penaltyRate,
      reason: reason ?? null,
      status: 1,
    });
    return this.changeStatus(id, OrderStatus.REFUNDED, userId, reason || '用户申请退款');
  }

  /**
   * 分页查询用户订单
   */
  async pageByUser(userId: number, query: any = {}) {
    const page = Number(query.page) || 1;
    const size = Number(query.size) || 10;
    const where: any = { userId };
    if (query.status) where.status = query.status;
    if (query.bizType) where.bizType = query.bizType;

    const [list, total] = await this.orderEntity.findAndCount({
      where,
      order: { createTime: 'DESC' },
      skip: (page - 1) * size,
      take: size,
    });
    return { list, pagination: { page, size, total } };
  }

  /**
   * 订单详情（含明细 + 扩展 + 退款记录）
   */
  async detail(id: number, userId?: number) {
    const order = await this.orderEntity.findOne({ where: { id } });
    if (!order || (userId != null && order.userId !== userId)) {
      throw bizError(ErrorCode.ORDER_NOT_FOUND, '订单不存在');
    }
    const items = await this.orderItemEntity.find({ where: { orderId: id } });
    const refunds = await this.orderRefundEntity.find({ where: { orderId: id } });
    const ext = await this.loadExt(order);
    return { ...order, items, refunds, ext };
  }

  /**
   * 从购物车分组创建订单（Task 5 调用）
   * @param groups [{ bizType, merchantId, totalAmount, payAmount, items[], ext, clientRequestId? }]
   */
  async createFromCart(userId: number, groups: any[], address?: any, remark?: string) {
    const orders = [];
    for (const g of groups) {
      const order = await this.create(userId, {
        bizType: g.bizType,
        merchantId: g.merchantId,
        totalAmount: g.totalAmount,
        payAmount: g.payAmount,
        items: g.items,
        ext: g.ext,
        addressSnapshot: address,
        remark,
        clientRequestId: g.clientRequestId,
      });
      orders.push(order);
    }
    return orders;
  }

  /**
   * 校验订单归属
   */
  private async checkOwner(id: number, userId: number) {
    const order = await this.orderEntity.findOne({ where: { id } });
    if (!order || order.userId !== userId) {
      throw bizError(ErrorCode.ORDER_NOT_FOUND, '订单不存在');
    }
    return order;
  }

  /**
   * 按 bizType 加载扩展表
   */
  private async loadExt(order: OrderEntity) {
    const map: Record<string, string> = {
      GOODS: 'extGoods',
      SEAT: 'extSeat',
      STAY: 'extStay',
      TICKET: 'extTicket',
      ROUTE: 'extTicket',
    };
    const field = map[order.bizType];
    if (!field) return null;
    const repo = (this.orderExtService as any)[field];
    return repo.findOne({ where: { orderId: order.id } });
  }
}
