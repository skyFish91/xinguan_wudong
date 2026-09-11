import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 收藏（设计文档 §12、§17.4）
 * user_id + target_type + target_id 联合唯一，多态关联不建外键。
 */
@Entity('sys_favorite')
@Index(['userId', 'targetType', 'targetId'], { unique: true })
export class FavoriteEntity extends BaseEntity {
  @Column({ comment: '用户ID' })
  userId: number;

  @Column({ comment: '目标类型 PRODUCT/FARM/RESTAURANT/STAY/SCENIC/ROUTE/NOTE', length: 32 })
  targetType: string;

  @Column({ comment: '目标ID' })
  targetId: number;
}
