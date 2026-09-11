import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 房型
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'sty_room_type' })
export class StyRoomType {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'homestay_id', type: 'bigint', unsigned: true, nullable: false })
  homestayId: number;

  /** 如 苗族木屋大床房 */
  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  /** 大床/双床/榻榻米 */
  @Column({ name: 'bed_type', type: 'varchar', length: 50, nullable: true })
  bedType: string;

  /** 面积 ㎡ */
  @Column({ name: 'area', type: 'int', nullable: false })
  area: number;

  /** 可住人数 */
  @Column({ name: 'max_guests', type: 'int', nullable: false })
  maxGuests: number;

  /** 房型设施 ID 数组 */
  @Column({ name: 'facilities', type: 'json', nullable: true })
  facilities: any;

  /** 基准价（分），日历无价时取此值 */
  @Column({ name: 'base_price', type: 'int', unsigned: true, nullable: false })
  basePrice: number;

  /** 物理房间数（日历总量默认值） */
  @Column({ name: 'total_rooms', type: 'int', nullable: false })
  totalRooms: number;

  @Column({ name: 'images', type: 'json', nullable: true })
  images: any;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  /** 1上架 2下架 */
  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;
}
