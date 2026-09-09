import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 评论
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_comment' })
export class NoteComment {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'post_id', type: 'bigint', unsigned: true, nullable: false })
  postId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'content', type: 'varchar', length: 500, nullable: false })
  content: string;

  /** 一级评论为 0 */
  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: false })
  parentId: number;

  /** @ 谁 */
  @Column({ name: 'reply_to_user_id', type: 'bigint', unsigned: true, nullable: true })
  replyToUserId: number;

  /** 根评论 ID，便于查整棵树 */
  @Column({ name: 'root_id', type: 'bigint', unsigned: true, nullable: false })
  rootId: number;

  @Column({ name: 'like_count', type: 'int', nullable: false })
  likeCount: number;

  /** 1正常 2已删除 3待审 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
