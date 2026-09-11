import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TrafficGuideEntity } from '../entity/traffic-guide.entity';

@Provide()
export class TrafficGuideService {
  @InjectEntityModel(TrafficGuideEntity)
  trafficGuideRepo: Repository<TrafficGuideEntity>;

  /**
   * 查询交通攻略列表（支持出发地筛选）
   */
  async list(fromCity?: string) {
    const where: any = { deleted_at: IsNull(), status: 1 };
    if (fromCity) {
      where.from_city = fromCity;
    }

    return this.trafficGuideRepo.find({
      where,
      order: { sort: 'ASC', id: 'ASC' },
    });
  }

  /**
   * 创建交通攻略
   */
  async create(data: Partial<TrafficGuideEntity>) {
    const guide = this.trafficGuideRepo.create(data);
    return this.trafficGuideRepo.save(guide);
  }

  /**
   * 更新交通攻略
   */
  async update(id: number, data: Partial<TrafficGuideEntity>) {
    await this.trafficGuideRepo.update({ id, deleted_at: IsNull() }, data);
    return this.trafficGuideRepo.findOne({ where: { id } });
  }

  /**
   * 软删除交通攻略
   */
  async delete(id: number) {
    await this.trafficGuideRepo.update({ id }, { deleted_at: new Date() });
  }
}
