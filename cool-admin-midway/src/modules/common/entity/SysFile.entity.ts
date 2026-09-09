import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 上传文件
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sys_file' })
export class SysFile {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  /** 原始文件名 */
  @Column({ name: 'file_name', type: 'varchar', length: 200, nullable: false })
  fileName: string;

  /** 存储路径 */
  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: false })
  filePath: string;

  /** 访问URL */
  @Column({ name: 'url', type: 'varchar', length: 500, nullable: false })
  url: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true })
  mimeType: string;

  /** 字节 */
  @Column({ name: 'file_size', type: 'int', unsigned: true, nullable: false })
  fileSize: number;

  /** IMAGE/VIDEO */
  @Column({ name: 'file_type', type: 'varchar', length: 20, nullable: false })
  fileType: string;

  @Column({ name: 'width', type: 'int', nullable: true })
  width: number;

  @Column({ name: 'height', type: 'int', nullable: true })
  height: number;

  /** 视频时长（秒） */
  @Column({ name: 'duration', type: 'int', nullable: true })
  duration: number;

  /** 1通过 2待审核 3拒绝 */
  @Column({ name: 'audit_status', type: 'tinyint', nullable: false })
  auditStatus: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt: Date;
}
