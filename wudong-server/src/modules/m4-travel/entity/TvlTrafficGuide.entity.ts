import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 交通攻略
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'tvl_traffic_guide' })
export class TvlTrafficGuide {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 出发地 贵阳/凯里/广州 */
  @Column({ name: 'from_city', type: 'varchar', length: 50, nullable: false })
  fromCity: string;

  /** 高铁/自驾/大巴/飞机+包车 */
  @Column({ name: 'way', type: 'varchar', length: 30, nullable: false })
  way: string;

  /** 耗时 */
  @Column({ name: 'duration', type: 'varchar', length: 50, nullable: true })
  duration: string;

  /** 费用区间（文本） */
  @Column({ name: 'cost', type: 'varchar', length: 50, nullable: true })
  cost: string;

  /** 路线详情 */
  @Column({ name: 'detail', type: 'text', nullable: true })
  detail: string;

  @Column({ name: 'tips', type: 'varchar', length: 500, nullable: true })
  tips: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
