import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 非遗传承人
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'prd_craftsman' })
export class PrdCraftsman {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  /** 姓名 */
  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ name: 'avatar', type: 'varchar', length: 500, nullable: true })
  avatar: string;

  /** 称号 */
  @Column({ name: 'title', type: 'varchar', length: 100, nullable: true })
  title: string;

  /** 工艺：银饰锻造/蜡染/刺绣 */
  @Column({ name: 'craft', type: 'varchar', length: 50, nullable: true })
  craft: string;

  /** 从业年限 */
  @Column({ name: 'years', type: 'int', nullable: true })
  years: number;

  @Column({ name: 'intro', type: 'text', nullable: true })
  intro: string;

  /** 传承故事 */
  @Column({ name: 'story', type: 'text', nullable: true })
  story: string;

  /** 1展示 2隐藏 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
