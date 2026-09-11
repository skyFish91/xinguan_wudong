import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_review')
export class ReviewEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'bigint', unsigned: true, comment: '评价用户' })
  user_id: number;

  @Column({ type: 'varchar', length: 16, comment: '评价对象：SCENIC 景区 / ROUTE 路线' })
  target_type: string;

  @Column({ type: 'bigint', unsigned: true, comment: '景区 id 或 路线 id' })
  target_id: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true, comment: '关联订单' })
  order_id: number;

  @Column({ type: 'tinyint', comment: '评分 1-5' })
  rating: number;

  @Column({ type: 'varchar', length: 1000, default: '', comment: '评价内容' })
  content: string;

  @Column({ type: 'json', nullable: true, comment: '图片 URL 数组' })
  images: string[];

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 正常 2 隐藏' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true, comment: '软删除时间' })
  deleted_at: Date;
}
