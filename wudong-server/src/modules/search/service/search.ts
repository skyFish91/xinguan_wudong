import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHistoryEntity } from '../entity/searchHistory';

/**
 * 搜索服务（设计文档 §12）
 * 热搜词本期用 Cool Admin 字典（dict）配置，这里只做搜索历史。
 */
@Provide()
export class SearchService extends BaseService {
  @InjectEntityModel(SearchHistoryEntity)
  historyEntity: Repository<SearchHistoryEntity>;

  async record(userId: number, keyword: string, module?: string) {
    await this.historyEntity.save({ userId, keyword, module });
  }

  async history(userId: number, query: any) {
    const qb = this.historyEntity
      .createQueryBuilder('h')
      .where('h.userId = :userId', { userId });
    if (query.module) qb.andWhere('h.module = :module', { module: query.module });
    qb.orderBy('h.id', 'DESC');
    return this.entityRenderPage(qb, query);
  }
}
