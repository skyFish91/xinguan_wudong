import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 权限
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_permission' })
export class SysPermission {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: false })
  parentId: number;

  /** 菜单/按钮名 */
  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  /** 权限标识 */
  @Column({ name: 'code', type: 'varchar', length: 100, nullable: false })
  code: string;

  /** 1菜单 2按钮 3接口 */
  @Column({ name: 'type', type: 'tinyint', nullable: false })
  type: number;

  /** 前端路由 */
  @Column({ name: 'path', type: 'varchar', length: 200, nullable: true })
  path: string;

  @Column({ name: 'icon', type: 'varchar', length: 50, nullable: true })
  icon: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
