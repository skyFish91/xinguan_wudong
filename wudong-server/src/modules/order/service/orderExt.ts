import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BizType } from '../../../common/constants/biz-type';
import { OrderExtGoodsEntity } from '../entity/orderExtGoods';
import { OrderExtSeatEntity } from '../entity/orderExtSeat';
import { OrderExtStayEntity } from '../entity/orderExtStay';
import { OrderExtTicketEntity } from '../entity/orderExtTicket';

/**
 * 订单扩展表写入分发（设计文档 §8.1 三段式）
 */
@Provide()
export class OrderExtService {
  @InjectEntityModel(OrderExtGoodsEntity)
  extGoods: Repository<OrderExtGoodsEntity>;
  @InjectEntityModel(OrderExtSeatEntity)
  extSeat: Repository<OrderExtSeatEntity>;
  @InjectEntityModel(OrderExtStayEntity)
  extStay: Repository<OrderExtStayEntity>;
  @InjectEntityModel(OrderExtTicketEntity)
  extTicket: Repository<OrderExtTicketEntity>;

  /**
   * 按 bizType 写入对应扩展表
   * @param orderId 订单ID
   * @param bizType 业务类型
   * @param ext 板块传入的扩展字段
   * @param em 事务 EntityManager（在 OrderService 事务内调用）
   */
  async write(
    orderId: number,
    bizType: string,
    ext: Record<string, any>,
    em: any
  ): Promise<void> {
    const payload = { orderId, ...ext };
    switch (bizType) {
      case BizType.GOODS:
        await em.save(OrderExtGoodsEntity, payload);
        break;
      case BizType.SEAT:
        await em.save(OrderExtSeatEntity, payload);
        break;
      case BizType.STAY:
        await em.save(OrderExtStayEntity, payload);
        break;
      case BizType.TICKET:
      case BizType.ROUTE:
        await em.save(OrderExtTicketEntity, payload);
        break;
      default:
        throw new Error(`未知 bizType: ${bizType}`);
    }
  }
}
