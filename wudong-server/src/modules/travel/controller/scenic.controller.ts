import { Controller, Get, Post, Body, Query, Param, Inject } from '@midwayjs/core';
import { ScenicService } from '../service/scenic.service';

@Controller('/travel/scenic')
export class ScenicController {
  @Inject()
  scenicService: ScenicService;

  /**
   * 景区列表（分页）
   */
  @Get('/list')
  async list(@Query('page') page = 1, @Query('size') size = 10, @Query('status') status?: number) {
    return {
      code: 0,
      message: 'success',
      data: await this.scenicService.list(Number(page), Number(size), status ? Number(status) : undefined),
    };
  }

  /**
   * 景区详情
   */
  @Get('/:id')
  async detail(@Param('id') id: number) {
    const scenic = await this.scenicService.getById(Number(id));
    if (!scenic) {
      return { code: 60001, message: '景区不存在', data: null };
    }
    return { code: 0, message: 'success', data: scenic };
  }

  /**
   * 创建景区（B 端）
   */
  @Post('/create')
  async create(@Body() body: any) {
    const scenic = await this.scenicService.create(body);
    return { code: 0, message: 'success', data: scenic };
  }

  /**
   * 更新景区（B 端）
   */
  @Post('/update')
  async update(@Body() body: any) {
    const { id, ...data } = body;
    const scenic = await this.scenicService.update(id, data);
    return { code: 0, message: 'success', data: scenic };
  }

  /**
   * 删除景区（B 端）
   */
  @Post('/delete')
  async delete(@Body('id') id: number) {
    await this.scenicService.delete(id);
    return { code: 0, message: 'success', data: null };
  }
}
