import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Entity, Column, Index } from 'typeorm';

/**
 * 收货地址 —— 对齐 DDL `usr_user_address`
 *
 * 注意：属性名保留 cool 生态习惯（contact / address），
 * 实际列按 DDL 为 consignee / detail。
 */
@Entity('usr_user_address')
export class UserAddressEntity extends WudongBaseEntity {
  @Index()
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'consignee', comment: '收货人', length: 50 })
  contact: string;

  @Index()
  @Column({ name: 'phone', comment: '手机号', length: 20 })
  phone: string;

  @Column({ name: 'province', comment: '省', length: 50, default: '' })
  province: string;

  @Column({ name: 'city', comment: '市', length: 50, default: '' })
  city: string;

  @Column({ name: 'district', comment: '区', length: 50, default: '' })
  district: string;

  @Column({ name: 'detail', comment: '详细地址', length: 255, default: '' })
  address: string;

  @Column({ name: 'is_default', comment: '是否默认', default: 0 })
  isDefault: number;

  @Column({ name: 'deleted_at', comment: '软删时间', type: 'datetime', nullable: true })
  deletedAt: Date;
}
