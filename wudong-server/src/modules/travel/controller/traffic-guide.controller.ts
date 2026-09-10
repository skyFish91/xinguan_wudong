import { Controller, Get, Query, Inject } from '@midwayjs/core';
import { TrafficGuideService } from '../service/traffic-guide.service';

@Controller('/travel/traffic-guide')
export class TrafficGuideController {
  @Inject()
  trafficGuideService: TrafficGuideService;

  /**
   * 交通攻略列表
   */
  @Get('/list')
  async list(@Query('from_city') fromCity?: string) {
    const list = await this.trafficGuideService.list(fromCity);
    return { code: 0, message: 'success', data: list };
  }
}
