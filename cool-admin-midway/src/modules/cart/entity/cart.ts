import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车主表（设计文档 §9，每用户一行）
 */
@Entity('ord_cart')
export class CartEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '用户ID' })
  userId: number;
}
