import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商家入驻申请（设计文档 §16、§27.4）
 * 审核工作流在管理后台模块实现，这里只提供实体与 CRUD。
 */
@Entity('mch_merchant_apply')
export class MerchantApplyEntity extends BaseEntity {
  @Index()
  @Column({ comment: '申请人用户ID' })
  userId: number;

  @Column({ comment: '商家名称', length: 100 })
  name: string;

  @Column({ comment: '联系人', length: 50, nullable: true })
  contact: string;

  @Column({ comment: '联系电话', length: 20, nullable: true })
  phone: string;

  @Column({ comment: '申请板块,逗号分隔', length: 100, nullable: true })
  bizScopes: string;

  @Column({
    comment: '资质材料,JSON 文件URL数组',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  qualifications: string[];

  @Column({ comment: '状态 0待审 1通过 2驳回', default: 0 })
  status: number;

  @Column({ comment: '审核意见', type: 'text', nullable: true })
  auditRemark: string;
}
