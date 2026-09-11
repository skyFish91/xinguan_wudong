import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TicketTypeEntity } from '../entity/ticket-type.entity';
import { TicketStockEntity } from '../entity/ticket-stock.entity';

@Provide()
export class TicketService {
  @InjectEntityModel(TicketTypeEntity)
  ticketTypeRepo: Repository<TicketTypeEntity>;

  @InjectEntityModel(TicketStockEntity)
  ticketStockRepo: Repository<TicketStockEntity>;

  /**
   * 根据景区 ID 获取票种列表
   */
  async listByScenicId(scenicId: number) {
    return this.ticketTypeRepo.find({
      where: { scenic_id: scenicId, deleted_at: IsNull(), status: 1 },
      order: { id: 'ASC' },
    });
  }

  /**
   * 获取票种详情
   */
  async getTicketTypeById(id: number) {
    return this.ticketTypeRepo.findOne({
      where: { id, deleted_at: IsNull() },
    });
  }

  /**
   * 查询库存（支持日期范围）
   */
  async queryStock(ticketTypeId: number, startDate: string, endDate: string) {
    return this.ticketStockRepo.find({
      where: {
        ticket_type_id: ticketTypeId,
        status: 1,
      },
      order: { date: 'ASC' },
    });
  }

  /**
   * 扣减库存（乐观锁）
   * @returns true 扣减成功，false 库存不足或版本冲突
   */
  async deductStock(ticketTypeId: number, date: string, qty: number): Promise<boolean> {
    const stock = await this.ticketStockRepo.findOne({
      where: { ticket_type_id: ticketTypeId, date, status: 1 },
    });

    if (!stock) {
      throw new Error('库存记录不存在');
    }

    const available = stock.total - stock.sold;
    if (available < qty) {
      return false; // 库存不足
    }

    // 乐观锁更新
    const result = await this.ticketStockRepo
      .createQueryBuilder()
      .update(TicketStockEntity)
      .set({
        sold: stock.sold + qty,
        version: stock.version + 1,
      })
      .where('id = :id AND version = :version', { id: stock.id, version: stock.version })
      .execute();

    return result.affected > 0;
  }

  /**
   * 创建票种
   */
  async createTicketType(data: Partial<TicketTypeEntity>) {
    const ticketType = this.ticketTypeRepo.create(data);
    return this.ticketTypeRepo.save(ticketType);
  }

  /**
   * 批量设置库存
   */
  async batchSetStock(ticketTypeId: number, stockData: Array<{ date: string; total: number }>) {
    const entities = stockData.map(item => {
      return this.ticketStockRepo.create({
        ticket_type_id: ticketTypeId,
        date: item.date,
        total: item.total,
        sold: 0,
        status: 1,
      });
    });

    return this.ticketStockRepo.save(entities);
  }
}
