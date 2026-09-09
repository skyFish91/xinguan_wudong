import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 餐位扩展（设计文档 §8.1、§23）：食写
 */
@Entity('ord_ext_seat')
export class OrderExtSeatEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '预订日期', length: 10 })
  bookDate: string;

  @Column({ comment: '时段ID' })
  slotId: number;

  @Column({ comment: '时段名称快照', length: 100, nullable: true })
  slotName: string;

  @Column({ comment: '用餐人数', type: 'int', default: 1 })
  guestCount: number;

  @Column({ comment: '联系人', length: 50, nullable: true })
  contact: string;

  @Column({ comment: '联系手机', length: 20, nullable: true })
  phone: string;

  @Column({ comment: '商家拒绝原因', length: 255, nullable: true })
  rejectReason: string;
}
