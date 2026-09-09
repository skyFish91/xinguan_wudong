import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 敏感词
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_sensitive_word' })
export class SysSensitiveWord {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'word', type: 'varchar', length: 100, nullable: false })
  word: string;

  /** 1提示 2替换 3拦截 */
  @Column({ name: 'level', type: 'tinyint', nullable: false })
  level: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
