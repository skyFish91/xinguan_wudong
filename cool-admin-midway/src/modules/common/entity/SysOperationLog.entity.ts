import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 操作日志（保留1年）
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_operation_log' })
export class SysOperationLog {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'operator_id', type: 'bigint', unsigned: true, nullable: true })
  operatorId: number;

  @Column({ name: 'operator_name', type: 'varchar', length: 50, nullable: true })
  operatorName: string;

  /** ADMIN/MERCHANT/USER/SYSTEM */
  @Column({ name: 'operator_type', type: 'varchar', length: 20, nullable: true })
  operatorType: string;

  @Column({ name: 'module', type: 'varchar', length: 50, nullable: true })
  module: string;

  @Column({ name: 'action', type: 'varchar', length: 100, nullable: true })
  action: string;

  @Column({ name: 'target', type: 'varchar', length: 200, nullable: true })
  target: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content: string;

  @Column({ name: 'ip', type: 'varchar', length: 50, nullable: true })
  ip: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
