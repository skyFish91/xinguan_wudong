import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 实物订单扩展 —— 对齐 DDL `ord_ext_goods`（衣、农产品特产）
 */
@Entity('ord_ext_goods')
export class OrderExtGoodsEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'consignee', comment: '收货人', length: 50, nullable: true })
  receiverName: string;

  @Column({ name: 'phone', comment: '收货手机号', length: 20, nullable: true })
  receiverPhone: string;

  @Column({ name: 'address', comment: '收货地址', length: 500, nullable: true })
  receiverAddress: string;

  @Column({ name: 'logistics_com', comment: '物流公司', length: 50, nullable: true })
  logisticsCompany: string;

  @Column({ name: 'logistics_no', comment: '物流单号', length: 100, nullable: true })
  logisticsNo: string;

  @Column({ name: 'ship_time', comment: '发货时间', type: 'datetime', nullable: true })
  shipTime: Date;

  @Column({ name: 'receive_time', comment: '收货时间', type: 'datetime', nullable: true })
  receiveTime: Date;
}
