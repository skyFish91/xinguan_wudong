import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NoteFollowEntity } from '../entity/noteFollow';
import { UserInfoEntity } from '../../user/entity/info';
import { MessageService } from '../../message/service/message';
import { bizError } from '../../../common/biz-error';

/**
 * 用户关注服务（设计文档 §26.3、§26.7）
 */
@Provide()
export class NoteFollowService extends BaseService {
  @InjectEntityModel(NoteFollowEntity)
  followEntity: Repository<NoteFollowEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

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
      where: { userId: followerId, followUserId: userId },
    });

    if (exist) {
      await this.followEntity.delete(exist.id);
      return { followed: false };
    } else {
      await this.followEntity.save({ userId: followerId, followUserId: userId });

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
   * 关注列表（我关注的人）
   */
  async followingList(followerId: number, query: any) {
    const list = await this.followEntity.query(`
      SELECT u.id, u.nickname as nickName, u.avatar as avatarUrl
      FROM note_follow f
      LEFT JOIN usr_user u ON f.follow_user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.create_time DESC
      LIMIT ?, ?
    `, [followerId, (query.page - 1) * (query.pageSize || 20), query.pageSize || 20]);

    const countResult = await this.followEntity.query(`
      SELECT COUNT(*) as total FROM note_follow WHERE user_id = ?
    `, [followerId]);

    return {
      list: list || [],
      pagination: { total: countResult[0]?.total || 0, page: query.page || 1, pageSize: query.pageSize || 20 }
    };
  }

  /**
   * 粉丝列表（关注我的人）
   */
  async followerList(userId: number, query: any) {
    const list = await this.followEntity.query(`
      SELECT u.id, u.nickname as nickName, u.avatar as avatarUrl
      FROM note_follow f
      LEFT JOIN usr_user u ON f.user_id = u.id
      WHERE f.follow_user_id = ?
      ORDER BY f.create_time DESC
      LIMIT ?, ?
    `, [userId, (query.page - 1) * (query.pageSize || 20), query.pageSize || 20]);

    const countResult = await this.followEntity.query(`
      SELECT COUNT(*) as total FROM note_follow WHERE follow_user_id = ?
    `, [userId]);

    return {
      list: list || [],
      pagination: { total: countResult[0]?.total || 0, page: query.page || 1, pageSize: query.pageSize || 20 }
    };
  }

  /**
   * 判断是否已关注
   */
  async isFollowing(followerId: number, userId: number): Promise<boolean> {
    const exist = await this.followEntity.findOne({
      where: { userId: followerId, followUserId: userId },
    });
    return !!exist;
  }
}
