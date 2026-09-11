import { WudongBaseEntityNoUpdate } from '../../base/entity/wudong-base-noupdate';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单状态流转日志 —— 对齐 DDL `ord_order_log`（无 update_time，设计文档 §8.3）
 */
@Entity('ord_order_log')
export class OrderLogEntity extends WudongBaseEntityNoUpdate {
  @Index()
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'from_status', comment: '变更前状态', length: 16, nullable: true })
  fromStatus: string;

  @Column({ name: 'to_status', comment: '变更后状态', length: 16 })
  toStatus: string;

  @Column({ name: 'operator', comment: '操作人（用户ID/管理员ID/系统）', length: 32, nullable: true })
  operator: string;

  @Column({ name: 'remark', comment: '备注', length: 255, nullable: true })
  remark: string;
}
