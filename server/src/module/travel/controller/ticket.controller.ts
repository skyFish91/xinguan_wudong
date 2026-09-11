import { Controller, Get, Post, Body, Query, Inject } from '@midwayjs/core';
import { TicketService } from '../service/ticket.service';

@Controller('/travel/ticket')
export class TicketController {
  @Inject()
  ticketService: TicketService;

  /**
   * 根据景区 ID 获取票种列表
   */
  @Get('/list')
  async listByScenicId(@Query('scenic_id') scenicId: number) {
    const list = await this.ticketService.listByScenicId(Number(scenicId));
    return { code: 0, message: 'success', data: list };
  }

  /**
   * 查询库存
   */
  @Get('/stock')
  async queryStock(
    @Query('ticket_type_id') ticketTypeId: number,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string
  ) {
    const stock = await this.ticketService.queryStock(Number(ticketTypeId), startDate, endDate);
    return { code: 0, message: 'success', data: stock };
  }

  /**
   * 创建票种（B 端）
   */
  @Post('/create')
  async create(@Body() body: any) {
    const ticketType = await this.ticketService.createTicketType(body);
    return { code: 0, message: 'success', data: ticketType };
  }

  /**
   * 批量设置库存（B 端）
   */
  @Post('/stock/batch')
  async batchSetStock(@Body() body: { ticket_type_id: number; stock_data: Array<{ date: string; total: number }> }) {
    const { ticket_type_id, stock_data } = body;
    await this.ticketService.batchSetStock(ticket_type_id, stock_data);
    return { code: 0, message: 'success', data: null };
  }
}
