import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 第三方账号绑定 —— 对齐 DDL `usr_oauth`
 */
@Entity('usr_oauth')
export class UserWxEntity extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'provider', comment: '渠道 WECHAT_MINI/WECHAT_MP/WECHAT_APP', length: 20 })
  provider: string;

  @Index()
  @Column({ name: 'openid', comment: 'openid', length: 64 })
  openid: string;

  @Index()
  @Column({ name: 'unionid', comment: 'unionid', length: 64, nullable: true })
  unionid: string;

  @Column({ name: 'nickname', comment: '昵称快照', length: 100, nullable: true })
  nickName: string;

  @Column({ name: 'avatar', comment: '头像快照', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ comment: '性别 0-未知 1-男 2-女', default: 0 })
  gender: number;

  @Column({ comment: '语言', nullable: true })
  language: string;

  @Column({ comment: '城市', nullable: true })
  city: string;

  @Column({ comment: '省份', nullable: true })
  province: string;

  @Column({ comment: '国家', nullable: true })
  country: string;

  @Column({ comment: '类型 0-小程序 1-公众号 2-H5 3-APP', default: 0 })
  type: number;
}
