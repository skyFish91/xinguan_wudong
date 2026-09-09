import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 结算明细
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'fin_settlement_item' })
export class FinSettlementItem {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'settlement_id', type: 'bigint', unsigned: true, nullable: false })
  settlementId: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: false })
  orderId: number;

  @Column({ name: 'order_no', type: 'varchar', length: 64, nullable: false })
  orderNo: string;

  /** GOODS/SEAT/STAY/TICKET/ROUTE */
  @Column({ name: 'biz_type', type: 'varchar', length: 20, nullable: false })
  bizType: string;

  @Column({ name: 'goods_name', type: 'varchar', length: 200, nullable: true })
  goodsName: string;

  /** 订单金额（分） */
  @Column({ name: 'amount', type: 'int', unsigned: true, nullable: false })
  amount: number;

  /** 抽佣（分） */
  @Column({ name: 'commission', type: 'int', unsigned: true, nullable: false })
  commission: number;

  /** 应付（分） */
  @Column({ name: 'payable', type: 'int', unsigned: true, nullable: false })
  payable: number;

  /** 订单支付时间 */
  @Column({ name: 'pay_time', type: 'datetime', nullable: true })
  payTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
