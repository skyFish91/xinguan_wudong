import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 退款记录（设计文档 §8.4）
 */
@Entity('ord_refund')
export class OrderRefundEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Index({ unique: true })
  @Column({ comment: '退款单号', length: 32 })
  refundNo: string;

  @Column({ comment: '退款金额(分)', type: 'int', unsigned: true })
  amount: number;

  @Column({
    comment: '扣款比例 0~1',
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 0,
  })
  penaltyRate: number;

  @Column({ comment: '退款原因', length: 255, nullable: true })
  reason: string;

  @Column({ comment: '状态 0处理中 1已退款 2已驳回', default: 0 })
  status: number;
}
