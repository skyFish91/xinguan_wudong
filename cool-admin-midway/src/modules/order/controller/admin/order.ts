import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { OrderEntity } from '../../entity/order';
import { OrderService } from '../../service/order';

/**
 * 后台-订单管理（基础 CRUD + 状态操作）
 */
@Provide()
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: OrderEntity,
  service: OrderService,
  pageQueryOp: {
    keyWordLikeFields: ['a.orderNo'],
    fieldEq: ['a.status', 'a.bizType', 'a.payStatus', 'a.userId', 'a.merchantId'],
  },
})
export class AdminOrderController extends BaseController {
  @Inject()
  orderService: OrderService;

  @Inject()
  ctx;

  @Post('/changeStatus', { summary: '变更订单状态' })
  async changeStatus(@Body('id') id: number, @Body('to') to: string, @Body('remark') remark: string) {
    return this.ok(
      await this.orderService.changeStatus(id, to, this.ctx.admin.userId, remark)
    );
  }
}
