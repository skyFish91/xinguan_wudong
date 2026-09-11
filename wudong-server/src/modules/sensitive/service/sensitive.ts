import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SensitiveWordEntity } from '../entity/sensitiveWord';

/**
 * 敏感词服务（设计文档 §12、§26.6）
 */
@Provide()
export class SensitiveService extends BaseService {
  @InjectEntityModel(SensitiveWordEntity)
  wordEntity: Repository<SensitiveWordEntity>;

  async check(text: string): Promise<{ hit: boolean; words: string[] }> {
    if (!text) return { hit: false, words: [] };
    const words = await this.wordEntity.findBy({ status: 1 });
    const hits = words.filter(w => text.includes(w.word)).map(w => w.word);
    return { hit: hits.length > 0, words: hits };
  }
}
