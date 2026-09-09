import { CoolController, BaseController } from '@cool-midway/core';
import { MerchantEntity } from '../../entity/merchant';
import { MerchantService } from '../../service/merchant';

/**
 * 后台-商家管理（基础 CRUD，审核工作流在管理后台模块）
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MerchantEntity,
  service: MerchantService,
  pageQueryOp: {
    keyWordLikeFields: ['a.name', 'a.phone'],
    fieldEq: ['a.status'],
  },
})
export class AdminMerchantController extends BaseController {}
