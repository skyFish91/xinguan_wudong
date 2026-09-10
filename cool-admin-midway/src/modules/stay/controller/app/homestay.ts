import { Get, Post, Body, Param, Query, Provide } from '@midwayjs/core';
import { CoolController, BaseController, CoolUrlTag } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
const dayjs = require('dayjs');

// 临时Entity定义（后续从公共entity导入）
export interface HomestayEntity {
  id: number;
  name: string;
  address: string;
  rating: number;
  mainImage: string;
  styleTags: string;
  checkInTime: string;
  checkOutTime: string;
  hasBreakfast: boolean;
  petPolicy: boolean;
  deposit: number;
  intro: string;
  status: number;
}

export interface RoomTypeEntity {
  id: number;
  homestayId: number;
  name: string;
  price: number;
  bedType: string;
  area: number;
  capacity: number;
  facilities: string;
  mainImage: string;
  status: number;
}

export interface RoomInventoryEntity {
  id: number;
  roomTypeId: number;
  invDate: string;
  price: number;
  total: number;
  booked: number;
  status: number;
}

export class HotelBookingDTO {
  @IsNotEmpty({ message: '民宿不能为空' })
  homestayId: number;

  @IsNotEmpty({ message: '房型不能为空' })
  roomTypeId: number;

  @IsNotEmpty({ message: '入住日期不能为空' })
  checkInDate: string;

  @IsNotEmpty({ message: '离店日期不能为空' })
  checkOutDate: string;

  @IsNotEmpty({ message: '入住人姓名不能为空' })
  guestName: string;

  @IsNotEmpty({ message: '入住人身份证不能为空' })
  guestIdCard: string;

  @IsNotEmpty({ message: '联系电话不能为空' })
  guestPhone: string;
}

@Provide()
@CoolUrlTag()
@CoolController('/app/stay')
export class StayController extends BaseController {
  @InjectEntityModel('t_homestay')
  homestayRepo: Repository<any>;

  @InjectEntityModel('t_room_type')
  roomRepo: Repository<any>;

  @InjectEntityModel('t_room_inventory')
  roomInvRepo: Repository<any>;

  // 民宿列表
  @Get('/homestays')
  async homestays(
    @Query('keyword') keyword?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10
  ) {
    let query = this.homestayRepo.createQueryBuilder('h').where('h.status = :status', { status: 1 });

    if (keyword) {
      query = query.andWhere('(h.name LIKE :keyword OR h.address LIKE :keyword)', { keyword: `%${keyword}%` });
    }

    const [list, total] = await query
      .orderBy('h.rating', 'DESC')
      .skip((Number(page) - 1) * Number(pageSize))
      .take(Number(pageSize))
      .getManyAndCount();

    return this.ok({ list, total, page: Number(page), pageSize: Number(pageSize) });
  }

  // 民宿详情
  @Get('/homestays/:id')
  async homestayDetail(@Param('id') id: number) {
    const homestay = await this.homestayRepo.findOneBy({ id, status: 1 });
    if (!homestay) {
      return this.fail('民宿不存在');
    }

    const rooms = await this.roomRepo.findBy({ homestayId: id, status: 1 });
    return this.ok({ ...homestay, rooms });
  }

  // 房价计算
  @Get('/price')
  async price(
    @Query('roomTypeId') roomTypeId: number,
    @Query('checkInDate') checkInDate: string,
    @Query('checkOutDate') checkOutDate: string
  ) {
    const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');

    const inventories = await this.roomInvRepo.find({
      where: {
        roomTypeId,
        invDate: Between(checkInDate, dayjs(checkOutDate).subtract(1, 'day').format('YYYY-MM-DD')),
      },
    });

    let total = 0;
    const detail = inventories.map((inv: any) => {
      total += Number(inv.price || 0);
      return { date: inv.invDate, price: Number(inv.price || 0) };
    });

    return this.ok({ nights, total, detail });
  }

  // 创建预订
  @Post('/bookings')
  async bookings(@Body() dto: HotelBookingDTO) {
    const homestay = await this.homestayRepo.findOneBy({ id: dto.homestayId, status: 1 });
    if (!homestay) {
      return this.fail('民宿不存在');
    }

    // TODO: 集成订单和支付模块
    return this.ok({
      orderId: Math.floor(Math.random() * 1000000),
      homestayId: dto.homestayId,
      roomTypeId: dto.roomTypeId,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      guestName: dto.guestName,
      status: 'pending_payment',
    });
  }
}
