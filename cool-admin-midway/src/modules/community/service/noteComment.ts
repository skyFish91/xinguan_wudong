import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { NoteCommentEntity } from '../entity/noteComment';
import { NotePostEntity } from '../entity/notePost';
import { MessageService } from '../../message/service/message';
import { SensitiveService } from '../../sensitive/service/sensitive';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 评论服务（设计文档 §26.3、§26.4）
 * 支持二级评论（parent_id/root_id）
 */
@Provide()
export class NoteCommentService extends BaseService {
  @InjectEntityModel(NoteCommentEntity)
  commentEntity: Repository<NoteCommentEntity>;

  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

  @Inject()
  messageService: MessageService;

  @Inject()
  sensitiveService: SensitiveService;

  /**
   * 发表评论（设计文档 §26.6：≤500字，敏感词检测）
   */
  async create(
    userId: number,
    data: {
      postId: number;
      content: string;
      parentId?: number;
      replyToUserId?: number;
    }
  ) {
    if (data.content.length > 500) {
      throw bizError(70001, '评论不得超过500字');
    }

    // 敏感词检测
    const checkResult = await this.sensitiveService.check(data.content);
    if (checkResult.hit) {
      throw bizError(70003, `评论包含敏感词：${checkResult.words.join(', ')}`);
    }

    const post = await this.postEntity.findOne({ where: { id: data.postId } });
    if (!post || post.status !== 1) {
      throw bizError(ErrorCode.NOT_FOUND, '游记不存在');
    }

    // 确定 root_id
    let rootId = 0;
    if (data.parentId && data.parentId > 0) {
      const parent = await this.commentEntity.findOne({
        where: { id: data.parentId },
      });
      rootId = parent?.rootId || data.parentId;
    }

    return this.commentEntity.manager.transaction(async em => {
      const comment = await em.save(NoteCommentEntity, {
        postId: data.postId,
        userId,
        content: data.content,
        parentId: data.parentId || 0,
        replyToUserId: data.replyToUserId,
        rootId: rootId || null,
      });

      await em.increment(NotePostEntity, { id: data.postId }, 'commentCount', 1);

      // 发送评论通知
      if (post.userId !== userId) {
        await this.messageService.send(post.userId, {
          type: 'INTERACT',
          title: '评论通知',
          content: `有人评论了你的游记：${data.content.substring(0, 50)}`,
          bizId: `POST_${data.postId}`,
        });
      }

      return comment;
    });
  }

  /**
   * 评论列表（按游记ID查询，支持树形结构）
   */
  async listByPost(postId: number, query: any) {
    const page = query.page || 1;
    const size = query.size || 15;
    const skip = (page - 1) * size;

    const [list, total] = await this.commentEntity.findAndCount({
      where: {
        postId,
        status: 1,
      },
      order: {
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
   * 删除评论
   */
  async deleteComment(id: number, userId: number) {
    const comment = await this.commentEntity.findOne({ where: { id } });
    if (!comment || comment.userId !== userId) {
      throw bizError(ErrorCode.NOT_FOUND, '评论不存在或无权操作');
    }

    return this.commentEntity.manager.transaction(async em => {
      await em.update(NoteCommentEntity, id, { status: 2 });
      await em.decrement(NotePostEntity, { id: comment.postId }, 'commentCount', 1);
    });
  }
}
