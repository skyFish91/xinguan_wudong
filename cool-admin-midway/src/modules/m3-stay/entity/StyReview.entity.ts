import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 民宿评价
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_review' })
export class StyReview {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'homestay_id', type: 'bigint', unsigned: true, nullable: false })
  homestayId: number;

  @Column({ name: 'room_type_id', type: 'bigint', unsigned: true, nullable: true })
  roomTypeId: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  /** 总体评分 1-5 */
  @Column({ name: 'rating', type: 'tinyint', nullable: false })
  rating: number;

  /** 分项评分 {"clean":5,"service":5,"location":4,"value":5} */
  @Column({ name: 'rating_detail', type: 'json', nullable: true })
  ratingDetail: any;

  @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
  content: string;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'is_anonymous', type: 'tinyint', nullable: false })
  isAnonymous: number;

  /** 商家回复 */
  @Column({ name: 'reply', type: 'varchar', length: 500, nullable: true })
  reply: string;

  @Column({ name: 'reply_time', type: 'datetime', nullable: true })
  replyTime: Date;

  /** 1显示 2隐藏 3待审 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
