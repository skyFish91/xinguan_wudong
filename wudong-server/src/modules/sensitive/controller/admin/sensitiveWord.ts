import { Provide } from '@midwayjs/core';
import { CoolController, BaseController, BaseService } from '@cool-midway/core';
import { SensitiveWordEntity } from '../../entity/sensitiveWord';

/**
 * 敏感词服务
 */
@Provide()
export class SensitiveWordService extends BaseService {}

/**
 * 后台-敏感词库管理
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: SensitiveWordEntity,
  service: SensitiveWordService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.level'],
    keyWordLikeFields: ['a.word'],
  },
})
export class AdminSensitiveWordController extends BaseController {}
