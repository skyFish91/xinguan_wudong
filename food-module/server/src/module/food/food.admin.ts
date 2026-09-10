import { Body, Controller, Get, Inject, Param, Post, Provide, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ApiOperation, ApiTags } from '@midwayjs/swagger';
import { RestaurantEntity, DishEntity, MealSlotEntity, MealQuotaEntity, FarmCategoryEntity, FarmProductEntity, FoodReviewEntity } from '../../entity/food.entity';
import { OrderEntity, MealBookingEntity } from '../../entity/order.entity';
import { ReviewEntity } from '../../entity/interaction.entity';
import { OrderService } from '../order/order.module';
import { Auth, CurrentUserParam, CurrentUser } from '../../common/decorators';
import { BizError } from '../../common/BizError';
import { OrderType } from '../../common/constants';

/** 模块二 食：商家后台服务 */
@Provide()
export class FoodAdminService {
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

  @InjectEntityModel(OrderEntity)
  orderRepo: Repository<OrderEntity>;

  @InjectEntityModel(MealBookingEntity)
  mealBookingRepo: Repository<MealBookingEntity>;

  @InjectEntityModel(ReviewEntity)
  reviewRepo: Repository<ReviewEntity>;

  @InjectEntityModel(FoodReviewEntity)
  foodReviewRepo: Repository<FoodReviewEntity>;

  @Inject()
  orderService: OrderService;

  /** 我的餐厅 */
  async myRestaurant(merchantId: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    return restaurant;
  }

  async saveRestaurant(merchantId: number, dto: any) {
    let restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (restaurant) {
      Object.assign(restaurant, dto);
    } else {
      restaurant = this.restaurantRepo.create({ ...dto, merchantId } as Partial<RestaurantEntity>);
    }
    return this.restaurantRepo.save(restaurant);
  }

  // ---------- 菜品 ----------
  async dishList(merchantId: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (!restaurant) {
      return [];
    }
    return this.dishRepo.find({ where: { restaurantId: restaurant.id }, order: { id: 'DESC' } });
  }

