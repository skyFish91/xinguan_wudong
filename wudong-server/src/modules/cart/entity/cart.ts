import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车主表 —— 对齐 DDL `ord_cart`（每用户一行）
 */
@Entity('ord_cart')
export class CartEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;
}
