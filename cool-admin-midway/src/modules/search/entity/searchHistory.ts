import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 搜索历史（设计文档 §12，用户级）
 */
@Entity('sys_search_history')
export class SearchHistoryEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '关键词', length: 100 })
  keyword: string;

  @Column({ comment: '搜索板块 product/food/stay/travel/note', length: 32, nullable: true })
  module: string;
}
