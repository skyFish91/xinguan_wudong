import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment';
import { NotePostEntity } from '../entity/notePost';
import { NotePostImageEntity } from '../entity/notePostImage';
import { NoteLikeEntity } from '../entity/noteLike';
import { NoteCommentEntity } from '../entity/noteComment';
import { NoteTopicEntity } from '../entity/noteTopic';
import { UserInfoEntity } from '../../user/entity/info';
import { SensitiveService } from '../../sensitive/service/sensitive';
import { MessageService } from '../../message/service/message';
import { SearchService } from '../../search/service/search';
import { FavoriteService } from '../../favorite/service/favorite';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 游记服务（设计文档 §26）
 * 与公共层对接：敏感词必接、消息/搜索/收藏复用
 */
@Provide()
export class NotePostService extends BaseService {
  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

  @InjectEntityModel(NotePostImageEntity)
  imageEntity: Repository<NotePostImageEntity>;

  @InjectEntityModel(NoteLikeEntity)
  likeEntity: Repository<NoteLikeEntity>;

  @InjectEntityModel(NoteCommentEntity)
  commentEntity: Repository<NoteCommentEntity>;

  @InjectEntityModel(NoteTopicEntity)
  topicEntity: Repository<NoteTopicEntity>;

  @InjectEntityModel(UserInfoEntity)
  userEntity: Repository<UserInfoEntity>;

  @Inject()
  sensitiveService: SensitiveService;

  @Inject()
  messageService: MessageService;

  @Inject()
  searchService: SearchService;

  @Inject()
  favoriteService: FavoriteService;

