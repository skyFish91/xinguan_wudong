import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { NotePostService } from '../../service/notePost';

/**
 * 前台-游记（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppNotePostController extends BaseController {
  @Inject()
  notePostService: NotePostService;

  @Inject()
  ctx;

  @Post('/publish', { summary: '发布游记' })
  async publish(@Body() body) {
    return this.ok(
      await this.notePostService.publish(this.ctx.user.id, body)
    );
  }

  @Post('/feed', { summary: '信息流' })
  async feed(@Body() query) {
    return this.ok(await this.notePostService.feed(query));
  }

  @Post('/detail', { summary: '游记详情' })
  async detail(@Body('id') id: number) {
    return this.ok(
      await this.notePostService.detail(id, this.ctx.user?.id)
    );
  }

  @Post('/delete', { summary: '删除游记' })
  async deletePost(@Body('id') id: number) {
    return this.ok(
      await this.notePostService.deletePost(id, this.ctx.user.id)
    );
  }

  @Post('/like/toggle', { summary: '点赞/取消点赞' })
  async toggleLike(@Body() body: { targetType: 'POST' | 'COMMENT'; targetId: number }) {
    return this.ok(
      await this.notePostService.toggleLike(
        this.ctx.user.id,
        body.targetType,
        body.targetId
      )
    );
  }
}
