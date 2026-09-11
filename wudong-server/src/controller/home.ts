import { Controller, Get } from '@midwayjs/core';

@Controller('/')
export class HomeController {
  @Get('/')
  async home() {
    return { code: 0, message: 'ok', data: null };
  }
}
