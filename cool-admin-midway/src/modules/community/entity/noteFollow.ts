import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户关注关系（设计文档 §26.3）
 * follower_id 关注 user_id
 */
@Entity('note_follow')
@Index(['followerId', 'userId'], { unique: true })
export class NoteFollowEntity extends BaseEntity {
  @Index()
  @Column({ comment: '被关注用户ID' })
  userId: number;

  @Index()
  @Column({ comment: '关注者ID' })
  followerId: number;
}
