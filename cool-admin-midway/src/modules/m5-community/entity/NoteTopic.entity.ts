import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 话题
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_topic' })
export class NoteTopic {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'cover', type: 'varchar', length: 500, nullable: true })
  cover: string;

  @Column({ name: 'description', type: 'varchar', length: 300, nullable: true })
  description: string;

  @Column({ name: 'post_count', type: 'int', nullable: false })
  postCount: number;

  @Column({ name: 'follow_count', type: 'int', nullable: false })
  followCount: number;

  @Column({ name: 'view_count', type: 'int', nullable: false })
  viewCount: number;

  @Column({ name: 'is_recommend', type: 'tinyint', nullable: false })
  isRecommend: number;

  @Column({ name: 'is_top', type: 'tinyint', nullable: false })
  isTop: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
