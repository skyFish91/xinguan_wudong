import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 住宿扩展（设计文档 §8.1、§24）：住写
 */
@Entity('ord_ext_stay')
export class OrderExtStayEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '入住日期', length: 10 })
  checkIn: string;

  @Column({ comment: '离店日期', length: 10 })
  checkOut: string;

  @Column({ comment: '晚数', type: 'int', default: 1 })
  nights: number;

  @Column({ comment: '房间数', type: 'int', default: 1 })
  roomCnt: number;

  @Column({ comment: '入住人姓名', length: 50, nullable: true })
  guestName: string;

  @Column({ comment: '入住人身份证(AES加密)', length: 200, nullable: true })
  guestIdCard: string;

  @Column({ comment: '入住码', length: 64, nullable: true })
  checkInCode: string;
}
