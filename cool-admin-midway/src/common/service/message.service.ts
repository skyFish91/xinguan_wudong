import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { SysMessage } from '../../modules/common/entity/SysMessage.entity';
import { MessageType } from '../constants/biz-type';

/**
 * 统一消息服务（设计文档 §11）
 *
 * 硬规则：禁止任何板块直接 INSERT sys_message，一律走 send()。
 */
@Provide()
export class MessageService {
  @InjectEntityModel(SysMessage)
  msgModel: Repository<SysMessage>;

  /** 发消息 */
  async send(param: {
    userId: number;
    msgType: MessageType | string;
    title: string;
    content: string;
    bizType?: string;
    bizId?: number;
  }): Promise<SysMessage> {
    const msg = this.msgModel.create({
      userId: param.userId,
      msgType: String(param.msgType),
      title: param.title,
      content: param.content,
      bizType: param.bizType || '',
      bizId: param.bizId || null,
      isRead: 0,
    });
    return this.msgModel.save(msg);
  }

  /** 批量群发 */
  async sendMany(
    userIds: number[],
    param: Omit<Parameters<MessageService['send']>[0], 'userId'>
  ): Promise<number> {
    let n = 0;
    for (const userId of userIds) {
      await this.send({ ...param, userId });
      n++;
    }
    return n;
  }

  /** 我的消息列表 */
  async list(param: {
    userId: number;
    msgType?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ list: SysMessage[]; total: number; unread: number }> {
    const page = Math.max(1, Number(param.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(param.pageSize) || 10));

    const qb = this.msgModel.createQueryBuilder('m');
    qb.where('m.user_id = :userId', { userId: param.userId });
    if (param.msgType) {
      qb.andWhere('m.msg_type = :msgType', { msgType: param.msgType });
    }
    const [list, total] = await qb
      .orderBy('m.create_time', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    const unread = await this.msgModel.count({
      where: { userId: param.userId, isRead: 0 },
    });

    return { list, total, unread };
  }

  /** 标记已读 */
  async read(userId: number, ids?: number[]): Promise<number> {
    if (ids && ids.length) {
      await this.msgModel
        .createQueryBuilder()
        .update(SysMessage)
        .set({ isRead: 1, readTime: new Date() })
        .where('user_id = :userId', { userId })
        .andWhereInIds(ids)
        .execute();
      return ids.length;
    }
    const res = await this.msgModel
      .createQueryBuilder()
      .update(SysMessage)
      .set({ isRead: 1, readTime: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('is_read = 0')
      .execute();
    return res.affected || 0;
  }

  async unreadCount(userId: number): Promise<number> {
    return this.msgModel.count({ where: { userId, isRead: 0 } });
  }
}
