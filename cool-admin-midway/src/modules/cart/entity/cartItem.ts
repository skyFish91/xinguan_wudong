import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车明细（设计文档 §9，item_type 区分 PRODUCT/FARM）
 */
@Entity('ord_cart_item')
export class CartItemEntity extends BaseEntity {
  @Index()
  @Column({ comment: '购物车ID' })
  cartId: number;

  @Column({ comment: '条目类型 PRODUCT/FARM', length: 16 })
  itemType: string;

  @Column({ comment: '商品/特产ID' })
  targetId: number;

  @Column({ comment: 'SKU/规格ID', nullable: true })
  skuId: number;

  @Column({ comment: '数量', type: 'int', default: 1 })
  quantity: number;
}
