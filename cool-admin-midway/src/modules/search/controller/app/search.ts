import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { SearchService } from '../../service/search';

/**
 * 前台-搜索
 */
@Provide()
@CoolUrlTag()
@CoolController('/app/search')
export class AppSearchController extends BaseController {
  @Inject()
  searchService: SearchService;

  @Inject()
  ctx;

  @Post('/record', { summary: '记录搜索关键词' })
  async record(@Body() body) {
    return this.ok(
      await this.searchService.record(this.ctx.user.id, body.keyword, body.module)
    );
  }

  @Post('/history', { summary: '我的搜索历史' })
  async history(@Body() query) {
    return this.ok(await this.searchService.history(this.ctx.user.id, query));
  }
}
