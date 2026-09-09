import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 话题（设计文档 §26.3）
 */
@Entity('note_topic')
export class NoteTopicEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '话题名', length: 100 })
  name: string;

  @Column({ comment: '话题头图', length: 500, nullable: true })
  cover: string;

  @Column({ comment: '话题简介', type: 'text', nullable: true })
  intro: string;

  @Column({ comment: '游记数', default: 0 })
  postCount: number;

  @Column({ comment: '关注数', default: 0 })
  followCount: number;

  @Column({ comment: '是否推荐 0否 1是', default: 0 })
  isRecommend: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '状态 1启用 0停用', default: 1 })
  status: number;
}
