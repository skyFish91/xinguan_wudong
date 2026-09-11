import { Body, Inject, Post, Provide } from '@midwayjs/core';
import {
  CoolController,
  BaseController,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { PayService } from '../../service/pay';

/**
 * 支付回调（幂等）
 */
@Provide()
@CoolController()
export class OpenPayNotifyController extends BaseController {
  @Inject()
  payService: PayService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/notify', { summary: '支付回调' })
  async notify(@Body() body) {
    return this.ok(await this.payService.handleNotify(body));
  }
}
