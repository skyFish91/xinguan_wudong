import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 餐厅评价
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'food_review' })
export class FoodReview {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId: number;

  @Column({ name: 'restaurant_id', type: 'bigint', unsigned: true, nullable: false })
  restaurantId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'rating', type: 'tinyint', nullable: false })
  rating: number;

  @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
  content: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'merchant_reply', type: 'varchar', length: 500, nullable: true })
  merchantReply: string;

  @Column({ name: 'reply_time', type: 'datetime', nullable: true })
  replyTime: Date;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
