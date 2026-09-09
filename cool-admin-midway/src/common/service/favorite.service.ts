import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SysFavorite } from '../../modules/common/entity/SysFavorite.entity';
import { PoiService } from './poi.service';
import { FavoriteTargetType } from '../constants/biz-type';

export interface FavoriteItem {
  targetType: string;
  targetId: number;
  /** 标题快照，避免每次回查业务表 */
  title?: string;
  cover?: string;
  createTime?: Date;
}

/**
 * 统一收藏服务（设计文档 §11）
 *
 * targetType ∈ PRODUCT / FARM / RESTAURANT / STAY / SCENIC / ROUTE / NOTE
 * 多态关联，不建外键。
 */
@Provide()
export class FavoriteService {
  @InjectEntityModel(SysFavorite)
  favModel: Repository<SysFavorite>;

  @Inject()
  poiService: PoiService;

  /** 收藏 / 取消收藏，返回操作后状态 */
  async toggle(param: {
    userId: number;
    targetType: FavoriteTargetType | string;
    targetId: number;
  }): Promise<{ favorited: boolean }> {
    const exist = await this.favModel.findOne({
      where: {
        userId: param.userId,
        targetType: String(param.targetType),
        targetId: param.targetId,
      },
    });
    if (exist) {
      await this.favModel.remove(exist);
      return { favorited: false };
    }
    const fav = this.favModel.create({
      userId: param.userId,
      targetType: String(param.targetType),
      targetId: param.targetId,
    });
    await this.favModel.save(fav);
    return { favorited: true };
  }

  /** 是否已收藏 */
  async isFavorited(
    userId: number,
    targetType: string,
    targetId: number
  ): Promise<boolean> {
    const count = await this.favModel.count({
      where: { userId, targetType, targetId },
    });
    return count > 0;
  }

  /** 我的收藏列表，可按类型过滤 */
  async list(param: {
    userId: number;
    targetType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: FavoriteItem[]; total: number }> {
    const page = Math.max(1, Number(param.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(param.pageSize) || 10));

    const qb = this.favModel.createQueryBuilder('f');
    qb.where('f.user_id = :userId', { userId: param.userId });
    if (param.targetType) {
      qb.andWhere('f.target_type = :targetType', { targetType: param.targetType });
    }
    const [rows, total] = await qb
      .orderBy('f.create_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // 名称与封面交给 PoiService 解析，查不到返回 null 不报错
    const list: FavoriteItem[] = [];
    for (const row of rows) {
      const poi = await this.poiService.getName(row.targetType, row.targetId);
      list.push({
        targetType: row.targetType,
        targetId: row.targetId,
        title: poi?.title || '',
        cover: poi?.cover || '',
        createTime: (row as any).createTime,
      });
    }
    return { list, total };
  }

  /** 收藏数（供详情页展示） */
  async countByTarget(targetType: string, targetId: number): Promise<number> {
    return this.favModel.count({ where: { targetType, targetId } });
  }
}
