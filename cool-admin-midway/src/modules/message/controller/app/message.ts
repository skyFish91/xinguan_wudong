import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { MessageService } from '../../service/message';

/**
 * 前台-消息中心
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppMessageController extends BaseController {
  @Inject()
  messageService: MessageService;

  @Inject()
  ctx;

  @Post('/list', { summary: '消息列表' })
  async listByUser(@Body() query) {
    return this.ok(await this.messageService.listByUser(this.ctx.user.id, query));
  }

  @Post('/read', { summary: '标记已读' })
  async read(@Body('messageIds') messageIds: number[]) {
    return this.ok(
      await this.messageService.read(this.ctx.user.id, messageIds)
    );
  }
}
