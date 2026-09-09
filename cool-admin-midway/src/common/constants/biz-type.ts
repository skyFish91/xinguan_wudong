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

/** 用户角色（JWT 载荷 role 字段） */
export enum Role {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  ADMIN = 'ADMIN',
}

/** 客户端来源（请求头 x-client） */
export enum ClientType {
  PC = 'PC',
  MINI = 'MINI',
  ADMIN = 'ADMIN',
}

/** 订单状态（设计文档 §7.3 状态机） */
export enum OrderStatus {
  PENDING = 'PENDING', // 待支付
  PAID = 'PAID', // 已支付，待确认
  CONFIRMED = 'CONFIRMED', // 商家已确认
  ONGOING = 'ONGOING', // 进行中（已发货 / 已入住 / 已到店）
  FINISHED = 'FINISHED', // 已完成
  REVIEWED = 'REVIEWED', // 已评价
  CANCELLED = 'CANCELLED', // 用户取消
  CLOSED = 'CLOSED', // 超时未支付关闭
  REFUNDED = 'REFUNDED', // 已退款
}

/** 支付状态 */
export enum PayStatus {
  UNPAID = 0,
  PAID = 1,
  REFUNDED = 2,
  PART_REFUNDED = 3,
}

/** 支付方式 */
export enum PayType {
  MOCK = 'MOCK',
  WECHAT = 'WECHAT',
  ALIPAY = 'ALIPAY',
}

/** 消息类型 */
export enum MessageType {
  SYSTEM = 'SYSTEM',
  ORDER = 'ORDER',
  INTERACT = 'INTERACT',
}

/** 内容审核状态 */
export enum AuditStatus {
  PENDING = 0, // 待审
  MACHINE_PASS = 1, // 机审通过
  MANUAL_PASS = 2, // 人工通过
  REJECTED = 3, // 拒绝
}

/** POI 类型：社区游记可关联的地点，与 FavoriteTargetType 复用取值但语义独立 */
export enum PoiType {
  RESTAURANT = 'RESTAURANT',
  STAY = 'STAY',
  SCENIC = 'SCENIC',
}

/** 内容状态（社区通用） */
export enum ContentStatus {
  NORMAL = 1, // 正常
  AUDITING = 2, // 审核中
  OFF = 3, // 已下架
  DELETED = 4, // 已删除
}
