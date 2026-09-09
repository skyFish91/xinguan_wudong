import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 菜品
 *
 * 【自动生成】由 tools/gen_entities.py 从 DDL 生成，请勿手动修改。
 * 改表结构请改 docs/database/*.sql 后重跑：python tools/gen_entities.py
 */
@Entity({ name: 'food_dish' })
export class FoodDish {

  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'restaurant_id', type: 'bigint', unsigned: true, nullable: false })
  restaurantId: number;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false })
  name: string;

  /** （分） */
  @Column({ name: 'price', type: 'int', unsigned: true, nullable: false })
  price: number;

  @Column({ name: 'image', type: 'varchar', length: 500, nullable: true })
  image: string;

  @Column({ name: 'intro', type: 'varchar', length: 500, nullable: true })
  intro: string;

  /** 是否招牌 */
  @Column({ name: 'is_signature', type: 'tinyint', nullable: false })
  isSignature: number;

  @Column({ name: 'sort', type: 'int', nullable: false })
  sort: number;

  @Column({ name: 'status', type: 'tinyint', nullable: false })
  status: number;
}
