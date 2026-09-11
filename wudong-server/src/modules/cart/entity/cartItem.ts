import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 购物车明细 —— 对齐 DDL `ord_cart_item`
 * item_type 区分 PRODUCT（非遗商品）/ FARM（农产品）
 */
@Entity('ord_cart_item')
export class CartItemEntity extends WudongBaseEntity {
  @Index()
  @Column({ name: 'cart_id', comment: '购物车ID' })
  cartId: number;

  @Index()
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'item_type', comment: '条目类型 PRODUCT/FARM', length: 16 })
  itemType: string;

  @Column({ name: 'ref_id', comment: '商品/特产ID' })
  targetId: number;

  @Column({ name: 'sku_id', comment: 'SKU/规格ID', nullable: true })
  skuId: number;

  @Column({ name: 'title', comment: '名称快照', length: 200, default: '' })
  title: string;

  @Column({ name: 'cover', comment: '图片快照', length: 500, nullable: true })
  cover: string;

  @Column({ name: 'sku_desc', comment: '规格快照', length: 200, nullable: true })
  skuDesc: string;

  @Column({ name: 'price', comment: '单价快照(分)', type: 'int', unsigned: true, default: 0 })
  price: number;

  @Column({ name: 'quantity', comment: '数量', type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'checked', comment: '是否勾选 0否 1是', default: 1 })
  checked: number;

  @Column({ name: 'invalid', comment: '是否失效（下架/改价）0否 1是', default: 0 })
  invalid: number;
}
