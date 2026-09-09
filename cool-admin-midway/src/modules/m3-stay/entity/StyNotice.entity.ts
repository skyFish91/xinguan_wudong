import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 入住须知
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_notice' })
export class StyNotice {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'homestay_id', type: 'bigint', unsigned: true, nullable: false })
  homestayId: number;

  /** 入住时间 */
  @Column({ name: 'check_in_time', type: 'varchar', length: 50, nullable: true })
  checkInTime: string;

  /** 离店时间 */
  @Column({ name: 'check_out_time', type: 'varchar', length: 50, nullable: true })
  checkOutTime: string;

  /** 宠物政策 */
  @Column({ name: 'pet_policy', type: 'varchar', length: 200, nullable: true })
  petPolicy: string;

  /** 是否含早 */
  @Column({ name: 'has_breakfast', type: 'tinyint', nullable: false })
  hasBreakfast: number;

  /** 押金（分） */
  @Column({ name: 'deposit', type: 'int', unsigned: true, nullable: false })
  deposit: number;

  /** 其他规则 */
  @Column({ name: 'extra_rules', type: 'text', nullable: true })
  extraRules: string;

  /** 取消政策说明 */
  @Column({ name: 'cancel_rule', type: 'text', nullable: true })
  cancelRule: string;
}
