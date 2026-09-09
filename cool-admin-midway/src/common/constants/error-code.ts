/**
 * 全局错误码（设计文档 §5.2 号段规范）
 *
 * 号段：
 *   0              成功
 *   10000–19999   公共 / 系统
 *   20000–29999   用户中心
 *   30000–39999   板块一 · 衣
 *   40000–49999   板块二 · 食
 *   50000–59999   板块三 · 住
 *   60000–69999   板块四 · 行
 *   70000–79999   板块五 · 社区
 *   80000–89999   板块六 · 管理后台
 *   90000–99999   订单 / 支付 / 库存
 *
 * HTTP 状态码与业务码分离：HTTP 一律 200，业务成败看 code。
 * 401/403/404/422/500 只在框架层抛出。
 */
export enum ErrorCode {
  SUCCESS = 0,

  // ===== 公共 / 系统 10000–19999 =====
  PARAM_ERROR = 10001,
  UNAUTHORIZED = 10002,
  FORBIDDEN = 10003,
  NOT_FOUND = 10004,
  SYSTEM_ERROR = 10005,
  UPLOAD_FAIL = 10006,
  FILE_TYPE_DENY = 10007,
  FILE_TOO_LARGE = 10008,
  UPLOAD_QUOTA_EXCEED = 10009,
  FREQUENT_OPERATION = 10010,
  DATA_NOT_EXIST = 10011,
  OPERATION_DENIED = 10012,

  // ===== 用户中心 20000–29999 =====
  USER_NOT_EXIST = 20001,
  PHONE_EXIST = 20002,
  PHONE_FORMAT_ERROR = 20003,
  CODE_ERROR = 20004,
  CODE_EXPIRED = 20005,
  SEND_CODE_FREQUENT = 20006,
  PASSWORD_ERROR = 20007,
  LOGIN_EXPIRED = 20008,
  USER_DISABLED = 20009,
  USER_MUTED = 20010,
  ADDRESS_NOT_EXIST = 20011,
  WX_LOGIN_FAIL = 20012,

  // ===== 板块一 · 衣 30000–39999 =====
  GOODS_NOT_EXIST = 30001,
  GOODS_OFF_SHELF = 30002,
  SKU_NOT_EXIST = 30003,
  CATEGORY_NOT_EXIST = 30004,
  REVIEW_NOT_ALLOWED = 30005,
  REVIEW_EXIST = 30006,
  APPEND_NOT_ALLOWED = 30007,
  NOT_SUPPORT_RETURN = 30008,

  // ===== 板块二 · 食 40000–49999 =====
  RESTAURANT_NOT_EXIST = 40001,
  SLOT_NOT_EXIST = 40002,
  SLOT_NOT_ENOUGH = 40003,
  BOOK_TOO_LATE = 40004, // 距用餐不足 2 小时
  BOOKING_NOT_EXIST = 40005,
  BOOKING_CANNOT_CANCEL = 40006,
  FARM_NOT_EXIST = 40007,

  // ===== 板块三 · 住 50000–59999 =====
  HOMESTAY_NOT_EXIST = 50001,
  ROOM_TYPE_NOT_EXIST = 50002,
  ROOM_NOT_ENOUGH = 50003,
  DATE_RANGE_INVALID = 50004,
  STAY_CANNOT_CANCEL = 50005,
  STAY_CANNOT_REFUND = 50006,

  // ===== 板块四 · 行 60000–69999 =====
  SCENIC_NOT_EXIST = 60001,
  TICKET_TYPE_NOT_EXIST = 60002,
  TICKET_NOT_ENOUGH = 60003,
  ETICKET_NOT_EXIST = 60004,
  ETICKET_VERIFIED = 60005, // 已核销
  ETICKET_EXPIRED = 60006,
  ROUTE_NOT_EXIST = 60007,
  ROUTE_BOOK_TOO_LATE = 60008, // 未提前 1 天
  TICKET_CANNOT_REFUND = 60009,

