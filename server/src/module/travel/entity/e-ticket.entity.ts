import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_e_ticket')
export class ETicketEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '订单主表 id' })
  order_id: number;

  @Column({ type: 'varchar', length: 32, comment: '订单号' })
  order_no: string;

  @Column({ type: 'varchar', length: 16, comment: '类型：TICKET 门票 / ROUTE 路线' })
  target_type: string;

  @Column({ type: 'bigint', unsigned: true, comment: '票种 id 或 路线 id' })
  target_id: number;

  @Column({ type: 'date', comment: '使用/出发日期' })
  use_date: string;

  @Column({ type: 'varchar', length: 64, comment: '核销码' })
  verify_code: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '二维码图片 URL' })
  qrcode: string;

  @Column({ type: 'tinyint', default: 0, comment: '核销状态：0 未使用 1 已使用 2 已退款' })
  verify_status: number;

  @Column({ type: 'datetime', nullable: true, comment: '核销时间' })
  verify_time: Date;

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: '核销人' })
  verify_user: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;
}
