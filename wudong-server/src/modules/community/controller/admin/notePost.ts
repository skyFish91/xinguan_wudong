import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { NotePostService } from '../../service/notePost';
import { NotePostEntity } from '../../entity/notePost';

/**
 * 后台-游记管理（设计文档 §26.12、§26.13）
 */
@Provide()
@CoolController({
  api: ['list', 'page', 'delete'],
  entity: NotePostEntity,
  service: NotePostService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.auditStatus', 'a.userId'],
    keyWordLikeFields: ['a.title', 'a.content'],
    addOrderBy: { createTime: 'DESC' },
  },
})
export class AdminNotePostController extends BaseController {
  @Inject()
  notePostService: NotePostService;

  @Inject()
  ctx;

  @Post('/audit/pass', { summary: '审核通过' })
  async auditPass(@Body('id') id: number) {
    return this.ok(
      await this.notePostService.auditPass(id, this.ctx.admin.userId)
    );
  }

  @Post('/audit/reject', { summary: '审核拒绝' })
  async auditReject(@Body('id') id: number, @Body('reason') reason: string) {
    return this.ok(
      await this.notePostService.auditReject(id, this.ctx.admin.userId, reason)
    );
  }

  @Post('/offShelf', { summary: '批量下架' })
  async offShelf(@Body('ids') ids: number[]) {
    return this.ok(
      await this.notePostService.offShelf(ids, this.ctx.admin.userId)
    );
  }
}
