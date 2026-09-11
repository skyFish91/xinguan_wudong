import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tvl_scenic')
export class ScenicEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '景区名称' })
  name: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '景区地址' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, comment: '经度' })
  lng: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true, comment: '纬度' })
  lat: number;

  @Column({ type: 'varchar', length: 100, default: '', comment: '开放时间' })
  open_time: string;

  @Column({ type: 'text', nullable: true, comment: '景区简介' })
  intro: string;

  @Column({ type: 'varchar', length: 255, default: '', comment: '主图 URL' })
  main_image: string;

  @Column({ type: 'json', nullable: true, comment: '图片 URL 数组' })
  images: string[];

  @Column({ type: 'tinyint', default: 1, comment: '状态：1 上架 2 下架' })
  status: number;

  @CreateDateColumn({ type: 'datetime', comment: '创建时间' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime', comment: '更新时间' })
  updated_at: Date;

  @Column({ type: 'datetime', nullable: true, comment: '软删除时间' })
  deleted_at: Date;
}
