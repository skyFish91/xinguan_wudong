import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 农产品商品
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'farm_goods' })
export class FarmGoods {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: true })
  merchantId: number;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true, nullable: false })
  categoryId: number;

  @Column({ name: 'name', type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  /** （分） */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  @Column({ name: 'market_price', type: 'int', unsigned: true, nullable: false })
  marketPrice: number;

  /** 规格，如 500g/袋 */
  @Column({ name: 'spec', type: 'varchar', length: 100, nullable: true })
  spec: string;

  @Column({ name: 'stock', type: 'int', nullable: false })
  stock: number;

  @Column({ name: 'version', type: 'int', nullable: false })
  version: number;

  /** 产地 */
  @Column({ name: 'origin', type: 'varchar', length: 200, nullable: true })
  origin: string;

  /** 原产地溯源 */
  @Column({ name: 'origin_detail', type: 'text', nullable: true })
  originDetail: string;

  /** 保质期 */
  @Column({ name: 'shelf_life', type: 'varchar', length: 50, nullable: true })
  shelfLife: string;

  @Column({ name: 'storage', type: 'varchar', length: 100, nullable: true })
  storage: string;

  @Column({ name: 'detail', type: 'text', nullable: true })
  detail: string;

  @Column({ name: 'freight_template_id', type: 'bigint', unsigned: true, nullable: true })
  freightTemplateId: number;

  @Column({ name: 'sales', type: 'int', nullable: false })
  sales: number;

  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
