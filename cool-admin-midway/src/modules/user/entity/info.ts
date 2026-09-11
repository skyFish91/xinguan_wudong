import { WudongBaseEntity } from '../../base/entity/wudong-base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 用户主表 —— 对齐设计文档 DDL `usr_user`
 */
@Entity('usr_user')
export class UserInfoEntity extends WudongBaseEntity {
  @Index({ unique: true })
  @Column({ name: 'uuid', comment: '对外暴露的用户标识', length: 32, nullable: true })
  unionid: string;

  @Column({ name: 'avatar', comment: '头像URL', length: 500, default: '' })
  avatarUrl: string;

  @Column({ name: 'nickname', comment: '昵称', length: 50, default: '' })
  nickName: string;

  @Index({ unique: true })
  @Column({ name: 'phone', comment: '手机号', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password', comment: '密码（md5加密）', length: 100, nullable: true })
  password: string;

  @Column({ name: 'gender', comment: '性别 0未知/1男/2女', type: 'tinyint', default: 0 })
  gender: number;

  @Column({ name: 'status', comment: '状态 0禁用/1启用', type: 'tinyint', default: 1 })
  status: number;

  @Column({ name: 'bio', comment: '个人简介', length: 200, default: '' })
  description: string;

  @Index()
  @Column({ name: 'role', comment: '角色 USER/MERCHANT/ADMIN', length: 20, default: 'USER' })
  role: string;

  @Column({ name: 'region', comment: '地区', length: 100, default: '' })
  region: string;

  @Column({ name: 'mute_until', comment: '禁言到期时间', type: 'datetime', nullable: true })
  muteUntil: Date;

  @Column({ name: 'violation_cnt', comment: '违规次数，累计3次自动禁言24小时', default: 0 })
  violationCnt: number;

  @Column({ name: 'last_login_at', comment: '最后登录时间', type: 'datetime', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', comment: '最后登录IP', length: 50, nullable: true })
  lastLoginIp: string;

  @Index()
  @Column({ name: 'deleted_at', comment: '软删时间', type: 'datetime', nullable: true })
  deletedAt: Date;
}
