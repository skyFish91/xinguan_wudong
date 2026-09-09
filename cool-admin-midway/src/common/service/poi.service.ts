import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { FoodRestaurant } from '../../modules/m2-food/entity/FoodRestaurant.entity';
import { StyHomestay } from '../../modules/m3-stay/entity/StyHomestay.entity';
import { TvlScenic } from '../../modules/m4-travel/entity/TvlScenic.entity';
import { PoiType } from '../constants/biz-type';

export interface PoiInfo {
  title: string;
  cover: string;
  poiType: string;
  poiId: number;
}

/**
 * POI 服务（设计文档 §24.8）
 *
 * 社区游记只存 poi_type + poi_id，展示名称时统一走这里。
 * 查不到返回 null，**不抛异常**，避免某板块数据缺失导致整个游记页挂掉。
 *
 * 注意：这里直接查各板块的表（Entity），而不是 import 板块的 Service —— 遵守「禁止跨板块 import Service」红线。
 */
@Provide()
export class PoiService {
  @InjectEntityModel(FoodRestaurant)
  restaurantModel: Repository<FoodRestaurant>;

  @InjectEntityModel(StyHomestay)
  homestayModel: Repository<StyHomestay>;

  @InjectEntityModel(TvlScenic)
  scenicModel: Repository<TvlScenic>;

  /** 取 POI 名称与封面 */
  async getName(
    poiType: string,
    poiId: number
  ): Promise<PoiInfo | null> {
    if (!poiType || !poiId) return null;
    try {
      switch (String(poiType)) {
        case PoiType.RESTAURANT: {
          const r = await this.restaurantModel.findOne({ where: { id: poiId } });
          return r
            ? { title: r.name, cover: (r as any).mainImage || '', poiType, poiId }
            : null;
        }
        case PoiType.STAY: {
          const h = await this.homestayModel.findOne({ where: { id: poiId } });
          return h
            ? { title: h.name, cover: (h as any).mainImage || '', poiType, poiId }
            : null;
        }
        case PoiType.SCENIC: {
          const s = await this.scenicModel.findOne({ where: { id: poiId } });
          return s
            ? { title: s.name, cover: (s as any).mainImage || '', poiType, poiId }
            : null;
        }
        default:
          return null;
      }
    } catch {
      return null;
    }
  }

  /** 批量取，供列表页一次性补齐，避免 N+1 */
  async getNameBatch(
    list: { poiType: string; poiId: number }[]
  ): Promise<Record<string, PoiInfo | null>> {
    const result: Record<string, PoiInfo | null> = {};
    for (const item of list) {
      result[`${item.poiType}:${item.poiId}`] = await this.getName(
        item.poiType,
        item.poiId
      );
    }
    return result;
  }
}
