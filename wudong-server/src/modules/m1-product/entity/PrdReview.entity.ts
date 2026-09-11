import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 商品评价
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_review' })
export class PrdReview {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId: number;

  @Column({ name: 'order_no', type: 'varchar', length: 32, nullable: true })
  orderNo: string;

  @Column({ name: 'goods_id', type: 'bigint', unsigned: true, nullable: false })
  goodsId: number;

  @Column({ name: 'sku_id', type: 'bigint', unsigned: true, nullable: true })
  skuId: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'rating', type: 'tinyint', nullable: false })
  rating: number;

  @Column({ name: 'content', type: 'varchar', length: 1000, nullable: true })
  content: string;

  /** 追评 */
  @Column({ name: 'append_content', type: 'varchar', length: 1000, nullable: true })
  appendContent: string;

  @Column({ name: 'append_time', type: 'datetime', nullable: true })
  appendTime: Date;

  @Column({ name: 'merchant_reply', type: 'varchar', length: 500, nullable: true })
  merchantReply: string;

  @Column({ name: 'reply_time', type: 'datetime', nullable: true })
  replyTime: Date;

  @Column({ name: 'is_anonymous', type: 'tinyint', nullable: false })
  isAnonymous: number;

  /** 1显示 2隐藏 3待审核 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
