import { Provide, Inject } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In } from 'typeorm';
import { FavoriteEntity } from '../entity/favorite';
import { NotePostEntity } from '../../community/entity/notePost';

/**
 * 统一收藏服务（设计文档 §12）
 */
@Provide()
export class FavoriteService extends BaseService {
  @InjectEntityModel(FavoriteEntity)
  favoriteEntity: Repository<FavoriteEntity>;

  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

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
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;
    const targetType = query.targetType || 'NOTE';

    const [favorites, total] = await this.favoriteEntity.findAndCount({
      where: { userId, targetType },
      order: { createTime: 'DESC' },
      skip,
      take: size,
    });

    // 如果是收藏游记，获取游记的完整信息
    if (targetType === 'NOTE') {
      const postIds = favorites.map((f: any) => f.targetId);
      if (postIds.length === 0) {
        return { list: [], pagination: { page, size, total: 0 } };
      }

      const list = await this.postEntity.find({
        where: { id: In(postIds), status: 1 },
        order: { createTime: 'DESC' },
      });

      return { list, pagination: { page, size, total } };
    }

    return { list: favorites, pagination: { page, size, total } };
  }
}
