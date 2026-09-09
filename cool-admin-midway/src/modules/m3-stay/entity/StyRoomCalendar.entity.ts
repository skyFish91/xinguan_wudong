import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 房态日历
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_room_calendar' })
export class StyRoomCalendar {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'room_type_id', type: 'bigint', unsigned: true, nullable: false })
  roomTypeId: number;

  @Column({ name: 'date', type: 'date', nullable: false })
  date: Date;

  /** 当日可售房量 */
  @Column({ name: 'total', type: 'int', nullable: false })
  total: number;

  /** 已售 */
  @Column({ name: 'sold', type: 'int', nullable: false })
  sold: number;

  /** 当日价（分），支持动态定价 */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  /** 1可订 2满房 3停售 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  /** 乐观锁 */
  @Column({ name: 'version', type: 'int', nullable: false })
  version: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
