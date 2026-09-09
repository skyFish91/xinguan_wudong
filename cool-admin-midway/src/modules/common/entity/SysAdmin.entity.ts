import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 管理员
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_admin' })
export class SysAdmin {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'username', type: 'varchar', length: 50, nullable: false })
  username: string;

  /** bcrypt */
  @Column({ name: 'password', type: 'varchar', length: 100, nullable: false })
  password: string;

  @Column({ name: 'real_name', type: 'varchar', length: 50, nullable: false })
  realName: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string;

  /** 1启用 2禁用 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  /** 1超管，拥有全部权限 */
  @Column({ name: 'is_super', type: 'tinyint', nullable: false })
  isSuper: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', type: 'varchar', length: 50, nullable: true })
  lastLoginIp: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
