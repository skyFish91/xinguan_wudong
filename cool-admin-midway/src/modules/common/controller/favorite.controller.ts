import {
  Provide,
  Controller,
  Post,
  Get,
  Inject,
  Body,
  Query,
  UseGuard,
} from '@midwayjs/core';
import { FavoriteService } from '../../../common/service/favorite.service';
import { AuthGuard } from '../../../common/guard/auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorator/current-user';

/**
 * 统一收藏（设计文档 §7）
 * 路由前缀：/api/v1/favorite
 * 支持商品 / 农场 / 餐厅 / 民宿 / 景区 / 线路 / 笔记。
 */
@Provide()
@Controller('/api/v1/favorite')
@UseGuard(AuthGuard)
export class FavoriteController {
  @Inject()
  favoriteService: FavoriteService;

  /** 收藏 / 取消收藏 */
  @Post('/toggle')
  async toggle(@CurrentUser() user: JwtPayload, @Body() body: any) {
    return this.favoriteService.toggle({
      userId: user.userId,
      targetType: body.targetType,
      targetId: Number(body.targetId),
    });
  }

  /** 是否已收藏 */
  @Get('/status')
  async status(
    @CurrentUser() user: JwtPayload,
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: number
  ) {
    const favorited = await this.favoriteService.isFavorited(
      user.userId,
      targetType,
      Number(targetId)
    );
    return { favorited };
  }

  /** 我的收藏 */
  @Get('/list')
  async list(@CurrentUser() user: JwtPayload, @Query() query: any) {
    return this.favoriteService.list({ ...query, userId: user.userId });
  }
}
