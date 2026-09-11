import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { PayService } from '../../service/pay';

/**
 * 前台-支付
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppPayController extends BaseController {
  @Inject()
  payService: PayService;

  @Post('/pay', { summary: '支付' })
  async pay(@Body('orderNo') orderNo: string) {
    return this.ok(await this.payService.pay(orderNo));
  }
}
