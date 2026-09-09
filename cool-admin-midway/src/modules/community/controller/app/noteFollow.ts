import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { NoteFollowService } from '../../service/noteFollow';

/**
 * 前台-用户关注（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController()
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

  @Post('/following', { summary: '关注列表' })
  async followingList(@Body() query) {
    return this.ok(
      await this.noteFollowService.followingList(this.ctx.user.id, query)
    );
  }

  @Post('/followers', { summary: '粉丝列表' })
  async followerList(@Body() query) {
    return this.ok(
      await this.noteFollowService.followerList(this.ctx.user.id, query)
    );
  }
}
