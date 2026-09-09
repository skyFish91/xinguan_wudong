import {
  Provide,
  Controller,
  Post,
  Get,
  Inject,
  Body,
  Query,
  UseGuard,
} from '@midwayjs/core';
import { MessageService } from '../../../common/service/message.service';
import { AuthGuard } from '../../../common/guard/auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorator/current-user';

/**
 * 站内消息（设计文档 §7）
 * 路由前缀：/api/v1/message
 */
@Provide()
@Controller('/api/v1/message')
@UseGuard(AuthGuard)
export class MessageController {
  @Inject()
  messageService: MessageService;

  /** 我的消息列表 */
  @Get('/list')
  async list(@CurrentUser() user: JwtPayload, @Query() query: any) {
    return this.messageService.list({ ...query, userId: user.userId });
  }

  /** 标记已读（不传 ids 则全部已读） */
  @Post('/read')
  async read(@CurrentUser() user: JwtPayload, @Body('ids') ids?: number[]) {
    return { affected: await this.messageService.read(user.userId, ids) };
  }

  /** 未读数 */
  @Get('/unread')
  async unread(@CurrentUser() user: JwtPayload) {
    return { count: await this.messageService.unreadCount(user.userId) };
  }
}
