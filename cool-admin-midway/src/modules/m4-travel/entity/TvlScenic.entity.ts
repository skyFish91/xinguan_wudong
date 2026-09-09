import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 景区
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_scenic' })
export class TvlScenic {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'address', type: 'varchar', length: 300, nullable: true })
  address: string;

  @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng: number;

  @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  /** 开放时间 */
  @Column({ name: 'open_time', type: 'varchar', length: 100, nullable: true })
  openTime: string;

  @Column({ name: 'intro', type: 'text', nullable: true })
  intro: string;

  /** 购票须知 */
  @Column({ name: 'notice', type: 'text', nullable: true })
  notice: string;

  /** 景区等级 */
  @Column({ name: 'level', type: 'varchar', length: 20, nullable: true })
  level: string;

  /** 起价（分），由票种同步 */
  @Column({ name: 'min_price', type: 'int', unsigned: true, nullable: false })
  minPrice: number;

  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  /** 累计销量 */
  @Column({ name: 'sold_count', type: 'int', nullable: false })
  soldCount: number;

  /** 1开放 2闭园 3下线 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
