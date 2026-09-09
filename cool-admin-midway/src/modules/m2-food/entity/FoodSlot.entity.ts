import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 餐位时段模板
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'food_slot' })
export class FoodSlot {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'restaurant_id', type: 'bigint', unsigned: true, nullable: false })
  restaurantId: number;

  /** 如 午餐 11:30-13:30 */
  @Column({ name: 'slot_name', type: 'varchar', length: 50, nullable: false })
  slotName: string;

  @Column({ name: 'start_time', type: 'char', length: 5, nullable: false })
  startTime: string;

  @Column({ name: 'end_time', type: 'char', length: 5, nullable: false })
  endTime: string;

  /** 该时段最大可订人数 */
  @Column({ name: 'max_seats', type: 'int', nullable: false })
  maxSeats: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;
}
