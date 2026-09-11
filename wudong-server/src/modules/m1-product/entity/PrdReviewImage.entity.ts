import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 评价图片
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_review_image' })
export class PrdReviewImage {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'review_id', type: 'bigint', unsigned: true, nullable: false })
  reviewId: number;

  @Column({ name: 'url', type: 'varchar', length: 500, nullable: false })
  url: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;
}
