import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_ticket_type')
export class TicketTypeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '所属景区' })
  scenic_id: number;

  @Column({ type: 'varchar', length: 100, comment: '票种名' })
  name: string;

  @Column({ type: 'int', unsigned: true, comment: '现价（分）' })
  price: number;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '门市价（分）' })
  market_price: number;

  @Column({ type: 'varchar', length: 255, default: '', comment: '有效期规则' })
  valid_rule: string;

  @Column({ type: 'tinyint', default: 0, comment: '是否需身份证：0 否 1 是' })
  need_id_card: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 上架 2 下架' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true, comment: '软删除时间' })
  deleted_at: Date;
}
