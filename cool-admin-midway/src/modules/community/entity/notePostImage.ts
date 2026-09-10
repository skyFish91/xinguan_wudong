import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 游记图片（设计文档 §26.3，≤9 张）
 */
@Entity('note_post_image')
export class NotePostImageEntity extends BaseEntity {
  @Index()
  @Column({ comment: '游记ID' })
  postId: number;

  @Column({ comment: '图片URL', type: 'longtext' })
  imageUrl: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;
}
