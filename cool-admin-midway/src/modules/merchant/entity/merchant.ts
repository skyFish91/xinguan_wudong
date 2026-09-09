import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 商家（设计文档 §7.3、§16 公共表清单）
 */
@Entity('mch_merchant')
export class MerchantEntity extends BaseEntity {
  @Column({ comment: '商家名称', length: 100 })
  name: string;

  @Index()
  @Column({ comment: '负责人用户ID(关联 user_info)', nullable: true })
  ownerUserId: number;

  @Column({ comment: '联系人', length: 50, nullable: true })
  contact: string;

  @Column({ comment: '联系电话', length: 20, nullable: true })
  phone: string;

  @Column({ comment: '经营板块,逗号分隔 GOODS/FOOD/STAY/TRAVEL', length: 100, nullable: true })
  bizScopes: string;

  @Column({ comment: '商家简介', type: 'text', nullable: true })
  intro: string;

  @Column({
    comment: '资质材料,JSON 文件URL数组',
    type: 'json',
    transformer: transformerJson,
    nullable: true,
  })
  qualifications: string[];

  @Column({ comment: '状态 0待审 1正常 2禁用', default: 1 })
  status: number;
}
