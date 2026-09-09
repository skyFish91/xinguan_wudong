import { transformerJson } from '../../base/entity/base';
import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 门票 / 线路订单扩展 —— 对齐 DDL `ord_ext_ticket`（行）
 */
@Entity('ord_ext_ticket')
export class OrderExtTicketEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_id', comment: '订单ID' })
  orderId: number;

  @Index()
  @Column({ name: 'order_no', comment: '订单号', length: 32 })
  orderNo: string;

  @Column({ name: 'target_type', comment: 'SCENIC/ROUTE', length: 16, nullable: true })
  targetType: string;

  @Column({ name: 'target_id', comment: '景区/线路ID', nullable: true })
  targetId: number;

  @Column({ name: 'scenic_id', comment: '所属景区ID', nullable: true })
  scenicId: number;

  @Column({ name: 'use_date', comment: '使用/出发日期', length: 10, nullable: true })
  useDate: string;

  @Column({ name: 'people_cnt', comment: '人数', type: 'int', default: 1 })
  peopleCnt: number;

  @Column({
    name: 'travelers',
    comment: '游客信息 JSON 数组',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  travelers: any[];

  @Index()
  @Column({ name: 'verify_code', comment: '核销码', length: 64, nullable: true })
  verifyCode: string;

  @Column({ name: 'qrcode', comment: '核销二维码URL', length: 500, nullable: true })
  qrcode: string;

  @Column({ name: 'verify_status', comment: '核销状态 0未核销 1已核销', default: 0 })
  verifyStatus: number;

  @Column({ name: 'verify_time', comment: '核销时间', type: 'datetime', nullable: true })
  verifyTime: Date;

  @Column({ name: 'verify_user', comment: '核销人', length: 32, nullable: true })
  verifyUser: string;
}
