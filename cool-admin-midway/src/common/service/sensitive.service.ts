import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SysSensitiveWord } from '../../modules/common/entity/SysSensitiveWord.entity';
import { UserInfoEntity } from '../../modules/user/entity/info';
import { RedisService } from './redis.service';

export interface SensitiveCheckResult {
  /** 是否命中敏感词 */
  hit: boolean;
  /** 命中的词列表 */
  words: string[];
  /** 命中后的建议处理：PASS 直接通过 / REVIEW 进人工审核 */
  action: 'PASS' | 'REVIEW';
}

const CACHE_KEY = 'sensitive:words';
const CACHE_TTL = 10 * 60;

/**
 * 敏感词服务（设计文档 §11）
 *
 * 本期用本地词库替代真实内容安全机审。
 * 命中规则：命中即进待审核；用户累计违规 3 次自动禁言 24 小时。
 */
@Provide()
export class SensitiveService {
  @InjectEntityModel(SysSensitiveWord)
  wordModel: Repository<SysSensitiveWord>;

  @Inject()
  redisService: RedisService;

  @InjectEntityModel(UserInfoEntity)
  userModel: Repository<UserInfoEntity>;

  /** 累计违规次数，满 3 次自动禁言 24 小时（设计文档 §6） */
  private async addViolation(userId: number): Promise<void> {
    const user = await this.userModel.findOne({ where: { id: userId } });
    if (!user) return;
    const cnt = (user.violationCnt || 0) + 1;
    const muteUntil =
      cnt >= 3 ? new Date(Date.now() + 24 * 60 * 60 * 1000) : user.muteUntil;
    await this.userModel.update(
      { id: userId },
      { violationCnt: cnt, muteUntil }
    );
  }

  /** 取全部敏感词，带 Redis 缓存 */
  private async getWords(): Promise<string[]> {
    const cached = await this.redisService.get(CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // 缓存损坏，走数据库
      }
    }
    const rows = await this.wordModel.find();
    const words = rows.map(r => r.word).filter(Boolean);
    await this.redisService.set(CACHE_KEY, JSON.stringify(words), CACHE_TTL);
    return words;
  }

  /**
   * 文本检查
   * @param text 待检查文本
   * @param userId 传了才会累计违规次数
   */
  async check(text: string, userId?: number): Promise<SensitiveCheckResult> {
    if (!text) return { hit: false, words: [], action: 'PASS' };
    const words = await this.getWords();
    const hits = words.filter(w => w && text.includes(w));

    if (hits.length === 0) {
      return { hit: false, words: [], action: 'PASS' };
    }

    if (userId) {
      await this.addViolation(userId);
    }
    return { hit: true, words: hits, action: 'REVIEW' };
  }

  /** 文本脱敏：把命中的词替换成 * */
  async mask(text: string): Promise<string> {
    const words = await this.getWords();
    let result = text;
    for (const w of words) {
      if (result.includes(w)) {
        result = result.split(w).join('*'.repeat(w.length));
      }
    }
    return result;
  }

  /** 后台维护词库后调用，清缓存 */
  async refresh(): Promise<void> {
    await this.redisService.del(CACHE_KEY);
  }
}
