import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单明细行（设计文档 §17.3，下单快照，防改价）
 */
@Entity('ord_order_item')
export class OrderItemEntity extends BaseEntity {
  @Index()
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '商品/资源ID', nullable: true })
  targetId: number;

  @Column({ comment: 'SKU/规格ID', nullable: true })
  skuId: number;

  @Column({ comment: '名称快照', length: 200 })
  name: string;

  @Column({ comment: '规格快照', length: 200, nullable: true })
  skuName: string;

  @Column({ comment: '单价(分)', type: 'int', unsigned: true })
  price: number;

  @Column({ comment: '数量', type: 'int', default: 1 })
  quantity: number;

  @Column({ comment: '图片', nullable: true })
  imageUrl: string;
}
