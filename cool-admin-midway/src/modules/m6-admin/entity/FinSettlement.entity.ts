import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 结算单
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'fin_settlement' })
export class FinSettlement {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 结算单号 JS+yyyyMMdd+序号 */
  @Column({ name: 'settlement_no', type: 'varchar', length: 64, nullable: false })
  settlementNo: string;

  @Column({ name: 'merchant_id', type: 'bigint', unsigned: true, nullable: false })
  merchantId: number;

  /** 商家名称（冗余） */
  @Column({ name: 'merchant_name', type: 'varchar', length: 100, nullable: true })
  merchantName: string;

  /** 结算周期开始 */
  @Column({ name: 'period_start', type: 'date', nullable: false })
  periodStart: Date;

  /** 结算周期结束 */
  @Column({ name: 'period_end', type: 'date', nullable: false })
  periodEnd: Date;

  /** 订单数 */
  @Column({ name: 'order_count', type: 'int', nullable: false })
  orderCount: number;

  /** 订单总额（分） */
  @Column({ name: 'total_amount', type: 'int', unsigned: true, nullable: false })
  totalAmount: number;

  /** 退款金额（分） */
  @Column({ name: 'refund_amount', type: 'int', unsigned: true, nullable: false })
  refundAmount: number;

  /** 平台抽佣（分） */
  @Column({ name: 'commission', type: 'int', unsigned: true, nullable: false })
  commission: number;

  /** 应付商家（分） */
  @Column({ name: 'payable', type: 'int', nullable: false })
  payable: number;

  /** 1待结算 2已结算 3已取消 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @Column({ name: 'settle_time', type: 'datetime', nullable: true })
  settleTime: Date;

  /** 操作人 */
  @Column({ name: 'operator', type: 'varchar', length: 50, nullable: true })
  operator: string;

  @Column({ name: 'remark', type: 'varchar', length: 300, nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
