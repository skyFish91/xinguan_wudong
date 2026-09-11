import { Body, Controller, Get, Inject, Param, Post, Provide, Put, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { RestaurantEntity, DishEntity, MealSlotEntity, MealQuotaEntity, FarmCategoryEntity, FarmProductEntity, FoodReviewEntity, FoodFavoriteEntity } from '../../entity/food.entity';
import { OrderService } from '../order/order.module';
import { OrderEntity, MealBookingEntity } from '../../entity/order.entity';
import { Auth, CurrentUserParam, CurrentUser } from '../../common/decorators';
import { BizError } from '../../common/BizError';
import { OrderType } from '../../common/constants';
import { IsNotEmpty } from 'class-validator';
import dayjs from 'dayjs';

/** 餐位预订 DTO */
export class MealBookingDTO {
  @IsNotEmpty({ message: '餐厅不能为空' })
  restaurantId: number;
  @IsNotEmpty({ message: '时段不能为空' })
  slotId: number;
  @IsNotEmpty({ message: '预订日期不能为空' })
  bookingDate: string;
  @IsNotEmpty({ message: '人数不能为空' })
  guestCount: number;
  @IsNotEmpty({ message: '联系人不能为空' })
  contactName: string;
  @IsNotEmpty({ message: '联系电话不能为空' })
  contactPhone: string;
}

/** 模块二 食：餐饮 + 农产品服务 */
@Provide()
export class FoodService {
  @InjectEntityModel(RestaurantEntity)
  restaurantRepo: Repository<RestaurantEntity>;

  @InjectEntityModel(DishEntity)
  dishRepo: Repository<DishEntity>;

  @InjectEntityModel(MealSlotEntity)
  slotRepo: Repository<MealSlotEntity>;

  @InjectEntityModel(MealQuotaEntity)
  quotaRepo: Repository<MealQuotaEntity>;

  @InjectEntityModel(FarmCategoryEntity)
  farmCategoryRepo: Repository<FarmCategoryEntity>;

  @InjectEntityModel(FarmProductEntity)
  farmRepo: Repository<FarmProductEntity>;

  @InjectEntityModel(FoodReviewEntity)
  reviewRepo: Repository<FoodReviewEntity>;

  @InjectEntityModel(FoodFavoriteEntity)
  favoriteRepo: Repository<FoodFavoriteEntity>;

  @InjectEntityModel(MealBookingEntity)
  mealBookingRepo: Repository<MealBookingEntity>;

  @InjectEntityModel(OrderEntity)
  orderRepo: Repository<OrderEntity>;

  @Inject()
  orderService: OrderService;

  /** 餐厅列表（评分/容纳人数排序） */
  async restaurantList(sort: string, keyword: string, page: number, pageSize: number) {
    const qb = this.restaurantRepo.createQueryBuilder('r').where('r.status = 1');
    if (keyword) {
      qb.andWhere('(r.name LIKE :kw OR r.address LIKE :kw)', { kw: `%${keyword}%` });
    }
    switch (sort) {
      case 'capacity':
        qb.orderBy('r.capacity', 'DESC');
        break;
      case 'price':
        qb.orderBy('r.avg_price', 'ASC');
        break;
      default:
        qb.orderBy('r.rating', 'DESC');
    }
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list, total, page, pageSize };
  }

  /** 餐厅详情（菜品+时段+当日余量） */
  async restaurantDetail(id: number, date?: string) {
    const restaurant = await this.restaurantRepo.findOneBy({ id, status: 1 });
    if (!restaurant) {
      throw BizError.notFound('餐厅不存在');
    }
    const [dishes, slots] = await Promise.all([
      this.dishRepo.findBy({ restaurantId: id, status: 1 }),
      this.slotRepo.findBy({ restaurantId: id, status: 1 }),
    ]);
    // 当日各时段余量
    const queryDate = date || dayjs().format('YYYY-MM-DD');
    const quotas = await this.quotaRepo.findBy({ restaurantId: id, bookingDate: queryDate });
    const slotWithQuota = slots.map(slot => {
      const quota = quotas.find(q => q.slotId === slot.id);
      return { ...slot, booked: quota?.booked || 0, remain: slot.maxBooking - (quota?.booked || 0) };
    });
    return { ...restaurant, dishes, slots: slotWithQuota };
  }

  /** 餐位预订：提前至少 2 小时 */
  async createMealBooking(userId: number, dto: MealBookingDTO) {
    const restaurant = await this.restaurantRepo.findOneBy({ id: dto.restaurantId, status: 1 });
    if (!restaurant) {
      throw BizError.notFound('餐厅不存在');
    }
    const slot = await this.slotRepo.findOneBy({ id: dto.slotId, restaurantId: dto.restaurantId, status: 1 });
    if (!slot) {
      throw BizError.notFound('时段不存在');
    }
    // 预订日期不能早于今天，且提前 2 小时（从时段名中提取开始时间，如"午餐 11:30-13:30" → 11:30）
    const timeMatch = slot.slotName.match(/(\d{1,2}:\d{2})/);
    const target = timeMatch ? dayjs(`${dto.bookingDate} ${timeMatch[1]}`, 'YYYY-MM-DD HH:mm') : null;
    if (!target || !target.isValid() || target.isBefore(dayjs().add(2, 'hour'))) {
      throw BizError.biz('餐位预订需提前至少 2 小时');
    }
    // 人数限制
    if (dto.guestCount < 1 || dto.guestCount > 20) {
      throw BizError.param('预订人数须在 1-20 之间');
    }
    const order = await this.orderService.createOrder({
      userId,
      orderType: OrderType.MEAL,
      merchantId: restaurant.merchantId,
      totalAmount: 0, // 餐位预订免费
      remark: `${restaurant.name} 餐位预订`,
      mealBooking: {
        restaurantId: dto.restaurantId,
        slotId: dto.slotId,
        bookingDate: dto.bookingDate,
        guestCount: dto.guestCount,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
      },
    });
    return order;
  }

  // ---------- 农产品 ----------
  async farmCategories() {
    return this.farmCategoryRepo.find({ order: { sort: 'ASC' } });
  }

  async farmList(categoryId: number | undefined, keyword: string, sort: string, page: number, pageSize: number) {
    const qb = this.farmRepo.createQueryBuilder('f').where('f.status = 1');
    if (categoryId) {
      qb.andWhere('f.category_id = :cid', { cid: categoryId });
    }
    if (keyword) {
      qb.andWhere('f.name LIKE :kw', { kw: `%${keyword}%` });
    }
    switch (sort) {
      case 'sales':
        qb.orderBy('f.sales', 'DESC');
        break;
      case 'price_asc':
        qb.orderBy('f.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('f.price', 'DESC');
        break;
      default:
        qb.orderBy('f.id', 'DESC');
    }
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list, total, page, pageSize };
  }

  async farmDetail(id: number) {
    const farm = await this.farmRepo.findOneBy({ id, status: 1 });
    if (!farm) {
      throw BizError.notFound('农产品不存在');
    }
    return farm;
  }

  // ---------- 收藏（餐厅/农产品） ----------
  async toggleFavorite(userId: number, bizType: string, bizId: number) {
    if (!['restaurant', 'farm_product'].includes(bizType)) {
      throw BizError.param('收藏类型不合法');
    }
    const existing = await this.favoriteRepo.findOneBy({ userId, bizType, bizId });
    if (existing) {
      await this.favoriteRepo.delete({ id: existing.id });
      return { favorited: false };
    }
    await this.favoriteRepo.save(this.favoriteRepo.create({ userId, bizType, bizId }));
    return { favorited: true };
  }

  async favoriteStatus(userId: number, bizType: string, bizId: number) {
    const existing = await this.favoriteRepo.findOneBy({ userId, bizType, bizId });
    return { favorited: !!existing };
  }

  async favoriteList(userId: number, bizType: string, page: number, pageSize: number) {
    const where: any = { userId };
    if (bizType) where.bizType = bizType;
    const [list, total] = await this.favoriteRepo.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const items = await Promise.all(
      list.map(async (f) => {
        if (f.bizType === 'restaurant') {
          const r = await this.restaurantRepo.findOneBy({ id: f.bizId });
          return { ...f, target: r || null };
        }
        const p = await this.farmRepo.findOneBy({ id: f.bizId });
        return { ...f, target: p || null };
      })
    );
    return { list: items, total, page, pageSize };
  }

  // ---------- 评价（餐厅/农产品） ----------
  async createReview(userId: number, dto: any) {
    if (!dto.bizType || !dto.bizId) {
      throw BizError.param('评价对象不能为空');
    }
    if (!['restaurant', 'farm_product'].includes(dto.bizType)) {
      throw BizError.param('评价类型不合法');
    }
    if (!dto.content || !String(dto.content).trim()) {
      throw BizError.param('评价内容不能为空');
    }
    const rating = Math.min(5, Math.max(1, Number(dto.rating) || 5));
    const review = this.reviewRepo.create({
      userId,
      bizType: dto.bizType,
      bizId: Number(dto.bizId),
      rating,
      content: String(dto.content).trim(),
      images: dto.images ? JSON.stringify(dto.images) : '',
      merchantReply: '',
      isHidden: 0,
    });
    return this.reviewRepo.save(review);
  }

  async reviewList(bizType: string, bizId: number, page: number, pageSize: number) {
    const qb = this.reviewRepo
      .createQueryBuilder('rv')
      .where('rv.biz_type = :bt', { bt: bizType })
      .andWhere('rv.biz_id = :bid', { bid: bizId })
      .andWhere('rv.is_hidden = 0')
      .orderBy('rv.id', 'DESC');
    const [list, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const userRepo = this.reviewRepo.manager.getRepository('t_user');
    const items = await Promise.all(
      list.map(async (r) => {
        const u: any = await userRepo.findOneBy({ id: r.userId });
        let images: string[] = [];
        if (r.images) {
          try {
            images = JSON.parse(r.images);
          } catch {
            images = [];
          }
        }
        return {
          id: r.id,
          rating: r.rating,
          content: r.content,
          images,
          merchantReply: r.merchantReply,
          createdAt: r.createdAt,
          userNickname: u?.nickname || '匿名用户',
          userAvatar: u?.avatar || '',
        };
      })
    );
    return { list: items, total, page, pageSize };
  }

  // ---------- 餐位预订取消（含取消政策） ----------
  async cancelMealBooking(userId: number, orderId: number) {
    const mealBooking = await this.mealBookingRepo.findOneBy({ orderId });
    if (!mealBooking) {
      throw BizError.notFound('餐位预订不存在');
    }
    const order = await this.orderRepo.findOneBy({ id: orderId, userId });
    if (!order) {
      throw BizError.notFound('订单不存在');
    }
    if (![0, 1, 2].includes(order.status)) {
      throw BizError.biz('当前状态不可取消');
    }
    // 计算距用餐时间（从时段名提取开始时间）
    const slot = await this.slotRepo.findOneBy({ id: mealBooking.slotId });
    const timeMatch = slot?.slotName?.match(/(\d{1,2}:\d{2})/);
    const target = timeMatch
      ? dayjs(`${mealBooking.bookingDate} ${timeMatch[1]}`, 'YYYY-MM-DD HH:mm')
      : null;
    const hoursLeft = target && target.isValid() ? target.diff(dayjs(), 'hour', true) : 24;
    let feePercent = 0;
    let policyMsg = '用餐前 24 小时免费取消';
    if (hoursLeft < 24) {
      feePercent = 50;
      policyMsg = '距用餐不足 24 小时，按规定收取 50% 违约金';
    }
    // 取消订单 + 回补配额
    order.status = 5;
    order.cancelReason = `用户取消餐位预订（${policyMsg}）`;
    await this.orderRepo.save(order);
    const quota = await this.quotaRepo.findOneBy({
      restaurantId: mealBooking.restaurantId,
      slotId: mealBooking.slotId,
      bookingDate: mealBooking.bookingDate,
    });
    if (quota && quota.booked > 0) {
      quota.booked -= 1;
      await this.quotaRepo.save(quota);
    }
    return { success: true, feePercent, policyMsg };
  }
}

@ApiTags(['模块二-食-餐饮美食'])
@Controller('/api/food')
export class FoodController {
  @Inject()
  foodService: FoodService;

  @ApiOperation({ summary: '餐厅列表（sort: rating/capacity）' })
  @Get('/restaurants')
  async restaurants(
    @Query('sort') sort: string,
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10
  ) {
    return this.foodService.restaurantList(sort, keyword, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '餐厅详情（菜品/时段/当日余量）' })
  @Get('/restaurants/:id')
  async restaurantDetail(@Param('id') id: number, @Query('date') date: string) {
    return this.foodService.restaurantDetail(Number(id), date);
  }

  @ApiOperation({ summary: '餐位预订（创建预订订单，免费）' })
  @Auth()
  @Post('/bookings')
  async booking(@Body() dto: MealBookingDTO, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.createMealBooking(user.userId, dto);
  }

  @ApiOperation({ summary: '农产品分类' })
  @Get('/farm/categories')
  async farmCategories() {
    return this.foodService.farmCategories();
  }

  @ApiOperation({ summary: '农产品列表' })
  @Get('/farm/products')
  async farmProducts(
    @Query('categoryId') categoryId: number | undefined,
    @Query('keyword') keyword: string,
    @Query('sort') sort: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 12
  ) {
    return this.foodService.farmList(categoryId ? Number(categoryId) : undefined, keyword, sort, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '农产品详情（含产地溯源/保质期）' })
  @Get('/farm/products/:id')
  async farmDetail(@Param('id') id: number) {
    return this.foodService.farmDetail(Number(id));
  }

  @ApiOperation({ summary: '收藏/取消收藏餐厅或农产品' })
  @Auth()
  @Post('/favorite/toggle')
  async toggleFavorite(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.toggleFavorite(user.userId, dto.bizType, Number(dto.bizId));
  }

  @ApiOperation({ summary: '查询收藏状态' })
  @Auth()
  @Get('/favorite/status')
  async favoriteStatus(@Query('bizType') bizType: string, @Query('bizId') bizId: number, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.favoriteStatus(user.userId, bizType, Number(bizId));
  }

  @ApiOperation({ summary: '我的收藏列表' })
  @Auth()
  @Get('/favorites')
  async favorites(@Query('bizType') bizType: string, @Query('page') page = 1, @Query('pageSize') pageSize = 10, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.favoriteList(user.userId, bizType, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '发表评价（餐厅/农产品）' })
  @Auth()
  @Post('/reviews')
  async createReview(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.createReview(user.userId, dto);
  }

  @ApiOperation({ summary: '评价列表' })
  @Get('/reviews')
  async reviews(@Query('bizType') bizType: string, @Query('bizId') bizId: number, @Query('page') page = 1, @Query('pageSize') pageSize = 10) {
    return this.foodService.reviewList(bizType, Number(bizId), Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '取消餐位预订（含取消政策）' })
  @Auth()
  @Post('/bookings/:orderId/cancel')
  async cancelBooking(@Param('orderId') orderId: number, @CurrentUserParam() user: CurrentUser) {
    return this.foodService.cancelMealBooking(user.userId, Number(orderId));
  }
}
