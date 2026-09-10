import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_route')
export class RouteEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '路线标题' })
  title: string;

  @Column({ type: 'tinyint', default: 1, comment: '天数' })
  days: number;

  @Column({ type: 'int', unsigned: true, comment: '起价（分）' })
  price: number;

  @Column({ type: 'json', nullable: true, comment: '包含项目' })
  includes: string[];

  @Column({ type: 'varchar', length: 100, default: '', comment: '出发地' })
  departure: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: '目的地' })
  destination: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: '住宿标准' })
  hotel_standard: string;

  @Column({ type: 'varchar', length: 100, default: '', comment: '餐饮标准' })
  meal_standard: string;

  @Column({ type: 'text', nullable: true, comment: '注意事项' })
  notes: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '主图 URL' })
  main_image: string;

  @Column({ type: 'text', nullable: true, comment: '详情富文本' })
  detail: string;

  @Column({ type: 'varchar', length: 50, default: '', comment: '主题' })
  theme: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 上架 2 下架' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true, comment: '软删除时间' })
  deleted_at: Date;
}
