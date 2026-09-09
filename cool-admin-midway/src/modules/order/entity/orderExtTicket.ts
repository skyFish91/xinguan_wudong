import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 门票/路线扩展（设计文档 §8.1、§25）：行写
 */
@Entity('ord_ext_ticket')
export class OrderExtTicketEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '使用/出发日期', length: 10, nullable: true })
  useDate: string;

  @Column({ comment: '游客信息 JSON 数组', type: 'json', nullable: true })
  travelers: any[];

  @Column({ comment: '核销码', length: 64, nullable: true })
  verifyCode: string;
}
