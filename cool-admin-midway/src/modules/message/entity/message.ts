import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 站内消息（设计文档 §12、§16）
 */
@Entity('sys_message')
export class MessageEntity extends BaseEntity {
  @Index()
  @Column({ comment: '接收用户ID' })
  toUserId: number;

  @Column({ comment: '类型 SYSTEM/ORDER/INTERACT', length: 16 })
  type: string;

  @Column({ comment: '标题', length: 200 })
  title: string;

  @Column({ comment: '内容', type: 'text', nullable: true })
  content: string;

  @Column({ comment: '业务ID(订单号等)', length: 64, nullable: true })
  bizId: string;

  @Column({ comment: '是否已读 0未读 1已读', default: 0 })
  isRead: number;
}
