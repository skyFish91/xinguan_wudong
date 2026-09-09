/**
 * 业务类型常量（设计文档 §8.2、§9、§12）。
 * 用枚举保证全项目「只有一种写法」。
 */
export enum BizType {
  GOODS = 'GOODS',   // 衣、食(农产品特产)
  SEAT = 'SEAT',     // 食(餐位预订)
  STAY = 'STAY',     // 住
  TICKET = 'TICKET', // 行(门票)
  ROUTE = 'ROUTE',   // 行(路线套餐)
}

export enum CartItemType {
  PRODUCT = 'PRODUCT',
  FARM = 'FARM',
}

export enum FavoriteTargetType {
  PRODUCT = 'PRODUCT',
  FARM = 'FARM',
  RESTAURANT = 'RESTAURANT',
  STAY = 'STAY',
  SCENIC = 'SCENIC',
  ROUTE = 'ROUTE',
  NOTE = 'NOTE',
}
