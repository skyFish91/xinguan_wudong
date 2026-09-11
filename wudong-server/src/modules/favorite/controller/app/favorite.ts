import { Body, Inject, Post, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { FavoriteService } from '../../service/favorite';

/**
 * 前台-收藏
 */
@Provide()
@CoolUrlTag()
@CoolController('favorite')
export class AppFavoriteController extends BaseController {
  @Inject()
  favoriteService: FavoriteService;

  @Inject()
  ctx;

  @Post('/toggle', { summary: '收藏/取消收藏' })
  async toggle(@Body() body) {
    return this.ok(
      await this.favoriteService.toggle(
        this.ctx.user.id,
        body.targetType,
        body.targetId
      )
    );
  }

  @Post('/list', { summary: '我的收藏' })
  async listByUser(@Body() query) {
    return this.ok(await this.favoriteService.listByUser(this.ctx.user.id, query));
  }
}
