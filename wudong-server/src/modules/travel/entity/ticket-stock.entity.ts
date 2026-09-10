import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_ticket_stock')
export class TicketStockEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '票种' })
  ticket_type_id: number;

  @Column({ type: 'date', comment: '使用日期' })
  date: string;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '当日可售票量' })
  total: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '已售数量' })
  sold: number;

  @Column({ type: 'int', unsigned: true, default: 0, comment: '乐观锁版本号' })
  version: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 可售 2 停售' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;
}
