import { PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * 业务实体基类（无 update_time 版）
 *
 * 用于 DDL 中只有 create_time、没有 update_time 的「只增不改」表，
 * 例如订单明细、订单日志、第三方绑定、点赞/评论/收藏等。
 */
export abstract class WudongBaseEntityNoUpdate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键ID' })
  id: number;

  @Index()
  @Column({ name: 'create_time', type: 'datetime', nullable: true, comment: '创建时间' })
  createTime: Date;
}
