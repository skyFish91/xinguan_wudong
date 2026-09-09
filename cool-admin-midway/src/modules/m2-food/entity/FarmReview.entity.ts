import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 农产品评价
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'farm_review' })
export class FarmReview {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId: number;

  @Column({ name: 'goods_id', type: 'bigint', unsigned: true, nullable: false })
  goodsId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'rating', type: 'tinyint', nullable: false })
  rating: number;

  @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
  content: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'reply', type: 'varchar', length: 500, nullable: true })
  reply: string;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
