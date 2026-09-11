import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 票种按日期库存
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_ticket_stock' })
export class TvlTicketStock {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'ticket_type_id', type: 'bigint', unsigned: true, nullable: false })
  ticketTypeId: number;

  @Column({ name: 'date', type: 'date', nullable: false })
  date: Date;

  /** 当日总票量 */
  @Column({ name: 'total', type: 'int', nullable: false })
  total: number;

  /** 已售 */
  @Column({ name: 'sold', type: 'int', nullable: false })
  sold: number;

  /** 乐观锁 */
  @Column({ name: 'version', type: 'int', nullable: false })
  version: number;

  /** 1可售 2售罄 3停售 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
