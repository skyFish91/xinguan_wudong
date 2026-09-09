import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 点赞（设计文档 §26.3，多态：游记 / 评论）
 * 唯一索引防重复点赞
 */
@Entity('note_like')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class NoteLikeEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '目标类型 POST/COMMENT', length: 16 })
  targetType: string;

  @Index()
  @Column({ comment: '目标ID' })
  targetId: number;
}
