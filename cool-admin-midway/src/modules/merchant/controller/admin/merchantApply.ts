import { CoolController, BaseController, BaseService } from '@cool-midway/core';
import { Provide } from '@midwayjs/core';
import { MerchantApplyEntity } from '../../entity/merchantApply';

/**
 * 入驻申请服务
 */
@Provide()
export class MerchantApplyService extends BaseService {}

/**
 * 后台-商家入驻申请 CRUD（审核动作留给管理后台模块）
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MerchantApplyEntity,
  service: MerchantApplyService,
  pageQueryOp: {
    fieldEq: ['a.status'],
    keyWordLikeFields: ['a.name', 'a.phone'],
  },
})
export class AdminMerchantApplyController extends BaseController {}
