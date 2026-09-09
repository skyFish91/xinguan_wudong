import { BaseEntity, transformerJson, transformerTime } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';
import { OrderStatus } from '../../../common/order-status';

/**
 * 统一订单主表（设计文档 §8.1、§17.2）
 * 公共层独占写权限，其他板块只读。
 */
@Entity('ord_order')
export class OrderEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '商家ID', nullable: true })
  merchantId: number;

  @Column({ comment: '业务类型 GOODS/SEAT/STAY/TICKET/ROUTE', length: 16 })
  bizType: string;

  @Column({ comment: '订单总额(分)', type: 'int', unsigned: true, default: 0 })
  totalAmount: number;

  @Column({ comment: '应付金额(分)', type: 'int', unsigned: true, default: 0 })
  payAmount: number;

  @Column({ comment: '订单状态', length: 16, default: OrderStatus.PENDING })
  status: string;

  @Column({ comment: '支付状态 0未支付 1已支付', default: 0 })
  payStatus: number;

  @Column({
    comment: '支付超时时间',
    type: 'varchar',
    transformer: transformerTime,
    nullable: true,
  })
  expireTime: Date;

  @Index({ unique: true })
  @Column({ comment: '幂等键(clientRequestId)', length: 64, nullable: true })
  clientRequestId: string;

  @Column({
    comment: '收货地址快照',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  addressSnapshot: any;

  @Column({ comment: '下单备注', length: 255, nullable: true })
  remark: string;
}
