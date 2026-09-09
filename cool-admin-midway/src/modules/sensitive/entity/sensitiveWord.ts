import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 敏感词库（设计文档 §12、§16）
 */
@Entity('sys_sensitive_word')
export class SensitiveWordEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '敏感词', length: 100 })
  word: string;

  @Column({ comment: '级别 1替换 2审核 3禁言', default: 1 })
  level: number;

  @Column({ comment: '状态 0停用 1启用', default: 1 })
  status: number;
}
