import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 实物扩展（设计文档 §8.1）：衣、食(农产品特产)写
 */
@Entity('ord_ext_goods')
export class OrderExtGoodsEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '订单ID' })
  orderId: number;

  @Column({ comment: '收货人', length: 50, nullable: true })
  receiverName: string;

  @Column({ comment: '收货手机号', length: 20, nullable: true })
  receiverPhone: string;

  @Column({ comment: '收货地址', length: 500, nullable: true })
  receiverAddress: string;

  @Column({ comment: '物流公司', length: 50, nullable: true })
  logisticsCompany: string;

  @Column({ comment: '物流单号', length: 100, nullable: true })
  logisticsNo: string;

  @Column({ comment: '发货时间', type: 'varchar', length: 20, nullable: true })
  shipTime: string;

  @Column({ comment: '收货时间', type: 'varchar', length: 20, nullable: true })
  receiveTime: string;
}
