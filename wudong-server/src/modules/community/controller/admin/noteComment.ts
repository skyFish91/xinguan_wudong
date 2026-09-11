import { Provide } from '@midwayjs/core';
import { CoolController, BaseController, BaseService } from '@cool-midway/core';
import { NoteCommentEntity } from '../../entity/noteComment';

/**
 * 评论服务（后台 CRUD）
 */
@Provide()
export class AdminNoteCommentService extends BaseService {}

/**
 * 后台-评论管理（设计文档 §26.14）
 */
@Provide()
@CoolController({
  api: ['list', 'page', 'delete'],
  entity: NoteCommentEntity,
  service: AdminNoteCommentService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.postId', 'a.userId'],
    keyWordLikeFields: ['a.content'],
    addOrderBy: { createTime: 'DESC' },
  },
})
export class AdminNoteCommentController extends BaseController {}
