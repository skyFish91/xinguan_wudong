import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 设施字典
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_facility' })
export class StyFacility {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 设施名称 */
  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  /** 图标 URL */
  @Column({ name: 'icon', type: 'varchar', length: 200, nullable: true })
  icon: string;

  /** 1民宿设施 2房型设施 */
  @Column({ name: 'type', type: 'tinyint', nullable: false })
  type: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;
}
