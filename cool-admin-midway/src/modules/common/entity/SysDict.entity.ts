import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 数据字典
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_dict' })
export class SysDict {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'dict_type', type: 'varchar', length: 50, nullable: false })
  dictType: string;

  @Column({ name: 'dict_code', type: 'varchar', length: 50, nullable: false })
  dictCode: string;

  @Column({ name: 'dict_value', type: 'varchar', length: 100, nullable: false })
  dictValue: string;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'remark', type: 'varchar', length: 200, nullable: true })
  remark: string;
}
