import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 电子票
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_e_ticket' })
export class TvlETicket {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: false })
  orderId: number;

  @Column({ name: 'order_no', type: 'varchar', length: 64, nullable: false })
  orderNo: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  /** TICKET 票种 / ROUTE 路线 */
  @Column({ name: 'target_type', type: 'varchar', length: 20, nullable: false })
  targetType: string;

  @Column({ name: 'target_id', type: 'bigint', unsigned: true, nullable: false })
  targetId: number;

  @Column({ name: 'target_name', type: 'varchar', length: 200, nullable: true })
  targetName: string;

  /** 使用 / 出发日期 */
  @Column({ name: 'use_date', type: 'date', nullable: false })
  useDate: Date;

  @Column({ name: 'quantity', type: 'int', nullable: false })
  quantity: number;

  /** 核销码（唯一索引） */
  @Column({ name: 'verify_code', type: 'varchar', length: 32, nullable: false })
  verifyCode: string;

  /** 二维码图片 URL */
  @Column({ name: 'qrcode', type: 'varchar', length: 500, nullable: true })
  qrcode: string;

  /** 0未使用 1已使用 2已退款 3已过期 */
  @Column({ name: 'verify_status', type: 'tinyint', nullable: false })
  verifyStatus: number;

  @Column({ name: 'verify_time', type: 'datetime', nullable: true })
  verifyTime: Date;

  @Column({ name: 'verify_user', type: 'varchar', length: 50, nullable: true })
  verifyUser: string;

  /** 游客信息 [{name,idCard}] */
  @Column({ name: 'travelers', type: 'json', nullable: true })
  travelers: any;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
