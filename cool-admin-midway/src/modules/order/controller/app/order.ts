import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { OrderService } from '../../service/order';

/**
 * C端-订单中心（设计文档 §8.1）
 */
@Provide()
@CoolUrlTag()
@CoolController('/app/order')
export class AppOrderController extends BaseController {
  @Inject()
  orderService: OrderService;

  @Inject()
  ctx;

  @Post('/create', { summary: '创建订单' })
  async create(@Body() body) {
    return this.ok(await this.orderService.create(this.ctx.user.id, body));
  }

  @Post('/cancel', { summary: '取消订单' })
  async cancel(@Body('id') id: number, @Body('reason') reason: string) {
    return this.ok(
      await this.orderService.cancel(id, this.ctx.user.id, reason)
    );
  }

  @Post('/refund', { summary: '申请退款' })
  async refund(
    @Body('id') id: number,
    @Body('reason') reason: string,
    @Body('penaltyRate') penaltyRate: number
  ) {
    return this.ok(
      await this.orderService.refund(id, this.ctx.user.id, reason, penaltyRate)
    );
  }

  @Post('/list', { summary: '我的订单分页' })
  async myList(@Body() body) {
    return this.ok(await this.orderService.pageByUser(this.ctx.user.id, body));
  }

  @Post('/detail', { summary: '订单详情' })
  async detail(@Body('id') id: number) {
    return this.ok(await this.orderService.detail(id, this.ctx.user.id));
  }
}
