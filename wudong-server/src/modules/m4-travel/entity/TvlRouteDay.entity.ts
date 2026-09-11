import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 路线行程安排
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_route_day' })
export class TvlRouteDay {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'route_id', type: 'bigint', unsigned: true, nullable: false })
  routeId: number;

  /** 第几天，从 1 开始 */
  @Column({ name: 'day_no', type: 'tinyint', nullable: false })
  dayNo: number;

  @Column({ name: 'title', type: 'varchar', length: 200, nullable: true })
  title: string;

  /** 当日概述 */
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  /** 景点数组 */
  @Column({ name: 'spots', type: 'json', nullable: true })
  spots: any;

  /** 含餐 早/中/晚 */
  @Column({ name: 'meals', type: 'varchar', length: 200, nullable: true })
  meals: string;

  /** 住宿 */
  @Column({ name: 'accommodation', type: 'varchar', length: 200, nullable: true })
  accommodation: string;

  /** 交通方式 */
  @Column({ name: 'transport', type: 'varchar', length: 200, nullable: true })
  transport: string;
}
