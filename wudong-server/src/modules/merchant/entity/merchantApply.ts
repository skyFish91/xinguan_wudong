import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商家入驻申请 —— 对齐 DDL `mch_merchant_apply`
 */
@Entity('mch_merchant_apply')
export class MerchantApplyEntity extends WudongBaseEntity {
  @Index()
  @Column({ name: 'user_id', comment: '申请人用户ID' })
  userId: number;

  @Column({ name: 'module', comment: '申请板块 GOODS/FOOD/STAY/TRAVEL', length: 20, default: '' })
  bizScopes: string;

  @Column({ name: 'shop_name', comment: '店铺名称', length: 100 })
  name: string;

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

  @Column({ name: 'status', comment: '状态 0待审 1通过 2驳回', default: 0 })
  status: number;

  @Column({ name: 'audit_user_id', comment: '审核人', nullable: true })
  auditUserId: number;

  @Column({ name: 'audit_remark', comment: '审核意见', length: 255, nullable: true })
  auditRemark: string;

  @Column({ name: 'audit_time', comment: '审核时间', type: 'datetime', nullable: true })
  auditTime: Date;
}
