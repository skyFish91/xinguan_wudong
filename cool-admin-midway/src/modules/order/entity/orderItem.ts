import { WudongBaseEntityNoUpdate } from '../../base/entity/wudong-base-noupdate';
import { Column, Entity, Index } from 'typeorm';

/**
 * 订单明细行 —— 对齐 DDL `ord_order_item`（无 update_time）
 * 下单即快照，后续改价/下架不影响历史订单。
 */
@Entity('ord_order_item')
export class OrderItemEntity extends WudongBaseEntityNoUpdate {
  @Index()
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'item_type', comment: '明细类型 GOODS/SEAT/STAY/TICKET/ROUTE', length: 20 })
  itemType: string;

  @Column({ name: 'ref_id', comment: '商品/资源ID', nullable: true })
  refId: number;

  @Column({ name: 'title', comment: '名称快照', length: 200 })
  title: string;

  @Column({ name: 'sku_desc', comment: '规格快照', length: 200, nullable: true })
  skuDesc: string;

  @Column({ name: 'cover', comment: '图片快照', length: 500, nullable: true })
  cover: string;

  @Column({ name: 'price', comment: '单价(分)', type: 'int', unsigned: true })
  price: number;

  @Column({ name: 'quantity', comment: '数量', type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'amount', comment: '小计(分)', type: 'int', unsigned: true, default: 0 })
  amount: number;
}
