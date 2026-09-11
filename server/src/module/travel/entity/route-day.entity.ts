import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_route_day')
export class RouteDayEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '所属路线' })
  route_id: number;

  @Column({ type: 'tinyint', comment: '第几天' })
  day_no: number;

  @Column({ type: 'text', nullable: true, comment: '当日行程描述' })
  description: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '当日景点' })
  spots: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '当日用餐' })
  meals: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '当日住宿' })
  accommodation: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '当日交通' })
  transport: string;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;
}
