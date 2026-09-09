/**
 * 业务错误码号段（设计文档 §6.2）。
 * 0 成功 —— Cool Admin 以 1000 表示成功（见计划决策 D5），
 * 本枚举只承载「业务错误」号段，供 BizException 使用。
 */
export enum ErrorCode {
  // 公共 / 系统 10000–19999
  PARAM_ERROR = 10001,
  NOT_FOUND = 10004,
  SYSTEM_ERROR = 10005,

  // 用户中心 20000–29999
  LOGIN_INVALID = 20001,

  // 订单 / 支付 / 库存 90000–99999
  ORDER_NOT_FOUND = 90001,
  ORDER_STATUS_INVALID = 90002,
  STOCK_NOT_ENOUGH = 90003,
  PAY_FAIL = 90004,
  CART_ITEM_INVALID = 90005,
}
