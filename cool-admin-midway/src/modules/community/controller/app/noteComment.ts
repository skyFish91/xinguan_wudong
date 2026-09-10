import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { NoteCommentService } from '../../service/noteComment';

/**
 * 前台-评论（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController('/app/noteComment')
export class AppNoteCommentController extends BaseController {
  @Inject()
  noteCommentService: NoteCommentService;

  @Inject()
  ctx;

  @Post('/create', { summary: '发表评论' })
  async create(@Body() body) {
    return this.ok(
      await this.noteCommentService.create(this.ctx.user.id, body)
    );
  }

  @Post('/list', { summary: '评论列表' })
  async listByPost(@Body() query) {
    return this.ok(
      await this.noteCommentService.listByPost(query.postId, query)
    );
  }

  @Post('/delete', { summary: '删除评论' })
  async deleteComment(@Body('id') id: number) {
    return this.ok(
      await this.noteCommentService.deleteComment(id, this.ctx.user.id)
    );
  }
}
