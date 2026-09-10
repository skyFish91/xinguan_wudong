import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户关注关系（设计文档 §26.3）
 * user_id 关注 follow_user_id
 */
@Entity('note_follow')
@Index(['userId', 'followUserId'], { unique: true })
export class NoteFollowEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', comment: '关注者ID' })
  userId: number;

  @Index()
  @Column({ name: 'follow_user_id', comment: '被关注用户ID' })
  followUserId: number;
}
