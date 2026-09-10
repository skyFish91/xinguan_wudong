import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { RouteEntity } from '../entity/route.entity';
import { RouteDayEntity } from '../entity/route-day.entity';

@Provide()
export class RouteService {
  @InjectEntityModel(RouteEntity)
  routeRepo: Repository<RouteEntity>;

  @InjectEntityModel(RouteDayEntity)
  routeDayRepo: Repository<RouteDayEntity>;

  /**
   * 分页查询路线列表
   */
  async list(page = 1, size = 10, filters?: { theme?: string; days?: number; status?: number }) {
    const where: any = { deleted_at: IsNull() };
    if (filters?.theme) {
      where.theme = filters.theme;
    }
    if (filters?.days) {
      where.days = filters.days;
    }
    if (filters?.status !== undefined) {
      where.status = filters.status;
    } else {
      where.status = 1; // 默认只查上架
    }

    const [list, total] = await this.routeRepo.findAndCount({
      where,
      skip: (page - 1) * size,
      take: size,
      order: { id: 'DESC' },
    });

    return { list, total, page, size };
  }

  /**
   * 获取路线详情（含每日行程）
   */
  async getById(id: number) {
    const route = await this.routeRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });

    if (!route) {
      return null;
    }

    const days = await this.routeDayRepo.find({
      where: { route_id: id },
      order: { day_no: 'ASC' },
    });

    return { ...route, days };
  }

  /**
   * 创建路线（含每日行程）
   */
  async create(routeData: Partial<RouteEntity>, daysData: Partial<RouteDayEntity>[]) {
    const route = this.routeRepo.create(routeData);
    const savedRoute = await this.routeRepo.save(route);

    if (daysData && daysData.length > 0) {
      const days = daysData.map(d =>
        this.routeDayRepo.create({
          ...d,
          route_id: savedRoute.id,
        })
      );
      await this.routeDayRepo.save(days);
    }

    return this.getById(savedRoute.id);
  }

  /**
   * 更新路线
   */
  async update(id: number, data: Partial<RouteEntity>) {
    await this.routeRepo.update({ id, deleted_at: IsNull() }, data);
    return this.getById(id);
  }

  /**
   * 软删除路线
   */
  async delete(id: number) {
    await this.routeRepo.update({ id }, { deleted_at: new Date() });
  }
}
