import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 退款单 —— 对齐 DDL `ord_refund`（设计文档 §8.4）
 */
@Entity('ord_refund')
export class OrderRefundEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'refund_no', comment: '退款单号', length: 32 })
  refundNo: string;

  @Index()
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Index()
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'amount', comment: '申请退款金额(分)', type: 'int', unsigned: true })
  amount: number;

  @Column({ name: 'reason', comment: '退款原因', length: 255, nullable: true })
  reason: string;

  @Column({ name: 'images', comment: '凭证图片(JSON数组)', type: 'text', nullable: true })
  images: string;

  @Column({ name: 'status', comment: '状态 0待审核 1已退款 2已驳回', default: 0 })
  status: number;

  @Column({
    name: 'penalty_rate',
    comment: '扣款比例 0~1',
    type: 'decimal',
    precision: 4,
    scale: 2,
    default: 0,
  })
  penaltyRate: number;

  @Column({ name: 'actual_amount', comment: '实退金额(分)', type: 'int', unsigned: true, default: 0 })
  actualAmount: number;

  @Column({ name: 'audit_user_id', comment: '审核人', nullable: true })
  auditUserId: number;

  @Column({ name: 'audit_remark', comment: '审核意见', length: 255, nullable: true })
  auditRemark: string;

  @Column({ name: 'audit_time', comment: '审核时间', type: 'datetime', nullable: true })
  auditTime: Date;

  @Column({ name: 'refund_time', comment: '退款到账时间', type: 'datetime', nullable: true })
  refundTime: Date;
}
