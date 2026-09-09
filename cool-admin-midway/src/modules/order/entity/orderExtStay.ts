import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 住宿订单扩展 —— 对齐 DDL `ord_ext_stay`（住）
 */
@Entity('ord_ext_stay')
export class OrderExtStayEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'stay_id', comment: '民宿ID', nullable: true })
  stayId: number;

  @Column({ name: 'room_type_id', comment: '房型ID', nullable: true })
  roomTypeId: number;

  @Column({ name: 'check_in', comment: '入住日期', length: 10 })
  checkIn: string;

  @Column({ name: 'check_out', comment: '离店日期', length: 10 })
  checkOut: string;

  @Column({ name: 'nights', comment: '晚数', type: 'int', default: 1 })
  nights: number;

  @Column({ name: 'room_cnt', comment: '房间数', type: 'int', default: 1 })
  roomCnt: number;

  @Column({ name: 'guest_name', comment: '入住人姓名', length: 50, nullable: true })
  guestName: string;

  @Column({ name: 'guest_phone', comment: '入住人手机', length: 20, nullable: true })
  guestPhone: string;

  @Column({ name: 'guest_id_card', comment: '入住人身份证(AES加密)', length: 200, nullable: true })
  guestIdCard: string;

  @Column({ name: 'check_in_code', comment: '入住码', length: 64, nullable: true })
  checkInCode: string;
}
