import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NoteTopicEntity } from '../entity/noteTopic';
import { NoteTopicFollowEntity } from '../entity/noteTopicFollow';
import { NotePostEntity } from '../entity/notePost';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 话题服务（设计文档 §26.3、§26.4）
 */
@Provide()
export class NoteTopicService extends BaseService {
  @InjectEntityModel(NoteTopicEntity)
  topicEntity: Repository<NoteTopicEntity>;

  @InjectEntityModel(NoteTopicFollowEntity)
  followEntity: Repository<NoteTopicFollowEntity>;

  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

  /**
   * 话题列表（推荐话题 + 全部话题）
   */
  async listTopics(query: any) {
    const qb = this.topicEntity
      .createQueryBuilder('t')
      .where('t.status = 1')
      .orderBy('t.isRecommend', 'DESC')
      .addOrderBy('t.sort', 'DESC')
      .addOrderBy('t.followCount', 'DESC');

    return this.entityRenderPage(qb, query);
  }

  /**
   * 话题详情（含下游记列表）
   */
  async detail(id: number, userId?: number) {
    const topic = await this.topicEntity.findOne({ where: { id } });
    if (!topic || topic.status !== 1) {
      throw bizError(ErrorCode.NOT_FOUND, '话题不存在');
    }

    const followed = userId
      ? await this.followEntity.findOne({ where: { userId, topicId: id } })
      : null;

    return { ...topic, followed: !!followed };
  }

  /**
   * 关注/取关话题
   */
  async toggleFollow(userId: number, topicId: number) {
    const exist = await this.followEntity.findOne({ where: { userId, topicId } });

    return this.followEntity.manager.transaction(async em => {
      if (exist) {
        await em.delete(NoteTopicFollowEntity, exist.id);
        await em.decrement(NoteTopicEntity, { id: topicId }, 'followCount', 1);
        return { followed: false };
      } else {
        await em.save(NoteTopicFollowEntity, { userId, topicId });
        await em.increment(NoteTopicEntity, { id: topicId }, 'followCount', 1);
        return { followed: true };
      }
    });
  }

  /**
   * 话题下的游记列表
   */
  async postsByTopic(topicId: number, query: any) {
    const qb = this.postEntity
      .createQueryBuilder('p')
      .where('p.status = 1')
      .andWhere('JSON_CONTAINS(p.topicIds, :topicId)', {
        topicId: JSON.stringify(topicId),
      })
      .orderBy('p.createTime', 'DESC');

    return this.entityRenderPage(qb, query);
  }
}
