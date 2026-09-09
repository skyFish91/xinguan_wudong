import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 话题关注（设计文档 §26.3）
 */
@Entity('note_topic_follow')
@Index(['userId', 'topicId'], { unique: true })
export class NoteTopicFollowEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '话题ID' })
  topicId: number;
}
