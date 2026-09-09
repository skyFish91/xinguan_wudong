import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { MessageEntity } from '../entity/message';

/**
 * 统一消息服务（设计文档 §12）
 * 禁止直接 INSERT sys_message，必须走 send()。
 */
@Provide()
export class MessageService extends BaseService {
  @InjectEntityModel(MessageEntity)
  messageEntity: Repository<MessageEntity>;

  async send(
    toUserId: number,
    msg: { type: string; title: string; content: string; bizId?: string }
  ) {
    await this.messageEntity.save({ toUserId, ...msg });
  }

  async listByUser(userId: number, query: any) {
    const qb = this.messageEntity
      .createQueryBuilder('m')
      .where('m.toUserId = :userId', { userId });
    if (query.type) qb.andWhere('m.type = :type', { type: query.type });
    if (query.isRead !== undefined)
      qb.andWhere('m.isRead = :isRead', { isRead: query.isRead });
    qb.orderBy('m.id', 'DESC');
    return this.entityRenderPage(qb, query);
  }

  async read(userId: number, messageIds: number[]) {
    await this.messageEntity.update(
      { toUserId: userId, id: In(messageIds) },
      { isRead: 1 }
    );
  }
}
