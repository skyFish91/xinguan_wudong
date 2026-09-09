import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 商品分类
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_category' })
export class PrdCategory {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 上级ID，一级为0 */
  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, nullable: false })
  parentId: number;

  /** 分类名 */
  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'icon', type: 'varchar', length: 500, nullable: true })
  icon: string;

  /** 1一级 2二级 */
  @Column({ name: 'level', type: 'tinyint', nullable: false })
  level: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  /** 1启用 2停用 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
