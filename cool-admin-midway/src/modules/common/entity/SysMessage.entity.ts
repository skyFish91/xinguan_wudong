import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 站内消息
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_message' })
export class SysMessage {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** NULL = 全员消息 */
  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  /** SYSTEM/ORDER/INTERACT */
  @Column({ name: 'msg_type', type: 'varchar', length: 20, nullable: false })
  msgType: string;

  @Column({ name: 'title', type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content: string;

  /** 关联业务类型 */
  @Column({ name: 'biz_type', type: 'varchar', length: 20, nullable: true })
  bizType: string;

  /** 关联业务ID */
  @Column({ name: 'biz_id', type: 'bigint', unsigned: true, nullable: true })
  bizId: number;

  @Column({ name: 'is_read', type: 'tinyint', nullable: false })
  isRead: number;

  @Column({ name: 'read_time', type: 'datetime', nullable: true })
  readTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
