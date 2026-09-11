import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 商品主表
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_goods' })
export class PrdGoods {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: true })
  merchantId: number;

  /** 二级分类 */
  @Column({ name: 'category_id', type: 'bigint', unsigned: true, nullable: false })
  categoryId: number;

  @Column({ name: 'craftsman_id', type: 'bigint', unsigned: true, nullable: true })
  craftsmanId: number;

  @Column({ name: 'title', type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ name: 'subtitle', type: 'varchar', length: 300, nullable: true })
  subtitle: string;

  @Column({ name: 'main_image', type: 'varchar', length: 500, nullable: true })
  mainImage: string;

  /** 最低SKU价（分） */
  @Column({ name: 'min_price', type: 'int', unsigned: true, nullable: false })
  minPrice: number;

  /** 最高SKU价（分） */
  @Column({ name: 'max_price', type: 'int', unsigned: true, nullable: false })
  maxPrice: number;

  /** 市场价（分） */
  @Column({ name: 'market_price', type: 'int', unsigned: true, nullable: false })
  marketPrice: number;

  /** 总库存（冗余） */
  @Column({ name: 'total_stock', type: 'int', nullable: false })
  totalStock: number;

  @Column({ name: 'sales', type: 'int', nullable: false })
  sales: number;

  /** 评分（冗余） */
  @Column({ name: 'rating', type: 'decimal', precision: 2, scale: 1, nullable: false })
  rating: number;

  @Column({ name: 'review_count', type: 'int', nullable: false })
  reviewCount: number;

  /** 工艺介绍 */
  @Column({ name: 'craft_intro', type: 'text', nullable: true })
  craftIntro: string;

  /** 文化故事 */
  @Column({ name: 'culture_story', type: 'text', nullable: true })
  cultureStory: string;

  /** 详情富文本 */
  @Column({ name: 'detail', type: 'text', nullable: true })
  detail: string;

  @Column({ name: 'material', type: 'varchar', length: 100, nullable: true })
  material: string;

  @Column({ name: 'style', type: 'varchar', length: 100, nullable: true })
  style: string;

  @Column({ name: 'freight_template_id', type: 'bigint', unsigned: true, nullable: true })
  freightTemplateId: number;

  /** 是否支持7天无理由 */
  @Column({ name: 'support_return', type: 'tinyint', nullable: false })
  supportReturn: number;

  /** 1上架 2下架 3售罄 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
