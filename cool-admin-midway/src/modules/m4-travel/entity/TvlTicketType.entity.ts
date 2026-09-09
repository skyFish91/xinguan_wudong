import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 票种
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_ticket_type' })
export class TvlTicketType {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'scenic_id', type: 'bigint', unsigned: true, nullable: false })
  scenicId: number;

  /** 成人票/儿童票/学生票/家庭套票 */
  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  /** 售价（分） */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  /** 门市价（分） */
  @Column({ name: 'market_price', type: 'int', unsigned: true, nullable: false })
  marketPrice: number;

  /** 有效期规则 */
  @Column({ name: 'valid_rule', type: 'varchar', length: 200, nullable: true })
  validRule: string;

  /** 是否需身份证 */
  @Column({ name: 'need_id_card', type: 'tinyint', nullable: false })
  needIdCard: number;

  /** 最少购买张数 */
  @Column({ name: 'min_buy', type: 'int', nullable: false })
  minBuy: number;

  /** 最多购买张数 */
  @Column({ name: 'max_buy', type: 'int', nullable: false })
  maxBuy: number;

  @Column({ name: 'description', type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;
}
