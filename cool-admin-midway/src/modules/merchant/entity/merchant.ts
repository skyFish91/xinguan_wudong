import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商家 —— 对齐 DDL `mch_merchant`（设计文档 §7.3）
 */
@Entity('mch_merchant')
export class MerchantEntity extends WudongBaseEntity {
  @Index()
  @Column({ name: 'user_id', comment: '负责人用户ID(关联 usr_user)', nullable: true })
  ownerUserId: number;

  @Column({ name: 'module', comment: '经营板块 GOODS/FOOD/STAY/TRAVEL', length: 20, default: '' })
  bizScopes: string;

  @Column({ name: 'shop_name', comment: '店铺名称', length: 100 })
  name: string;

  @Column({ name: 'shop_logo', comment: '店铺Logo', length: 500, nullable: true })
  shopLogo: string;

  @Column({ name: 'contact_name', comment: '联系人', length: 50, nullable: true })
  contact: string;

  @Column({ name: 'contact_phone', comment: '联系电话', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'id_card_no', comment: '身份证号(AES加密)', length: 200, nullable: true })
  idCardNo: string;

  @Column({ name: 'license_no', comment: '营业执照号', length: 100, nullable: true })
  licenseNo: string;

  @Column({ name: 'qualification', comment: '资质材料(JSON文件URL数组)', type: 'text', nullable: true })
  qualifications: string;

  @Column({ name: 'status', comment: '状态 0待审 1正常 2禁用', default: 1 })
  status: number;

  @Column({
    name: 'commission_rate',
    comment: '平台抽成比例 0~1',
    type: 'decimal',
    precision: 4,
    scale: 3,
    default: 0,
  })
  commissionRate: number;

  @Column({ name: 'settle_cycle', comment: '结算周期(天)', type: 'int', default: 7 })
  settleCycle: number;

  @Column({ name: 'enter_time', comment: '入驻时间', type: 'datetime', nullable: true })
  enterTime: Date;

  @Index()
  @Column({ name: 'deleted_at', comment: '软删时间', type: 'datetime', nullable: true })
  deletedAt: Date;
}
