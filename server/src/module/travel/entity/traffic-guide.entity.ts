import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_traffic_guide')
export class TrafficGuideEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '出发地' })
  from_city: string;

  @Column({ type: 'varchar', length: 20, comment: '交通方式' })
  transport_type: string;

  @Column({ type: 'varchar', length: 50, default: '', comment: '时长说明' })
  duration: string;

  @Column({ type: 'int', unsigned: true, nullable: true, comment: '参考费用（分）' })
  cost: number;

  @Column({ type: 'text', nullable: true, comment: '详细攻略' })
  content: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 上架 2 下架' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true, comment: '软删除时间' })
  deleted_at: Date;
}
