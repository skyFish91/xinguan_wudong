import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 民宿
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_homestay' })
export class StyHomestay {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: true })
  merchantId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  /** 民宿图集 */
  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'address', type: 'varchar', length: 300, nullable: true })
  address: string;

  /** 经度 */
  @Column({ name: 'lng', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lng: number;

  /** 纬度 */
  @Column({ name: 'lat', type: 'decimal', precision: 10, scale: 7, nullable: true })
  lat: number;

  /** 风格标签，如["吊脚楼"]["观景"] */
  @Column({ name: 'style_tags', type: 'json', nullable: true })
  styleTags: any;

  /** 设施标签 ID 数组 */
  @Column({ name: 'facility_tags', type: 'json', nullable: true })
  facilityTags: any;

  @Column({ name: 'intro', type: 'text', nullable: true })
  intro: string;

  /** 起价（分），由房型最低价同步 */
  @Column({ name: 'min_price', type: 'int', unsigned: true, nullable: false })
  minPrice: number;

  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  /** 1营业 2休息 3下线 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
