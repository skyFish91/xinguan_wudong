import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 商品规格
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_sku' })
export class PrdSku {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'goods_id', type: 'bigint', unsigned: true, nullable: false })
  goodsId: number;

  @Column({ name: 'sku_code', type: 'varchar', length: 50, nullable: false })
  skuCode: string;

  /** 如 银饰-手镯-中号 */
  @Column({ name: 'spec_name', type: 'varchar', length: 200, nullable: false })
  specName: string;

  /** 售价（分） */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  @Column({ name: 'market_price', type: 'int', unsigned: true, nullable: false })
  marketPrice: number;

  @Column({ name: 'stock', type: 'int', nullable: false })
  stock: number;

  /** 预警库存 */
  @Column({ name: 'warn_stock', type: 'int', nullable: false })
  warnStock: number;

  @Column({ name: 'image', type: 'varchar', length: 500, nullable: true })
  image: string;

  /** 乐观锁 */
  @Column({ name: 'version', type: 'int', nullable: false })
  version: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