  // ===== 板块五 · 社区 70000–79999 =====
  NOTE_NOT_EXIST = 70001,
  NOTE_DAILY_LIMIT = 70002, // 每日最多 10 篇
  NOTE_IMAGE_LIMIT = 70003,
  NOTE_SENSITIVE_HIT = 70004,
  COMMENT_NOT_EXIST = 70005,
  TOPIC_NOT_EXIST = 70006,
  REPORT_EXIST = 70007,

  // ===== 板块六 · 管理后台 80000–89999 =====
  ADMIN_NOT_EXIST = 80001,
  ADMIN_PASSWORD_ERROR = 80002,
  MERCHANT_NOT_EXIST = 80003,
  MERCHANT_STATUS_ERROR = 80004,
  ROLE_NOT_EXIST = 80005,
  PERMISSION_DENIED = 80006,
  APPLY_NOT_EXIST = 80007,
  SETTLEMENT_NOT_EXIST = 80008,

  // ===== 订单 / 支付 / 库存 90000–99999 =====
  ORDER_NOT_FOUND = 90001,
  ORDER_STATUS_INVALID = 90002,
  STOCK_NOT_ENOUGH = 90003,
  PAY_FAIL = 90004,
  CART_ITEM_INVALID = 90005,
  CART_EMPTY = 90006,
  ORDER_NOT_PAYABLE = 90007,
  ORDER_CANNOT_CANCEL = 90008,
  REFUND_NOT_ALLOWED = 90009,
  REFUND_AMOUNT_INVALID = 90010,
  IDEMPOTENT_CONFLICT = 90011,
  ORDER_SPLIT_FAIL = 90012,
  FREQUENT_LIMIT = 90013,
}

