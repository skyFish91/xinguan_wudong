import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 角色-权限
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_role_permission' })
export class SysRolePermission {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'role_id', type: 'bigint', unsigned: true, nullable: false })
  roleId: number;

  @Column({ name: 'permission_id', type: 'bigint', unsigned: true, nullable: false })
  permissionId: number;
}
