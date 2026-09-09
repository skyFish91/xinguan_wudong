import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 农产品分类
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'farm_category' })
export class FarmCategory {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'icon', type: 'varchar', length: 500, nullable: true })
  icon: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;
}
