import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 运费模板
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_freight_template' })
export class PrdFreightTemplate {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: true })
  merchantId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  /** 1按件 2按重 */
  @Column({ name: 'charge_type', type: 'tinyint', nullable: false })
  chargeType: number;

  @Column({ name: 'base_count', type: 'int', nullable: false })
  baseCount: number;

  /** 首重/首件费用（分） */
  @Column({ name: 'base_fee', type: 'int', unsigned: true, nullable: false })
  baseFee: number;

  @Column({ name: 'add_count', type: 'int', nullable: false })
  addCount: number;

  /** 续重/续件费用（分） */
  @Column({ name: 'add_fee', type: 'int', unsigned: true, nullable: false })
  addFee: number;

  /** 包邮门槛（分），0=不包邮 */
  @Column({ name: 'free_threshold', type: 'int', unsigned: true, nullable: false })
  freeThreshold: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
