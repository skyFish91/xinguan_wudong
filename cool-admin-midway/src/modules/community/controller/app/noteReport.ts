import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { NoteReportService } from '../../service/noteReport';

/**
 * 前台-举报（设计文档 §26.4）
 */
@Provide()
@CoolUrlTag()
@CoolController()
export class AppNoteReportController extends BaseController {
  @Inject()
  noteReportService: NoteReportService;

  @Inject()
  ctx;

  @Post('/create', { summary: '创建举报' })
  async create(@Body() body: { targetType: 'POST' | 'COMMENT'; targetId: number; reason: string }) {
    return this.ok(
      await this.noteReportService.create(this.ctx.user.id, body)
    );
  }
}
