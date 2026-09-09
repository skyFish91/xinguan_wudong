import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SysSearchHistory } from '../../modules/common/entity/SysSearchHistory.entity';
import { RedisService } from './redis.service';

const HOT_KEY = 'search:hot';

/**
 * 搜索服务（设计文档 §11）
 *
 * - 各板块自己做关键词检索，这里只提供「搜索历史（用户级）」与「热搜词」
 * - 热搜词按 ZSET 计分排序，后台可人工配置
 */
@Provide()
export class SearchService {
  @InjectEntityModel(SysSearchHistory)
  historyModel: Repository<SysSearchHistory>;

  @Inject()
  redisService: RedisService;

  /** 记录一次搜索 */
  async record(param: {
    userId?: number;
    keyword: string;
    scope?: string;
  }): Promise<void> {
    const keyword = (param.keyword || '').trim();
    if (!keyword) return;

    if (param.userId) {
      // 同一用户同关键词只保留最近一条
      const exist = await this.historyModel.findOne({
        where: { userId: param.userId, keyword, scope: param.scope || '' },
      });
      if (exist) {
        exist.createTime = new Date();
        await this.historyModel.save(exist);
      } else {
        await this.historyModel.save(
          this.historyModel.create({
            userId: param.userId,
            keyword,
            scope: param.scope || '',
          })
        );
      }
    }

    // 热搜词计分
    await this.redisService.raw.zincrby(HOT_KEY, 1, keyword);
  }

  /** 我的搜索历史 */
  async history(
    userId: number,
    scope?: string,
    limit = 10
  ): Promise<string[]> {
    const rows = await this.historyModel.find({
      where: { userId, scope: scope || '' },
      order: { createTime: 'DESC' },
      take: Math.min(50, limit),
    });
    return rows.map(r => r.keyword);
  }

  async clearHistory(userId: number, scope?: string): Promise<void> {
    await this.historyModel.delete({ userId, scope: scope || '' });
  }

  /** 热搜 TOP N */
  async hot(limit = 10): Promise<{ keyword: string; score: number }[]> {
    const res = await this.redisService.raw.zrevrange(
      HOT_KEY,
      0,
      limit - 1,
      'WITHSCORES'
    );
    const list: { keyword: string; score: number }[] = [];
    for (let i = 0; i < res.length; i += 2) {
      list.push({ keyword: res[i], score: Number(res[i + 1]) });
    }
    return list;
  }
}
