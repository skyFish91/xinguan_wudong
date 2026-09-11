import { Body, Inject, Post, Provide, Query, Get } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { NoteFollowService } from '../../service/noteFollow';

/**
 * 前台-用户关注（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController('noteFollow')
export class AppNoteFollowController extends BaseController {
  @Inject()
  noteFollowService: NoteFollowService;

  @Inject()
  ctx;

  @Post('/toggle', { summary: '关注/取关用户' })
  async toggleFollow(@Body('userId') userId: number) {
    return this.ok(
      await this.noteFollowService.toggleFollow(this.ctx.user.id, userId)
    );
  }

  @Get('/following', { summary: '关注列表' })
  async followingList(@Query('userId') userId: number, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.ok(
      await this.noteFollowService.followingList(userId, { page, pageSize })
    );
  }

  @Get('/followers', { summary: '粉丝列表' })
  async followerList(@Query('userId') userId: number, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.ok(
      await this.noteFollowService.followerList(userId, { page, pageSize })
    );
  }
}
