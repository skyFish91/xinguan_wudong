import { transformerTime } from '../../base/entity/base';
import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';
import { OrderStatus } from '../../../common/order-status';

/**
 * 统一订单主表 —— 对齐 DDL `ord_order`（设计文档 §8.1 / §17.2）
 *
 * 公共层独占写权限，其他板块只读；状态变更必须走 OrderService.changeStatus()。
 * 金额单位一律「分」。
 */
@Entity('ord_order')
export class OrderEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ name: 'merchant_id', comment: '商家ID', nullable: true })
  merchantId: number;

  @Column({ name: 'biz_type', comment: '业务类型 GOODS/SEAT/STAY/TICKET/ROUTE', length: 20 })
  bizType: string;

  /** 订单总额（分） */
  @Column({ name: 'total_amount', comment: '订单总额(分)', type: 'int', unsigned: true, default: 0 })
  totalAmount: number;

  /** 优惠金额（分） */
  @Column({ name: 'discount_amount', comment: '优惠金额(分)', type: 'int', unsigned: true, default: 0 })
  discountAmount: number;

  /** 运费（分） */
  @Column({ name: 'freight_amount', comment: '运费(分)', type: 'int', unsigned: true, default: 0 })
  freightAmount: number;

  /** 应付金额（分）= 总额 - 优惠 + 运费 */
  @Column({ name: 'pay_amount', comment: '应付金额(分)', type: 'int', unsigned: true, default: 0 })
  payAmount: number;

  /** 已退金额（分） */
  @Column({ name: 'refund_amount', comment: '已退金额(分)', type: 'int', unsigned: true, default: 0 })
  refundAmount: number;

  @Column({ name: 'status', comment: '订单状态', length: 16, default: OrderStatus.PENDING })
  status: string;

  @Column({ name: 'pay_status', comment: '支付状态 0未支付 1已支付', default: 0 })
  payStatus: number;

  @Column({ name: 'pay_type', comment: '支付方式 WECHAT/ALIPAY/MOCK', length: 16, nullable: true })
  payType: string;

  @Column({ name: 'pay_time', comment: '支付时间', type: 'datetime', nullable: true })
  payTime: Date;

  @Column({ name: 'trade_no', comment: '第三方交易流水号', length: 64, nullable: true })
  tradeNo: string;

  @Column({
    name: 'expire_time',
    comment: '支付超时时间',
    type: 'datetime',
    nullable: true,
    transformer: transformerTime,
  })
  expireTime: Date;

  @Index({ unique: true })
  @Column({ name: 'client_request_id', comment: '幂等键(clientRequestId)', length: 64, nullable: true })
  clientRequestId: string;

  @Column({ name: 'remark', comment: '下单备注', length: 255, nullable: true })
  remark: string;

  @Column({ name: 'finish_time', comment: '完成时间', type: 'datetime', nullable: true })
  finishTime: Date;

  @Index()
  @Column({ name: 'deleted_at', comment: '软删时间', type: 'datetime', nullable: true })
  deletedAt: Date;
}
