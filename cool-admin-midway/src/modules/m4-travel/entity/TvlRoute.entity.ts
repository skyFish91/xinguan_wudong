import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 路线套餐
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_route' })
export class TvlRoute {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'title', type: 'varchar', length: 200, nullable: false })
  title: string;

  /** 行程天数 */
  @Column({ name: 'days', type: 'tinyint', nullable: false })
  days: number;

  /** 亲子/摄影/研学/节庆 */
  @Column({ name: 'theme', type: 'varchar', length: 30, nullable: true })
  theme: string;

  /** 成人价（分） */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  /** 儿童价（分） */
  @Column({ name: 'child_price', type: 'int', unsigned: true, nullable: false })
  childPrice: number;

  /** 包含项目 ["门票","午餐","导览"] */
  @Column({ name: 'includes', type: 'json', nullable: true })
  includes: any;

  /** 集合地点 */
  @Column({ name: 'departure', type: 'varchar', length: 200, nullable: true })
  departure: string;

  /** 目的地 */
  @Column({ name: 'destination', type: 'varchar', length: 200, nullable: true })
  destination: string;

  /** 住宿标准（文字描述，本期不打通住板块） */
  @Column({ name: 'hotel_standard', type: 'varchar', length: 200, nullable: true })
  hotelStandard: string;

  /** 餐饮标准（文字描述） */
  @Column({ name: 'meal_standard', type: 'varchar', length: 200, nullable: true })
  mealStandard: string;

  /** 注意事项 */
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  @Column({ name: 'detail', type: 'text', nullable: true })
  detail: string;

  @Column({ name: 'sold_count', type: 'int', nullable: false })
  soldCount: number;

  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  /** 1上架 2下架 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
