import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NoteFollowEntity } from '../entity/noteFollow';
import { MessageService } from '../../message/service/message';
import { bizError } from '../../../common/biz-error';

/**
 * 用户关注服务（设计文档 §26.3、§26.7）
 */
@Provide()
export class NoteFollowService extends BaseService {
  @InjectEntityModel(NoteFollowEntity)
  followEntity: Repository<NoteFollowEntity>;

  @Inject()
  messageService: MessageService;

  /**
   * 关注/取关用户
   */
  async toggleFollow(followerId: number, userId: number) {
    if (followerId === userId) {
      throw bizError(70001, '不能关注自己');
    }

    const exist = await this.followEntity.findOne({
      where: { followerId, userId },
    });

    if (exist) {
      await this.followEntity.delete(exist.id);
      return { followed: false };
    } else {
      await this.followEntity.save({ followerId, userId });

      // 发送关注通知
      await this.messageService.send(userId, {
        type: 'INTERACT',
        title: '关注通知',
        content: '有人关注了你',
        bizId: `USER_${followerId}`,
      });

      return { followed: true };
    }
  }

  /**
   * 关注列表
   */
  async followingList(followerId: number, query: any) {
    const qb = this.followEntity
      .createQueryBuilder('f')
      .where('f.followerId = :followerId', { followerId })
      .orderBy('f.createTime', 'DESC');

    return this.entityRenderPage(qb, query);
  }

  /**
   * 粉丝列表
   */
  async followerList(userId: number, query: any) {
    const qb = this.followEntity
      .createQueryBuilder('f')
      .where('f.userId = :userId', { userId })
      .orderBy('f.createTime', 'DESC');

    return this.entityRenderPage(qb, query);
  }

  /**
   * 判断是否已关注
   */
  async isFollowing(followerId: number, userId: number): Promise<boolean> {
    const exist = await this.followEntity.findOne({
      where: { followerId, userId },
    });
    return !!exist;
  }
}
