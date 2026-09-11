import { Controller, Get, Post, Body, Query, Param, Inject } from '@midwayjs/core';
import { RouteService } from '../service/route.service';

@Controller('/travel/route')
export class RouteController {
  @Inject()
  routeService: RouteService;

  /**
   * 路线列表（分页 + 筛选）
   */
  @Get('/list')
  async list(
    @Query('page') page = 1,
    @Query('size') size = 10,
    @Query('theme') theme?: string,
    @Query('days') days?: number
  ) {
    const filters: any = {};
    if (theme) filters.theme = theme;
    if (days) filters.days = Number(days);

    return {
      code: 0,
      message: 'success',
      data: await this.routeService.list(Number(page), Number(size), filters),
    };
  }

  /**
   * 路线详情（含每日行程）
   */
  @Get('/:id')
  async detail(@Param('id') id: number) {
    const route = await this.routeService.getById(Number(id));
    if (!route) {
      return { code: 60002, message: '路线不存在', data: null };
    }
    return { code: 0, message: 'success', data: route };
  }

  /**
   * 创建路线（B 端）
   */
  @Post('/create')
  async create(@Body() body: { route: any; days: any[] }) {
    const route = await this.routeService.create(body.route, body.days || []);
    return { code: 0, message: 'success', data: route };
  }

  /**
   * 更新路线（B 端）
   */
  @Post('/update')
  async update(@Body() body: any) {
    const { id, ...data } = body;
    const route = await this.routeService.update(id, data);
    return { code: 0, message: 'success', data: route };
  }

  /**
   * 删除路线（B 端）
   */
  @Post('/delete')
  async delete(@Body('id') id: number) {
    await this.routeService.delete(id);
    return { code: 0, message: 'success', data: null };
  }
}
