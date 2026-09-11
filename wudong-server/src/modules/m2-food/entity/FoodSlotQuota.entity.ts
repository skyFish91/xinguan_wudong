import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 每日时段余量
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'food_slot_quota' })
export class FoodSlotQuota {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'restaurant_id', type: 'bigint', unsigned: true, nullable: false })
  restaurantId: number;

  @Column({ name: 'slot_id', type: 'bigint', unsigned: true, nullable: false })
  slotId: number;

  @Column({ name: 'book_date', type: 'date', nullable: false })
  bookDate: Date;

  @Column({ name: 'total_seats', type: 'int', nullable: false })
  totalSeats: number;

  @Column({ name: 'used_seats', type: 'int', nullable: false })
  usedSeats: number;

  /** 乐观锁 */
  @Column({ name: 'version', type: 'int', nullable: false })
  version: number;

  /** 1可订 2已满 3停售 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