  async saveDish(merchantId: number, dto: any) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (!restaurant) {
      throw BizError.biz('请先创建餐厅');
    }
    if (dto.id) {
      const dish = await this.dishRepo.findOneBy({ id: dto.id, restaurantId: restaurant.id });
      if (!dish) {
        throw BizError.notFound('菜品不存在');
      }
      Object.assign(dish, dto);
      return this.dishRepo.save(dish);
    }
    return this.dishRepo.save(this.dishRepo.create({ ...dto, restaurantId: restaurant.id }));
  }

  async deleteDish(merchantId: number, id: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    await this.dishRepo.delete({ id, restaurantId: restaurant?.id || -1 });
    return true;
  }

  // ---------- 时段 ----------
  async slotList(merchantId: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (!restaurant) {
      return [];
    }
    return this.slotRepo.find({ where: { restaurantId: restaurant.id }, order: { id: 'ASC' } });
  }

  async saveSlot(merchantId: number, dto: any) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (!restaurant) {
      throw BizError.biz('请先创建餐厅');
    }
    if (dto.id) {
      const slot = await this.slotRepo.findOneBy({ id: dto.id, restaurantId: restaurant.id });
      if (!slot) {
        throw BizError.notFound('时段不存在');
      }
      Object.assign(slot, dto);
      return this.slotRepo.save(slot);
    }
    return this.slotRepo.save(this.slotRepo.create({ ...dto, restaurantId: restaurant.id }));
  }

  async deleteSlot(merchantId: number, id: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    await this.slotRepo.delete({ id, restaurantId: restaurant?.id || -1 });
    return true;
  }

  // ---------- 预订管理 ----------
  async bookingList(merchantId: number, status: number | undefined, page: number, pageSize: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    if (!restaurant) {
      return { list: [], total: 0, page, pageSize };
    }
    const qb = this.mealBookingRepo
      .createQueryBuilder('mb')
      .innerJoin(OrderEntity, 'o', 'o.id = mb.order_id')
      .where('mb.restaurant_id = :rid', { rid: restaurant.id });
    if (status !== undefined && status >= 0) {
      qb.andWhere('o.status = :status', { status });
    }
    const total = await qb.getCount();
    const list = await qb
      .select([
        'mb.id AS id',
        'mb.order_id AS orderId',
        'mb.slot_id AS slotId',
        'mb.booking_date AS bookingDate',
        'mb.guest_count AS guestCount',
        'mb.contact_name AS contactName',
        'mb.contact_phone AS contactPhone',
        'o.order_no AS orderNo',
        'o.status AS status',
        'o.total_amount AS totalAmount',
        'o.created_at AS createdAt',
      ])
      .orderBy('mb.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getRawMany();
    return { list, total, page, pageSize };
  }

  /** 确认/拒绝预订 */
  async handleBooking(merchantId: number, orderId: number, accept: boolean, rejectReason?: string) {
    const order = await this.orderRepo.findOneBy({ id: orderId, merchantId, orderType: OrderType.MEAL });
    if (!order) {
      throw BizError.notFound('预订订单不存在');
    }
    if (accept) {
      await this.orderService.merchantConfirm(merchantId, orderId);
    } else {
      // 拒绝：取消订单并回补余量
      order.status = 5;
      order.cancelReason = `商家拒绝：${rejectReason || '暂无说明'}`;
      await this.orderRepo.save(order);
      await this.orderService.releaseStock(order);
      const msgRepo = this.orderRepo.manager.getRepository('t_message' as any);
      await msgRepo.save(
        msgRepo.create({
          userId: order.userId,
          msgType: 'order',
          title: '预订被拒绝',
          content: `您的餐位预订 ${order.orderNo} 已被商家拒绝：${rejectReason || '暂无说明'}`,
        })
      );
    }
    return true;
  }

  // ---------- 农产品 ----------
  async saveFarmCategory(dto: any) {
    if (dto.id) {
      const cat = await this.farmCategoryRepo.findOneBy({ id: dto.id });
      if (!cat) {
        throw BizError.notFound('分类不存在');
      }
      Object.assign(cat, dto);
      return this.farmCategoryRepo.save(cat);
    }
    return this.farmCategoryRepo.save(this.farmCategoryRepo.create(dto as Partial<FarmCategoryEntity>));
  }

  async categoryList() {
    return this.farmCategoryRepo.find({ order: { sort: 'ASC', id: 'ASC' } });
  }

  async deleteCategory(id: number) {
    const count = await this.farmRepo.countBy({ categoryId: id });
    if (count > 0) {
      throw BizError.biz('该分类下仍有商品，无法删除');
    }
    await this.farmCategoryRepo.delete({ id });
    return true;
  }

  async farmList(merchantId: number, keyword: string, page: number, pageSize: number) {
    const qb = this.farmRepo.createQueryBuilder('f').where('f.merchant_id = :mid', { mid: merchantId });
    if (keyword) {
      qb.andWhere('f.name LIKE :kw', { kw: `%${keyword}%` });
    }
    const [list, total] = await qb
      .orderBy('f.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list, total, page, pageSize };
  }

  async saveFarmProduct(merchantId: number, dto: any) {
    if (dto.id) {
      const farm = await this.farmRepo.findOneBy({ id: dto.id, merchantId });
      if (!farm) {
        throw BizError.notFound('农产品不存在');
      }
      Object.assign(farm, dto);
      return this.farmRepo.save(farm);
    }
    return this.farmRepo.save(this.farmRepo.create({ ...dto, merchantId }));
  }

  async toggleFarm(merchantId: number, id: number) {
    const farm = await this.farmRepo.findOneBy({ id, merchantId });
    if (!farm) {
      throw BizError.notFound('农产品不存在');
    }
    farm.status = farm.status === 1 ? 0 : 1;
    return this.farmRepo.save(farm);
  }

  // ---------- 统计 ----------
  async stats(merchantId: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    const restaurantId = restaurant?.id || 0;
    const orderAgg = await this.orderRepo
      .createQueryBuilder('o')
      .select('COUNT(*)', 'orders')
      .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'amount')
      .where('o.merchant_id = :mid AND o.status >= 1 AND o.status NOT IN (5,7)', { mid: merchantId })
      .getRawOne();
    const mealBookings = restaurantId
      ? await this.mealBookingRepo.countBy({ restaurantId })
      : 0;
    const farmAgg = await this.farmRepo
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.sales), 0)', 'sales')
      .where('f.merchant_id = :mid', { mid: merchantId })
      .getRawOne();
    const topDishesRaw = restaurantId
      ? await this.dishRepo.find({
          where: { restaurantId, isSignature: 1 },
          order: { price: 'DESC' },
          take: 5,
        })
      : [];
    const topDishes = await Promise.all(
      topDishesRaw.map(async (d) => {
        const r = await this.restaurantRepo.findOneBy({ id: d.restaurantId });
        return { ...d, restaurantName: r?.name || '' };
      })
    );
    return {
      orderCount: Number(orderAgg?.orders || 0),
      orderAmount: Number(orderAgg?.amount || 0),
      mealBookingCount: mealBookings,
      farmProductCount: await this.farmRepo.countBy({ merchantId }),
      farmSales: Number(farmAgg?.sales || 0),
      topDishes,
    };
  }

  /** 全平台食数据统计（管理员） */
  async adminStats() {
    const farmAgg = await this.farmRepo
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.sales), 0)', 'sales')
      .getRawOne();
    const amountAgg = await this.orderRepo
      .createQueryBuilder('o')
      .innerJoin('t_restaurant', 'r', 'r.merchant_id = o.merchant_id')
      .select('COALESCE(SUM(o.pay_amount), 0)', 'amount')
      .where('o.status >= 1 AND o.status NOT IN (5,7)')
      .getRawOne();
    const merchantSales = await this.restaurantRepo
      .createQueryBuilder('r')
      .leftJoin('t_order', 'o', 'o.merchant_id = r.merchant_id AND o.status >= 1 AND o.status NOT IN (5,7)')
      .select('r.name', 'name')
      .addSelect('COUNT(o.id)', 'orderCount')
      .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'amount')
      .groupBy('r.id')
      .orderBy('amount', 'DESC')
      .getRawMany();
    const topDishesRaw = await this.dishRepo.find({
      where: { isSignature: 1 },
      order: { price: 'DESC' },
      take: 5,
    });
    const topDishes = await Promise.all(
      topDishesRaw.map(async (d) => {
        const r = await this.restaurantRepo.findOneBy({ id: d.restaurantId });
        return { ...d, restaurantName: r?.name || '' };
      })
    );
    return {
      restaurantCount: await this.restaurantRepo.countBy({ status: 1 }),
      farmProductCount: await this.farmRepo.count(),
      mealBookingCount: await this.mealBookingRepo.count(),
      reviewCount: await this.foodReviewRepo.count(),
      farmSales: Number(farmAgg?.sales || 0),
      totalSales: Number(amountAgg?.amount || 0),
      merchantSales,
      topDishes,
    };
  }

  // ---------- 评价管理 ----------
  async reviewList(merchantId: number, bizType: string | undefined, page: number, pageSize: number) {
    const restaurant = await this.restaurantRepo.findOneBy({ merchantId });
    const restaurantId = restaurant?.id || 0;
    const farmIds = (await this.farmRepo.find({ where: { merchantId }, select: ['id'] })).map((f) => f.id);

    const qb = this.foodReviewRepo.createQueryBuilder('rv');
    if (bizType === 'restaurant') {
      qb.where('rv.biz_type = :bt AND rv.biz_id = :bid', { bt: 'restaurant', bid: restaurantId });
    } else if (bizType === 'farm_product') {
      if (!farmIds.length) {
        return { list: [], total: 0, page, pageSize };
      }
      qb.where('rv.biz_type = :bt AND rv.biz_id IN (:...fids)', { bt: 'farm_product', fids: farmIds });
    } else {
      qb.where(
        '(rv.biz_type = :btR AND rv.biz_id = :bidR) OR (rv.biz_type = :btF AND rv.biz_id IN (:...fids))',
        { btR: 'restaurant', bidR: restaurantId, btF: 'farm_product', fids: farmIds.length ? farmIds : [-1] }
      );
    }
    const [list, total] = await qb
      .orderBy('rv.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const userRepo = this.foodReviewRepo.manager.getRepository('t_user');
    const items = await Promise.all(
      list.map(async (r) => {
        const u: any = await userRepo.findOneBy({ id: r.userId });
        return { ...r, userNickname: u?.nickname || '匿名用户' };
      })
    );
    return { list: items, total, page, pageSize };
  }

  /** 全平台评价列表（管理员） */
  async adminReviewList(bizType: string | undefined, page: number, pageSize: number) {
    const qb = this.foodReviewRepo.createQueryBuilder('rv');
    if (bizType) {
      qb.where('rv.biz_type = :bt', { bt: bizType });
    }
    const [list, total] = await qb
      .orderBy('rv.id', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    const userRepo = this.foodReviewRepo.manager.getRepository('t_user');
    const items = await Promise.all(
      list.map(async (r) => {
        const u: any = await userRepo.findOneBy({ id: r.userId });
        return { ...r, userNickname: u?.nickname || '匿名用户' };
      })
    );
    return { list: items, total, page, pageSize };
  }

  async replyReview(reviewId: number, reply: string) {
    const review = await this.foodReviewRepo.findOneBy({ id: reviewId });
    if (!review) {
      throw BizError.notFound('评价不存在');
    }
    review.merchantReply = reply || '';
    await this.foodReviewRepo.save(review);
    return true;
  }

  async hideReview(reviewId: number, hidden: boolean) {
    const review = await this.foodReviewRepo.findOneBy({ id: reviewId });
    if (!review) {
      throw BizError.notFound('评价不存在');
    }
    review.isHidden = hidden ? 1 : 0;
    await this.foodReviewRepo.save(review);
    return true;
  }
}

@ApiTags(['商家后台-食'])
@Controller('/api/merchant/food')
export class FoodAdminController {
  @Inject()
  foodAdminService: FoodAdminService;

  @ApiOperation({ summary: '我的餐厅信息' })
  @Auth('merchant')
  @Get('/restaurant')
  async myRestaurant(@CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.myRestaurant(user.merchantId);
  }

  @ApiOperation({ summary: '保存餐厅信息' })
  @Auth('merchant')
  @Post('/restaurant/save')
  async saveRestaurant(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.saveRestaurant(user.merchantId, dto);
  }

  @ApiOperation({ summary: '菜品列表（全部，含下架）' })
  @Auth('merchant')
  @Get('/dishes')
  async dishes(@CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.dishList(user.merchantId);
  }

  @ApiOperation({ summary: '保存菜品（id 为空新增）' })
  @Auth('merchant')
  @Post('/dishes/save')
  async saveDish(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.saveDish(user.merchantId, dto);
  }

  @ApiOperation({ summary: '删除菜品' })
  @Auth('merchant')
  @Post('/dishes/:id/delete')
  async deleteDish(@Param('id') id: number, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.deleteDish(user.merchantId, Number(id));
  }

  @ApiOperation({ summary: '时段列表（全部，含停用）' })
  @Auth('merchant')
  @Get('/slots')
  async slots(@CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.slotList(user.merchantId);
  }

  @ApiOperation({ summary: '保存时段（id 为空新增）' })
  @Auth('merchant')
  @Post('/slots/save')
  async saveSlot(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.saveSlot(user.merchantId, dto);
  }

  @ApiOperation({ summary: '删除时段' })
  @Auth('merchant')
  @Post('/slots/:id/delete')
  async deleteSlot(@Param('id') id: number, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.deleteSlot(user.merchantId, Number(id));
  }

  @ApiOperation({ summary: '餐位预订列表' })
  @Auth('merchant')
  @Get('/bookings')
  async bookings(
    @Query('status') status: number | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @CurrentUserParam() user: CurrentUser
  ) {
    return this.foodAdminService.bookingList(
      user.merchantId,
      status === undefined ? undefined : Number(status),
      Number(page),
      Number(pageSize)
    );
  }

  @ApiOperation({ summary: '确认/拒绝餐位预订' })
  @Auth('merchant')
  @Post('/bookings/:orderId/handle')
  async handleBooking(
    @Query('orderId') orderId: number,
    @Body('accept') accept: boolean,
    @Body('rejectReason') rejectReason: string,
    @CurrentUserParam() user: CurrentUser
  ) {
    return this.foodAdminService.handleBooking(user.merchantId, Number(orderId), !!accept, rejectReason);
  }

  @ApiOperation({ summary: '我的农产品列表' })
  @Auth('merchant')
  @Get('/farm/products')
  async farmList(
    @Query('keyword') keyword: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @CurrentUserParam() user: CurrentUser
  ) {
    return this.foodAdminService.farmList(user.merchantId, keyword, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '保存农产品' })
  @Auth('merchant')
  @Post('/farm/products/save')
  async saveFarmProduct(@Body() dto: any, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.saveFarmProduct(user.merchantId, dto);
  }

  @ApiOperation({ summary: '农产品上下架' })
  @Auth('merchant')
  @Post('/farm/products/:id/toggle')
  async toggleFarm(@Param('id') id: number, @CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.toggleFarm(user.merchantId, Number(id));
  }

  @ApiOperation({ summary: '店铺数据统计' })
  @Auth('merchant')
  @Get('/stats')
  async stats(@CurrentUserParam() user: CurrentUser) {
    return this.foodAdminService.stats(user.merchantId);
  }

  @ApiOperation({ summary: '评价管理列表（餐厅/农产品）' })
  @Auth('merchant')
  @Get('/reviews')
  async reviewList(
    @Query('bizType') bizType: string | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @CurrentUserParam() user: CurrentUser
  ) {
    return this.foodAdminService.reviewList(user.merchantId, bizType, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '回复评价' })
  @Auth('merchant')
  @Post('/reviews/:id/reply')
  async replyReview(@Param('id') id: number, @Body('reply') reply: string) {
    return this.foodAdminService.replyReview(Number(id), reply);
  }

}

@ApiTags(['平台管理-食'])
@Controller('/api/admin/food')
export class AdminFoodController {
  @Inject()
  foodAdminService: FoodAdminService;

  @ApiOperation({ summary: '全平台食数据统计' })
  @Auth('admin')
  @Get('/stats')
  async stats() {
    return this.foodAdminService.adminStats();
  }

  @ApiOperation({ summary: '全平台评价列表' })
  @Auth('admin')
  @Get('/reviews')
  async reviewList(
    @Query('bizType') bizType: string | undefined,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10
  ) {
    return this.foodAdminService.adminReviewList(bizType, Number(page), Number(pageSize));
  }

  @ApiOperation({ summary: '回复评价' })
  @Auth('admin')
  @Post('/reviews/:id/reply')
  async replyReview(@Param('id') id: number, @Body('reply') reply: string) {
    return this.foodAdminService.replyReview(Number(id), reply);
  }

  @ApiOperation({ summary: '隐藏/显示评价' })
  @Auth('admin')
  @Post('/reviews/:id/hide')
  async hideReview(@Param('id') id: number, @Body('hidden') hidden: boolean) {
    return this.foodAdminService.hideReview(Number(id), !!hidden);
  }

  @ApiOperation({ summary: '农产品分类列表（全部）' })
  @Auth('admin')
  @Get('/categories')
  async categories() {
    return this.foodAdminService.categoryList();
  }

  @ApiOperation({ summary: '保存农产品分类' })
  @Auth('admin')
  @Post('/categories/save')
  async saveCategory(@Body() dto: any) {
    return this.foodAdminService.saveFarmCategory(dto);
  }

  @ApiOperation({ summary: '删除农产品分类' })
  @Auth('admin')
  @Post('/categories/:id/delete')
  async deleteCategory(@Param('id') id: number) {
    return this.foodAdminService.deleteCategory(Number(id));
  }
}
