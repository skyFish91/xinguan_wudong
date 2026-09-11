import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { NoteReportService } from '../../service/noteReport';
import { NoteReportEntity } from '../../entity/noteReport';

/**
 * 后台-举报处理（设计文档 §26.16）
 */
@Provide()
@CoolController({
  api: ['list', 'page'],
  entity: NoteReportEntity,
  service: NoteReportService,
  pageQueryOp: {
    fieldEq: ['a.status', 'a.targetType'],
    addOrderBy: { createTime: 'DESC' },
  },
})
export class AdminNoteReportController extends BaseController {
  @Inject()
  noteReportService: NoteReportService;

  @Inject()
  ctx;

  @Post('/handle', { summary: '处理举报' })
  async handle(
    @Body('id') id: number,
    @Body('action') action: 'delete' | 'warn' | 'reject',
    @Body('result') result: string
  ) {
    return this.ok(
      await this.noteReportService.handle(id, this.ctx.admin.userId, action, result)
    );
  }
}
