import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 用户关注关系
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_follow' })
export class NoteFollow {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 关注者 */
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  /** 被关注者 */
  @Column({ name: 'follow_uid', type: 'bigint', unsigned: true, nullable: false })
  followUid: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
