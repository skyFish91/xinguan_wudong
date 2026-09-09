import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单操作日志（设计文档 §8.3）
 */
@Entity('ord_order_log')
export class OrderLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ comment: '变更前状态', length: 16, nullable: true })
  fromStatus: string;

  @Column({ comment: '变更后状态', length: 16 })
  toStatus: string;

  @Column({ comment: '操作人ID', nullable: true })
  operatorId: number;

  @Column({ comment: '备注', length: 255, nullable: true })
  remark: string;
}
