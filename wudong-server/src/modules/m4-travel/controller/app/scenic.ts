import { Get, Param, Query, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { TvlScenic } from '../../entity/TvlScenic.entity';

@Provide()
@CoolUrlTag()
@CoolController('scenic')
export class AppScenicController extends BaseController {
  @InjectEntityModel(TvlScenic)
  scenicRepo: Repository<TvlScenic>;

  @Get('/list')
  async list(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string,
  ) {
    let query = this.scenicRepo.createQueryBuilder('s').where('s.status = :status', { status: 1 });

    if (keyword) {
      query = query.andWhere('(s.name LIKE :keyword OR s.intro LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    const [list, total] = await query
      .orderBy('s.rating', 'DESC')
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getManyAndCount();

    return this.ok({
      list: list.map(item => ({
        ...item,
        minPrice: Number(item.minPrice) / 100,
      })),
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @Get('/detail/:id')
  async detail(@Param('id') id: number) {
    const scenic = await this.scenicRepo.findOneBy({ id, status: 1 });
    if (!scenic) {
      return this.fail('景区不存在');
    }

    return this.ok({
      ...scenic,
      minPrice: Number(scenic.minPrice) / 100,
    });
  }
}
