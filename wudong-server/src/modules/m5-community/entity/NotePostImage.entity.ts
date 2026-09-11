import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 游记图片
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'note_post_image' })
export class NotePostImage {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'post_id', type: 'bigint', unsigned: true, nullable: false })
  postId: number;

  @Column({ name: 'url', type: 'varchar', length: 500, nullable: false })
  url: string;

  @Column({ name: 'width', type: 'int', nullable: true })
  width: number;

  @Column({ name: 'height', type: 'int', nullable: true })
  height: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;
}
