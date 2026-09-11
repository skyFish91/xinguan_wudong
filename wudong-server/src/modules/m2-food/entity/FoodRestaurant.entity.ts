import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 餐厅
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'food_restaurant' })
export class FoodRestaurant {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: true })
  merchantId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  /** 环境图数组 */
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

  /** 营业时间 */
  @Column({ name: 'open_time', type: 'varchar', length: 100, nullable: true })
  openTime: string;

  /** 容纳人数 */
  @Column({ name: 'capacity', type: 'int', nullable: false })
  capacity: number;

  /** 人均（分） */
  @Column({ name: 'avg_price', type: 'int', unsigned: true, nullable: false })
  avgPrice: number;

  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  @Column({ name: 'intro', type: 'text', nullable: true })
  intro: string;

  /** 特色标签 */
  @Column({ name: 'features', type: 'json', nullable: true })
  features: any;

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
