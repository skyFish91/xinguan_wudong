import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 餐位预订扩展 —— 对齐 DDL `ord_ext_seat`（食）
 */
@Entity('ord_ext_seat')
export class OrderExtSeatEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'restaurant_id', comment: '餐厅ID', nullable: true })
  restaurantId: number;

  @Column({ name: 'book_date', comment: '预订日期', length: 10 })
  bookDate: string;

  @Column({ name: 'slot_id', comment: '时段ID' })
  slotId: number;

  @Column({ name: 'slot_name', comment: '时段名称快照', length: 100, nullable: true })
  slotName: string;

  @Column({ name: 'people_cnt', comment: '用餐人数', type: 'int', default: 1 })
  guestCount: number;

  @Column({ name: 'contact_name', comment: '联系人', length: 50, nullable: true })
  contact: string;

  @Column({ name: 'contact_phone', comment: '联系手机', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'remark', comment: '备注', length: 255, nullable: true })
  remark: string;

  @Column({ name: 'reject_reason', comment: '商家拒绝原因', length: 255, nullable: true })
  rejectReason: string;
}
