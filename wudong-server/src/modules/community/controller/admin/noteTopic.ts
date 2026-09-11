import { Provide } from '@midwayjs/core';
import { CoolController, BaseController, BaseService } from '@cool-midway/core';
import { NoteTopicEntity } from '../../entity/noteTopic';

/**
 * 话题服务（后台 CRUD）
 */
@Provide()
export class AdminNoteTopicService extends BaseService {}

/**
 * 后台-话题管理（设计文档 §26.15）
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: NoteTopicEntity,
  service: AdminNoteTopicService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.isRecommend'],
    keyWordLikeFields: ['a.name'],
    addOrderBy: { sort: 'DESC', followCount: 'DESC' },
  },
})
export class AdminNoteTopicController extends BaseController {}
