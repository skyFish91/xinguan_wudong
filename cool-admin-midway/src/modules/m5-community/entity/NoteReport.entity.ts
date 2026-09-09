import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 举报
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_report' })
export class NoteReport {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 举报人 */
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  /** POST / COMMENT */
  @Column({ name: 'target_type', type: 'varchar', length: 20, nullable: false })
  targetType: string;

  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: false })
  targetId: number;

  /** 垃圾广告/色情低俗/侵权/不实信息/其他 */
  @Column({ name: 'reason_type', type: 'varchar', length: 30, nullable: false })
  reasonType: string;

  @Column({ name: 'reason', type: 'varchar', length: 300, nullable: true })
  reason: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  /** 0待处理 1已处理 2已驳回 */
  @Column({ name: 'handle_status', type: 'tinyint', nullable: false })
  handleStatus: number;

  @Column({ name: 'handle_result', type: 'varchar', length: 200, nullable: true })
  handleResult: string;

  @Column({ name: 'handle_user', type: 'varchar', length: 50, nullable: true })
  handleUser: string;

  @Column({ name: 'handle_time', type: 'datetime', nullable: true })
  handleTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
