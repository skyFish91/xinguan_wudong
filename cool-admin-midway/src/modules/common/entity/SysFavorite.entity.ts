import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 统一收藏
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_favorite' })
export class SysFavorite {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  /** PRODUCT/FARM/RESTAURANT/STAY/SCENIC/ROUTE/NOTE */
  @Column({ name: 'target_type', type: 'varchar', length: 20, nullable: false })
  targetType: string;

  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: false })
  targetId: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
