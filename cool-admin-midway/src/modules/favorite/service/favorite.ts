import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteEntity } from '../entity/favorite';

/**
 * 统一收藏服务（设计文档 §12）
 */
@Provide()
export class FavoriteService extends BaseService {
  @InjectEntityModel(FavoriteEntity)
  favoriteEntity: Repository<FavoriteEntity>;

  async toggle(userId: number, targetType: string, targetId: number) {
    const exist = await this.favoriteEntity.findOneBy({
      userId,
      targetType,
      targetId,
    });
    if (exist) {
      await this.favoriteEntity.delete(exist.id);
      return { favorited: false };
    }
    await this.favoriteEntity.save({ userId, targetType, targetId });
    return { favorited: true };
  }

  async listByUser(userId: number, query: any) {
    const qb = this.favoriteEntity
      .createQueryBuilder('f')
      .where('f.userId = :userId', { userId });
    if (query.targetType)
      qb.andWhere('f.targetType = :targetType', { targetType: query.targetType });
    qb.orderBy('f.id', 'DESC');
    return this.entityRenderPage(qb, query);
  }
}
