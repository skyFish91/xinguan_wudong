import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ScenicEntity } from '../entity/scenic.entity';

@Provide()
export class ScenicService {
  @InjectEntityModel(ScenicEntity)
  scenicRepo: Repository<ScenicEntity>;

  /**
   * 分页查询景区列表
   */
  async list(page = 1, size = 10, status?: number) {
    const where: any = { deleted_at: IsNull() };
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.scenicRepo.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'DESC' },
    });

    return { list, total, page, size };
  }

  /**
   * 根据 ID 获取景区详情
   */
  async getById(id: number) {
    return this.scenicRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }

  /**
   * 创建景区
   */
  async create(data: Partial<ScenicEntity>) {
    const scenic = this.scenicRepo.create(data);
    return this.scenicRepo.save(scenic);
  }

  /**
   * 更新景区
   */
  async update(id: number, data: Partial<ScenicEntity>) {
    await this.scenicRepo.update({ id, deleted_at: IsNull() }, data);
    return this.getById(id);
  }

  /**
   * 软删除景区
   */
  async delete(id: number) {
    await this.scenicRepo.update({ id }, { deleted_at: new Date() });
  }
}
