import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 搜索历史
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_search_history' })
export class SysSearchHistory {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: false })
  userId: number;

  @Column({ name: 'keyword', type: 'varchar', length: 100, nullable: false })
  keyword: string;

  /** 搜索范围 ALL/PRODUCT/FOOD/STAY/TRAVEL/NOTE */
  @Column({ name: 'scope', type: 'varchar', length: 20, nullable: false })
  scope: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;
}
