import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 推荐位
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'cms_recommend' })
export class CmsRecommend {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 推荐位编码，如 home_hot */
  @Column({ name: 'position', type: 'varchar', length: 50, nullable: false })
  position: string;

  @Column({ name: 'title', type: 'varchar', length: 100, nullable: true })
  title: string;

  /** PRODUCT/FARM/RESTAURANT/STAY/SCENIC/ROUTE/NOTE */
  @Column({ name: 'target_type', type: 'varchar', length: 20, nullable: false })
  targetType: string;

  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: false })
  targetId: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
