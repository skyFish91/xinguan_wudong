import { PrimaryGeneratedColumn, Column, Index } from 'typeorm';

/**
 * 业务实体基类（乌东平台）
 *
 * 与 Cool 的 BaseEntity 区别：**不含 tenantId**。
 * 业务表由设计文档 DDL 权威管理（synchronize 已关闭），字段只有
 * id / create_time / update_time + 业务列，没有租户列。
 *
 * 继承本基类的实体，属性名保持 camelCase，列名统一 snake_case，
 * 与 docs/database/*.sql 完全对齐。
 */
export abstract class WudongBaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true, comment: '主键ID' })
  id: number;

  @Index()
  @Column({ name: 'create_time', type: 'datetime', nullable: true, comment: '创建时间' })
  createTime: Date;

  @Index()
  @Column({ name: 'update_time', type: 'datetime', nullable: true, comment: '更新时间' })
  updateTime: Date;
}
