/**
 * 统一订单状态机（设计文档 §8.3）。
 * 状态变更唯一入口是 OrderService.changeStatus()（Task 4）。
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  REVIEWED = 'REVIEWED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED',
  REFUNDED = 'REFUNDED',
}

export const OrderTransition: Record<string, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.CLOSED],
  [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.REFUNDED],
  [OrderStatus.CONFIRMED]: [OrderStatus.ONGOING, OrderStatus.REFUNDED],
  [OrderStatus.ONGOING]: [OrderStatus.FINISHED],
  [OrderStatus.FINISHED]: [OrderStatus.REVIEWED, OrderStatus.REFUNDED],
};

export function canTransit(from: OrderStatus, to: OrderStatus): boolean {
  return OrderTransition[from]?.includes(to) ?? false;
}
