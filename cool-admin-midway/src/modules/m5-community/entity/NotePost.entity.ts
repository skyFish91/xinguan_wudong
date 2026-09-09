import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 游记
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_post' })
export class NotePost {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'title', type: 'varchar', length: 100, nullable: false })
  title: string;

  /** 正文，≤5000 字 */
  @Column({ name: 'content', type: 'varchar', length: 5000, nullable: false })
  content: string;

  /** 短视频（≤60s） */
  @Column({ name: 'video_url', type: 'varchar', length: 500, nullable: true })
  videoUrl: string;

  /** 封面图 */
  @Column({ name: 'cover', type: 'varchar', length: 500, nullable: true })
  cover: string;

  /** 关联地点类型 RESTAURANT/STAY/SCENIC */
  @Column({ name: 'poi_type', type: 'varchar', length: 20, nullable: true })
  poiType: string;

  /** 关联地点 ID（不建外键） */
  @Column({ name: 'poi_id', type: 'bigint', unsigned: true, nullable: true })
  poiId: number;

  /** 关联地点名称（冗余） */
  @Column({ name: 'poi_name', type: 'varchar', length: 100, nullable: true })
  poiName: string;

  /** 话题 ID 数组 */
  @Column({ name: 'topic_ids', type: 'json', nullable: true })
  topicIds: any;

  @Column({ name: 'like_count', type: 'int', nullable: false })
  likeCount: number;

  @Column({ name: 'comment_count', type: 'int', nullable: false })
  commentCount: number;

  @Column({ name: 'favorite_count', type: 'int', nullable: false })
  favoriteCount: number;

  @Column({ name: 'view_count', type: 'int', nullable: false })
  viewCount: number;

  @Column({ name: 'share_count', type: 'int', nullable: false })
  shareCount: number;

  /** 是否首页推荐（后台手动设置） */
  @Column({ name: 'is_recommend', type: 'tinyint', nullable: false })
  isRecommend: number;

  @Column({ name: 'is_top', type: 'tinyint', nullable: false })
  isTop: number;

  @Column({ name: 'report_count', type: 'int', nullable: false })
  reportCount: number;

  /** 1正常 2审核中 3已下架 4已删除 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  /** 0待审 1机审通过 2人工通过 3拒绝 */
  @Column({ name: 'audit_status', type: 'tinyint', nullable: false })
  auditStatus: number;

  @Column({ name: 'reject_reason', type: 'varchar', length: 200, nullable: true })
  rejectReason: string;

  @Column({ name: 'audit_time', type: 'datetime', nullable: true })
  auditTime: Date;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
