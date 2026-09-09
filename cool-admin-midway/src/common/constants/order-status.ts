import { OrderStatus } from './biz-type';

/**
 * 订单状态机（设计文档 §7.3）
 *
 * PENDING ──支付成功──> PAID ──商家确认──> CONFIRMED ──发货/到店/入住──> ONGOING
 *    │                   │                                                  │
 *    │                   └──商家拒绝──> REFUNDED                    FINISHED ──> REVIEWED
 *    ├──用户取消──> CANCELLED
 *    └──超时未付──> CLOSED
 *
 * 硬规则（红线 4）：ord_order.status 只能通过 OrderService.changeStatus() 变更，
 * 任何其他地方直接 UPDATE 该字段均属违规。
 */
export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [
    OrderStatus.PAID,
    OrderStatus.CANCELLED,
    OrderStatus.CLOSED,
  ],
  [OrderStatus.PAID]: [
    OrderStatus.CONFIRMED,
    OrderStatus.ONGOING,
    OrderStatus.REFUNDED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.ONGOING,
    OrderStatus.FINISHED,
    OrderStatus.REFUNDED,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.ONGOING]: [OrderStatus.FINISHED, OrderStatus.REFUNDED],
  [OrderStatus.FINISHED]: [OrderStatus.REVIEWED, OrderStatus.REFUNDED],
  [OrderStatus.REVIEWED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.CLOSED]: [],
  [OrderStatus.REFUNDED]: [],
};

/** 订单终态：进入后不再允许任何流转 */
export const ORDER_FINAL_STATUS: OrderStatus[] = [
  OrderStatus.CANCELLED,
  OrderStatus.CLOSED,
  OrderStatus.REFUNDED,
  OrderStatus.REVIEWED,
];

/** 判断 from → to 是否合法 */
export function canChangeStatus(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) return false;
  return (ORDER_STATUS_FLOW[from] || []).includes(to);
}

/** 订单状态中文名，供订单日志与消息通知使用 */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '待支付',
  [OrderStatus.PAID]: '待确认',
  [OrderStatus.CONFIRMED]: '已确认',
  [OrderStatus.ONGOING]: '进行中',
  [OrderStatus.FINISHED]: '已完成',
  [OrderStatus.REVIEWED]: '已评价',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.CLOSED]: '已关闭',
  [OrderStatus.REFUNDED]: '已退款',
};

/**
 * 事件名常量 —— 各业务板块通过 @OnEvent 订阅，公共层不反向依赖业务模块。
 * 例：住板块订阅 ORDER_PAID 扣房态，订阅 ORDER_CANCELLED / ORDER_REFUNDED 释放房态。
 */
export const ORDER_EVENT = {
  CREATED: 'order.created',
  PAID: 'order.paid',
  CONFIRMED: 'order.confirmed',
  CANCELLED: 'order.cancelled',
  CLOSED: 'order.closed',
  REFUNDED: 'order.refunded',
  FINISHED: 'order.finished',
} as const;

/** 订单事件对应的目标状态，状态机变更成功后据此发事件 */
export const STATUS_EVENT: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PAID]: ORDER_EVENT.PAID,
  [OrderStatus.CONFIRMED]: ORDER_EVENT.CONFIRMED,
  [OrderStatus.CANCELLED]: ORDER_EVENT.CANCELLED,
  [OrderStatus.CLOSED]: ORDER_EVENT.CLOSED,
  [OrderStatus.REFUNDED]: ORDER_EVENT.REFUNDED,
  [OrderStatus.FINISHED]: ORDER_EVENT.FINISHED,
};