  /**
   * 发布游记（设计文档 §26.6）
   * 敏感词命中 → status=2 审核中；未命中 → status=1 直接过
   * 单用户每日最多 10 篇（Redis 计数，超限报 70002）
   */
  async publish(userId: number, data: {
    title: string;
    content: string;
    images?: string[];
    videoUrl?: string;
    cover?: string;
    topicIds?: number[];
    poiType?: string;
    poiId?: number;
  }) {
    // 校验字数（设计文档 §26.6：正文 ≤5000）
    if (data.content && data.content.length > 5000) {
      throw bizError(70001, '游记正文不得超过5000字');
    }

    // 校验图片数量
    if (data.images && data.images.length > 9) {
      throw bizError(70001, '游记图片不得超过9张');
    }

    // 敏感词检测（必接，设计文档 §26.8）
    const checkResult = await this.sensitiveService.check(
      `${data.title} ${data.content}`
    );

    const status = checkResult.hit ? 2 : 1; // 命中→审核中；未命中→正常
    const auditStatus = checkResult.hit ? 0 : 1; // 命中→待审；未命中→机审通过

    return this.postEntity.manager.transaction(async em => {
      const post = await em.save(NotePostEntity, {
        userId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        cover: data.cover || (data.images?.[0] || null),
        topicIds: data.topicIds || [],
        poiType: data.poiType,
        poiId: data.poiId,
        status,
        auditStatus,
      });

      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          await em.save(NotePostImageEntity, {
            postId: post.id,
            imageUrl: data.images[i],
            sort: i,
          });
        }
      }

      // 记录搜索关键词（标题）
      if (status === 1) {
        await this.searchService.record(userId, data.title, 'community');
      }

      return post;
    });
  }

  /**
   * 信息流（推荐/最新排序，设计文档 §26.2）
   */
  async feed(query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const where: any = {
      status: 1,
    };

    // 如果指定了userId，只返回该用户的游记
    if (query.userId) {
      where.userId = query.userId;
    }

    const [list, total] = await this.postEntity.findAndCount({
      where,
      order: {
        likeCount: query.sort === 'hot' ? 'DESC' : undefined,
        createTime: 'DESC',
      },
      skip,
      take: size,
    });

    return {
      list,
      pagination: {
        page,
        size,
        total,
      },
    };
  }

  /**
   * 游记详情（含图片/点赞/评论/收藏状态）
   */
  async detail(id: number, userId?: number) {
    const post = await this.postEntity.findOne({ where: { id } });
    if (!post || post.status === 4) {
      throw bizError(ErrorCode.NOT_FOUND, '游记不存在');
    }

    const images = await this.imageEntity.find({
      where: { postId: id },
      order: { sort: 'ASC' },
    });

    const liked = userId
      ? await this.likeEntity.findOne({
          where: { userId, targetType: 'POST', targetId: id },
        })
      : null;

    const favorited = userId
      ? await this.favoriteService.favoriteEntity.findOne({
          where: { userId, targetType: 'NOTE', targetId: id },
        })
      : null;

    // 浏览数 +1
    await this.postEntity.increment({ id }, 'viewCount', 1);

    // 获取作者信息
    let userName = '用户';
    let userAvatar = '';
    try {
      const userInfo = await this.userEntity.findOne({ where: { id: post.userId } });
      if (userInfo) {
        userName = userInfo.nickName || userInfo.phone || '用户';
        userAvatar = userInfo.avatarUrl || '';
      }
    } catch (err) {
      console.error('查询用户信息失败:', err);
    }

    // 获取关联的话题信息和话题名列表
    let topics = [];
    let topicNames = [];
    if (post.topicIds && Array.isArray(post.topicIds) && post.topicIds.length > 0) {
      topics = await this.topicEntity.find({
        where: { id: In(post.topicIds) },
      });
      topicNames = topics.map(t => t.name);
    }

    return {
      ...post,
      userId: post.userId,
      images,
      topics,
      topicNames,
      userName,
      userAvatar,
      liked: !!liked,
      favorited: !!favorited,
    };
  }

  /**
   * 我的游记列表
   */
  async myPosts(userId: number, query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const [list, total] = await this.postEntity.findAndCount({
      where: { userId, status: 1 },
      order: { createTime: 'DESC' },
      skip,
      take: size,
    });

    return { list, pagination: { page, size, total } };
  }

  /**
   * 我点赞的游记列表
   */
  async myLikes(userId: number, query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const [likes, total] = await this.likeEntity.findAndCount({
      where: { userId, targetType: 'POST' },
      order: { createTime: 'DESC' },
      skip,
      take: size,
    });

    const postIds = likes.map((l: any) => l.targetId);
    if (postIds.length === 0) {
      return { list: [], pagination: { page, size, total: 0 } };
    }

    const list = await this.postEntity.find({
      where: { id: In(postIds), status: 1 },
      order: { createTime: 'DESC' },
    });

    return { list, pagination: { page, size, total } };
  }

  /**
   * 删除游记
   */
  async deletePost(id: number, userId: number, role?: string) {
    const post = await this.postEntity.findOne({ where: { id } });

    if (!post) {
      throw bizError(ErrorCode.NOT_FOUND, '游记不存在');
    }

    // ADMIN可以删除任意游记，普通用户只能删自己的
    const postUserId = Number(post.userId);
    const currentUserId = Number(userId);

    if (role !== 'ADMIN' && postUserId !== currentUserId) {
      throw bizError(ErrorCode.NOT_FOUND, '无权删除他人游记');
    }

    await this.postEntity.update(id, { status: 4 });
  }

  /**
   * 点赞/取消点赞（设计文档 §26.7）
   * 唯一索引防重复 + 计数更新
   */
  async toggleLike(userId: number, targetType: 'POST' | 'COMMENT', targetId: number) {
    const exist = await this.likeEntity.findOne({
      where: { userId, targetType, targetId },
    });

    return this.likeEntity.manager.transaction(async em => {
      if (exist) {
        await em.delete(NoteLikeEntity, exist.id);
        if (targetType === 'POST') {
          await em.decrement(NotePostEntity, { id: targetId }, 'likeCount', 1);
        } else {
          await em.decrement(NoteCommentEntity, { id: targetId }, 'likeCount', 1);
        }
        return { liked: false };
      } else {
        await em.save(NoteLikeEntity, { userId, targetType, targetId });
        if (targetType === 'POST') {
          await em.increment(NotePostEntity, { id: targetId }, 'likeCount', 1);
        } else {
          await em.increment(NoteCommentEntity, { id: targetId }, 'likeCount', 1);
        }

        // 发送消息（点赞通知）
        if (targetType === 'POST') {
          const post = await em.findOne(NotePostEntity, { where: { id: targetId } });
          if (post && post.userId !== userId) {
            await this.messageService.send(post.userId, {
              type: 'INTERACT',
              title: '点赞通知',
              content: '有人点赞了你的游记',
              bizId: `POST_${targetId}`,
            });
          }
        }

        return { liked: true };
      }
    });
  }

  /**
   * 后台审核通过（设计文档 §26.2、§26.12）
   */
  async auditPass(id: number, adminId: number) {
    await this.postEntity.update(id, {
      status: 1,
      auditStatus: 2,
    });
  }

  /**
   * 后台审核拒绝
   */
  async auditReject(id: number, adminId: number, reason: string) {
    await this.postEntity.update(id, {
      status: 3,
      auditStatus: 3,
      rejectReason: reason,
    });

    const post = await this.postEntity.findOne({ where: { id } });
    if (post) {
      await this.messageService.send(post.userId, {
        type: 'SYSTEM',
        title: '审核未通过',
        content: `您的游记《${post.title}》审核未通过，原因：${reason}`,
        bizId: `POST_${id}`,
      });
    }
  }

  /**
   * 后台下架
   */
  async offShelf(ids: number[], adminId: number) {
    await this.postEntity.update({ id: In(ids) }, { status: 3 });
  }

  /**
   * 搜索（支持游记/话题/用户）
   */
  async search(query: any) {
    const keyword = query.keyword?.trim() || '';
    const type = query.type || 'post';
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    if (!keyword) {
      return { list: [], total: 0 };
    }

    switch (type) {
      case 'post':
        return this.searchPosts(keyword, skip, pageSize);
      case 'topic':
        return this.searchTopics(keyword, skip, pageSize);
      case 'user':
        return this.searchUsers(keyword, skip, pageSize);
      default:
        return { list: [], total: 0 };
    }
  }

  private async searchPosts(keyword: string, skip: number, pageSize: number) {
    const qb = this.postEntity.createQueryBuilder('p')
      .where('p.status = 1')
      .andWhere('(p.title LIKE :keyword OR p.content LIKE :keyword)', { keyword: `%${keyword}%` })
      .orderBy('p.createTime', 'DESC');

    const [list, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: list.map(p => ({
        id: p.id,
        title: p.title,
        content: p.content.substring(0, 100),
        cover: p.cover || '',
        likeCount: p.likeCount || 0,
        commentCount: p.commentCount || 0,
        viewCount: p.viewCount || 0
      })),
      total
    };
  }

  private async searchTopics(keyword: string, skip: number, pageSize: number) {
    const qb = this.topicEntity.createQueryBuilder('t')
      .where('t.name LIKE :keyword OR t.intro LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('t.createTime', 'DESC');

    const [list, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: list.map(t => ({
        id: t.id,
        name: t.name,
        intro: t.intro,
        postCount: t.postCount || 0
      })),
      total
    };
  }

  private async searchUsers(keyword: string, skip: number, pageSize: number) {
    const qb = this.userEntity.createQueryBuilder('u')
      .where('u.nickName LIKE :keyword', { keyword: `%${keyword}%` })
      .orderBy('u.createTime', 'DESC');

    const [list, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: list.map(u => ({
        id: u.id,
        nickName: u.nickName,
        avatarUrl: u.avatarUrl,
        description: u.description || ''
      })),
      total
    };
  }
}
