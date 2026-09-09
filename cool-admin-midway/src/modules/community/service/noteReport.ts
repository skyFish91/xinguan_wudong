import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { NoteReportEntity } from '../entity/noteReport';
import { NotePostEntity } from '../entity/notePost';
import { NoteCommentEntity } from '../entity/noteComment';
import { MessageService } from '../../message/service/message';
import { bizError } from '../../../common/biz-error';
import { ErrorCode } from '../../../common/constants/error-code';

/**
 * 举报服务（设计文档 §26.3、§26.10、§26.16）
 */
@Provide()
export class NoteReportService extends BaseService {
  @InjectEntityModel(NoteReportEntity)
  reportEntity: Repository<NoteReportEntity>;

  @InjectEntityModel(NotePostEntity)
  postEntity: Repository<NotePostEntity>;

  @InjectEntityModel(NoteCommentEntity)
  commentEntity: Repository<NoteCommentEntity>;

  @Inject()
  messageService: MessageService;

  /**
   * 创建举报
   */
  async create(
    userId: number,
    data: { targetType: 'POST' | 'COMMENT'; targetId: number; reason: string }
  ) {
    await this.reportEntity.save({
      userId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
    });
  }

  /**
   * 后台举报列表
   */
  async listReports(query: any) {
    const qb = this.reportEntity.createQueryBuilder('r').orderBy('r.createTime', 'DESC');

    if (query.status !== undefined) {
      qb.andWhere('r.status = :status', { status: query.status });
    }

    return this.entityRenderPage(qb, query);
  }

  /**
   * 后台处理举报（删除内容 / 警告用户 / 驳回）
   */
  async handle(id: number, adminId: number, action: 'delete' | 'warn' | 'reject', result: string) {
    const report = await this.reportEntity.findOne({ where: { id } });
    if (!report) {
      throw bizError(ErrorCode.NOT_FOUND, '举报记录不存在');
    }

    return this.reportEntity.manager.transaction(async em => {
      if (action === 'delete') {
        if (report.targetType === 'POST') {
          await em.update(NotePostEntity, report.targetId, { status: 3 });
        } else {
          await em.update(NoteCommentEntity, report.targetId, { status: 2 });
        }
      }

      await em.update(NoteReportEntity, id, {
        status: action === 'reject' ? 2 : 1,
        handleResult: result,
        handleBy: adminId,
        handleTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      });
    });
  }
}
