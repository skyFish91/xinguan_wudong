import { Provide, Controller, Get, Post, Del, Inject, Query, Body } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SearchService } from '../../../common/service/search.service';
import { CmsBanner } from '../entity/CmsBanner.entity';
import { CmsNotice } from '../entity/CmsNotice.entity';
import { CmsRecommend } from '../entity/CmsRecommend.entity';
import { SysConfig } from '../entity/SysConfig.entity';
import { SysDict } from '../entity/SysDict.entity';

/**
 * 公共只读接口（免鉴权）：搜索热词、Banner、公告、推荐位、系统配置、数据字典
 * 路由前缀：/api/v1/common
 */
@Provide()
@Controller('/api/v1/common')
export class CommonController {
  @Inject()
  searchService: SearchService;

  @InjectEntityModel(CmsBanner)
  bannerModel: Repository<CmsBanner>;

  @InjectEntityModel(CmsNotice)
  noticeModel: Repository<CmsNotice>;

  @InjectEntityModel(CmsRecommend)
  recommendModel: Repository<CmsRecommend>;

  @InjectEntityModel(SysConfig)
  configModel: Repository<SysConfig>;

  @InjectEntityModel(SysDict)
  dictModel: Repository<SysDict>;

  /** 健康检查 */
  @Get('/ping')
  async ping() {
    return { serverTime: Date.now() };
  }

  /** 热门搜索词 */
  @Get('/hot-keywords')
  async hotKeywords(@Query('limit') limit?: number) {
    return this.searchService.hot(Number(limit) || 10);
  }

  /** Banner 列表 */
  @Get('/banner/list')
  async bannerList(@Query('position') position?: string) {
    const now = new Date();
    const where: any = { status: 1 };
    if (position) where.position = position;
    return this.bannerModel.find({
      where: [
        { ...where, startTime: null, endTime: null },
        { ...where, startTime: LessThanOrEqual(now), endTime: MoreThanOrEqual(now) },
      ],
      order: { sort: 'ASC' },
    });
  }

  /** 公告列表 */
  @Get('/notice/list')
  async noticeList(@Query('limit') limit?: number) {
    return this.noticeModel.find({
      where: { status: 1 },
      order: { isTop: 'DESC', publishTime: 'DESC' },
      take: Math.min(50, Number(limit) || 10),
    });
  }

  /** 推荐位 */
  @Get('/recommend/list')
  async recommendList(@Query('position') position?: string) {
    const where: any = { status: 1 };
    if (position) where.position = position;
    return this.recommendModel.find({
      where,
      order: { sort: 'ASC' },
      take: 20,
    });
  }

  /** 系统配置（按 key 前缀） */
  @Get('/config')
  async config(@Query('prefix') prefix?: string) {
    const all = await this.configModel.find();
    const map: Record<string, string> = {};
    for (const c of all) {
      if (!prefix || c.configKey.startsWith(prefix)) {
        map[c.configKey] = c.configValue;
      }
    }
    return map;
  }

  /** 数据字典 */
  @Get('/dict')
  async dict(@Query('type') type: string) {
    return this.dictModel.find({
      where: { dictType: type },
      order: { sort: 'ASC' },
    });
  }

  /** 记录搜索词（前端搜索时调用） */
  @Post('/search/record')
  async recordSearch(@Body() body: any) {
    await this.searchService.record({
      userId: body.userId,
      keyword: body.keyword,
      scope: body.scope,
    });
    return true;
  }

  /** 搜索历史 */
  @Get('/search/history')
  async searchHistory(
    @Query('userId') userId: number,
    @Query('scope') scope?: string
  ) {
    return this.searchService.history(Number(userId), scope);
  }

  /** 清空搜索历史 */
  @Del('/search/history')
  async clearHistory(
    @Query('userId') userId: number,
    @Query('scope') scope?: string
  ) {
    await this.searchService.clearHistory(Number(userId), scope);
    return true;
  }
}
