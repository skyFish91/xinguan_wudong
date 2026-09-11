import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 举报（设计文档 §26.3）
 */
@Entity('note_report')
export class NoteReportEntity extends BaseEntity {
  @Index()
  @Column({ comment: '举报用户ID' })
  userId: number;

  @Column({ comment: '举报目标类型 POST/COMMENT', length: 16 })
  targetType: string;

  @Index()
  @Column({ comment: '举报目标ID' })
  targetId: number;

  @Column({ comment: '举报原因', type: 'text' })
  reason: string;

  @Column({ comment: '处理状态 0待处理 1已处理 2已驳回', default: 0 })
  status: number;

  @Column({ comment: '处理结果', type: 'text', nullable: true })
  handleResult: string;

  @Column({ comment: '处理人ID', nullable: true })
  handleBy: number;

  @Column({ comment: '处理时间', type: 'varchar', nullable: true })
  handleTime: string;
}
