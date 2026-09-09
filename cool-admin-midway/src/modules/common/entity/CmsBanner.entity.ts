import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 首页轮播
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'cms_banner' })
export class CmsBanner {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 100, nullable: false })
  title: string;

  @Column({ name: 'image', type: 'varchar', length: 500, nullable: false })
  image: string;

  /** NONE/PRODUCT/STAY/ROUTE/NOTE/URL */
  @Column({ name: 'link_type', type: 'varchar', length: 20, nullable: true })
  linkType: string;

  @Column({ name: 'link_value', type: 'varchar', length: 500, nullable: true })
  linkValue: string;

  /** HOME/MINI/PC */
  @Column({ name: 'position', type: 'varchar', length: 20, nullable: false })
  position: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @Column({ name: 'start_time', type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
