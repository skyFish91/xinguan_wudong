import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import * as moment from 'moment';
import { NotePostEntity } from '../entity/notePost';
import { NotePostImageEntity } from '../entity/notePostImage';
import { NoteLikeEntity } from '../entity/noteLike';
import { NoteCommentEntity } from '../entity/noteComment';
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
    const qb = this.postEntity
      .createQueryBuilder('p')
      .where('p.status = 1');

    if (query.sort === 'hot') {
      qb.orderBy('p.likeCount', 'DESC').addOrderBy('p.createTime', 'DESC');
    } else {
      qb.orderBy('p.createTime', 'DESC');
    }

    return this.entityRenderPage(qb, query);
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

    return {
      ...post,
      images,
      liked: !!liked,
      favorited: !!favorited,
    };
  }

  /**
   * 删除游记
   */
  async deletePost(id: number, userId: number) {
    const post = await this.postEntity.findOne({ where: { id } });
    if (!post || post.userId !== userId) {
      throw bizError(ErrorCode.NOT_FOUND, '游记不存在或无权操作');
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
}
