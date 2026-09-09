import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 游记主表（设计文档 §26.3）
 * 关联地点(poi_type/poi_id)不建外键，多态关联
 */
@Entity('note_post')
@Index(['status', 'createTime'])
@Index(['likeCount', 'createTime'])
export class NotePostEntity extends BaseEntity {
  @Index()
  @Column({ comment: '作者用户ID' })
  userId: number;

  @Column({ comment: '标题', length: 200 })
  title: string;

  @Column({ comment: '正文', type: 'text' })
  content: string;

  @Column({ comment: '视频URL', length: 500, nullable: true })
  videoUrl: string;

  @Column({ comment: '封面图', length: 500, nullable: true })
  cover: string;

  @Column({ comment: '关联地点类型 RESTAURANT/STAY/SCENIC', length: 32, nullable: true })
  poiType: string;

  @Column({ comment: '关联地点ID', nullable: true })
  poiId: number;

  @Index(['poiType', 'poiId'])
  @Column({ comment: '话题ID数组(JSON)', type: 'json', nullable: true })
  topicIds: number[];

  @Column({ comment: '点赞数', default: 0 })
  likeCount: number;

  @Column({ comment: '评论数', default: 0 })
  commentCount: number;

  @Column({ comment: '收藏数', default: 0 })
  favoriteCount: number;

  @Column({ comment: '浏览数', default: 0 })
  viewCount: number;

  @Column({ comment: '状态 1正常 2审核中 3已下架 4已删除', default: 1 })
  status: number;

  @Column({ comment: '审核状态 0待审 1机审通过 2人工通过 3拒绝', default: 0 })
  auditStatus: number;

  @Column({ comment: '审核拒绝原因', length: 500, nullable: true })
  rejectReason: string;
}
