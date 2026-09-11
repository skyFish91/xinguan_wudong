import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 评论（设计文档 §26.3，支持二级）
 * root_id 冗余根评论ID，便于查整棵树
 */
@Entity('note_comment')
export class NoteCommentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '游记ID' })
  postId: number;

  @Index()
  @Column({ comment: '评论用户ID' })
  userId: number;

  @Column({ comment: '评论内容', length: 500 })
  content: string;

  @Column({ comment: '父评论ID，一级评论为0', default: 0 })
  parentId: number;

  @Column({ comment: '回复目标用户ID', nullable: true })
  replyToUserId: number;

  @Index()
  @Column({ comment: '根评论ID（冗余，便于查整棵树）', nullable: true })
  rootId: number;

  @Column({ comment: '点赞数', default: 0 })
  likeCount: number;

  @Column({ comment: '状态 1正常 2已删除', default: 1 })
  status: number;
}