/** 错误码 → 默认文案；抛异常时若不传 message 则取这里 */
export const ERROR_MESSAGE: Record<number, string> = {
  [ErrorCode.SUCCESS]: 'ok',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.UNAUTHORIZED]: '未登录或登录已失效',
  [ErrorCode.FORBIDDEN]: '无权限访问',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.SYSTEM_ERROR]: '系统繁忙，请稍后再试',
  [ErrorCode.UPLOAD_FAIL]: '文件上传失败',
  [ErrorCode.FILE_TYPE_DENY]: '文件类型不允许',
  [ErrorCode.FILE_TOO_LARGE]: '文件超出大小限制',
  [ErrorCode.UPLOAD_QUOTA_EXCEED]: '今日上传配额已用完',
  [ErrorCode.FREQUENT_OPERATION]: '操作过于频繁，请稍后再试',
  [ErrorCode.DATA_NOT_EXIST]: '数据不存在',
  [ErrorCode.OPERATION_DENIED]: '当前状态不允许该操作',

  [ErrorCode.USER_NOT_EXIST]: '用户不存在',
  [ErrorCode.PHONE_EXIST]: '手机号已注册',
  [ErrorCode.PHONE_FORMAT_ERROR]: '手机号格式错误',
  [ErrorCode.CODE_ERROR]: '验证码错误',
  [ErrorCode.CODE_EXPIRED]: '验证码已过期',
  [ErrorCode.SEND_CODE_FREQUENT]: '验证码发送过于频繁',
  [ErrorCode.PASSWORD_ERROR]: '密码错误',
  [ErrorCode.LOGIN_EXPIRED]: '登录已过期',
  [ErrorCode.USER_DISABLED]: '账号已被禁用',
  [ErrorCode.USER_MUTED]: '账号已被禁言',
  [ErrorCode.ADDRESS_NOT_EXIST]: '收货地址不存在',
  [ErrorCode.WX_LOGIN_FAIL]: '微信登录失败',

  [ErrorCode.GOODS_NOT_EXIST]: '商品不存在',
  [ErrorCode.GOODS_OFF_SHELF]: '商品已下架',
  [ErrorCode.SKU_NOT_EXIST]: '商品规格不存在',
  [ErrorCode.CATEGORY_NOT_EXIST]: '分类不存在',
  [ErrorCode.REVIEW_NOT_ALLOWED]: '暂无评价权限',
  [ErrorCode.REVIEW_EXIST]: '已评价过',
  [ErrorCode.NOT_SUPPORT_RETURN]: '该商品不支持退换',

  [ErrorCode.RESTAURANT_NOT_EXIST]: '餐厅不存在',
  [ErrorCode.SLOT_NOT_EXIST]: '时段不存在',
  [ErrorCode.SLOT_NOT_ENOUGH]: '该时段余量不足',
  [ErrorCode.BOOK_TOO_LATE]: '请至少提前 2 小时预订',
  [ErrorCode.BOOKING_NOT_EXIST]: '预订不存在',
  [ErrorCode.FARM_NOT_EXIST]: '农产品不存在',

  [ErrorCode.HOMESTAY_NOT_EXIST]: '民宿不存在',
  [ErrorCode.ROOM_TYPE_NOT_EXIST]: '房型不存在',
  [ErrorCode.ROOM_NOT_ENOUGH]: '房源不足',
  [ErrorCode.DATE_RANGE_INVALID]: '日期范围不合法',
  [ErrorCode.STAY_CANNOT_CANCEL]: '当前不可取消',
  [ErrorCode.STAY_CANNOT_REFUND]: '当前不可退款',

  [ErrorCode.SCENIC_NOT_EXIST]: '景区不存在',
  [ErrorCode.TICKET_TYPE_NOT_EXIST]: '票种不存在',
  [ErrorCode.TICKET_NOT_ENOUGH]: '余票不足',
  [ErrorCode.ETICKET_NOT_EXIST]: '电子票不存在',
  [ErrorCode.ETICKET_VERIFIED]: '电子票已核销',
  [ErrorCode.ETICKET_EXPIRED]: '电子票已过期',
  [ErrorCode.ROUTE_NOT_EXIST]: '路线不存在',
  [ErrorCode.ROUTE_BOOK_TOO_LATE]: '路线需至少提前 1 天预订',
  [ErrorCode.TICKET_CANNOT_REFUND]: '当前不可退票',

  [ErrorCode.NOTE_NOT_EXIST]: '游记不存在',
  [ErrorCode.NOTE_DAILY_LIMIT]: '每日最多发布 10 篇',
  [ErrorCode.NOTE_IMAGE_LIMIT]: '图片最多 9 张',
  [ErrorCode.NOTE_SENSITIVE_HIT]: '内容包含敏感词',
  [ErrorCode.COMMENT_NOT_EXIST]: '评论不存在',
  [ErrorCode.TOPIC_NOT_EXIST]: '话题不存在',
  [ErrorCode.REPORT_EXIST]: '已举报过',

  [ErrorCode.ADMIN_NOT_EXIST]: '管理员不存在',
  [ErrorCode.ADMIN_PASSWORD_ERROR]: '账号或密码错误',
  [ErrorCode.MERCHANT_NOT_EXIST]: '商家不存在',
  [ErrorCode.MERCHANT_STATUS_ERROR]: '商家状态异常',
  [ErrorCode.ROLE_NOT_EXIST]: '角色不存在',
  [ErrorCode.PERMISSION_DENIED]: '无操作权限',
  [ErrorCode.APPLY_NOT_EXIST]: '入驻申请不存在',
  [ErrorCode.SETTLEMENT_NOT_EXIST]: '结算单不存在',

  [ErrorCode.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCode.ORDER_STATUS_INVALID]: '订单状态流转不合法',
  [ErrorCode.STOCK_NOT_ENOUGH]: '库存不足',
  [ErrorCode.PAY_FAIL]: '支付失败',
  [ErrorCode.CART_ITEM_INVALID]: '购物车中存在失效商品',
  [ErrorCode.CART_EMPTY]: '购物车为空',
  [ErrorCode.ORDER_NOT_PAYABLE]: '订单不可支付',
  [ErrorCode.ORDER_CANNOT_CANCEL]: '当前状态不可取消',
  [ErrorCode.REFUND_NOT_ALLOWED]: '当前状态不可退款',
  [ErrorCode.REFUND_AMOUNT_INVALID]: '退款金额不合法',
  [ErrorCode.IDEMPOTENT_CONFLICT]: '请勿重复提交',
  [ErrorCode.FREQUENT_LIMIT]: '操作过于频繁',
};
