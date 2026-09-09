import { OrderStatus, canTransit } from '../../../src/common/order-status';

describe('订单状态机', () => {
  it('合法流转', () => {
    expect(canTransit(OrderStatus.PENDING, OrderStatus.PAID)).toBe(true);
    expect(canTransit(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
    expect(canTransit(OrderStatus.PENDING, OrderStatus.CLOSED)).toBe(true);
    expect(canTransit(OrderStatus.PAID, OrderStatus.CONFIRMED)).toBe(true);
    expect(canTransit(OrderStatus.PAID, OrderStatus.REFUNDED)).toBe(true);
    expect(canTransit(OrderStatus.ONGOING, OrderStatus.FINISHED)).toBe(true);
    expect(canTransit(OrderStatus.FINISHED, OrderStatus.REVIEWED)).toBe(true);
  });

  it('非法流转', () => {
    expect(canTransit(OrderStatus.PENDING, OrderStatus.REVIEWED)).toBe(false);
    expect(canTransit(OrderStatus.PAID, OrderStatus.PENDING)).toBe(false);
    expect(canTransit(OrderStatus.CANCELLED, OrderStatus.PAID)).toBe(false);
    expect(canTransit(OrderStatus.REVIEWED, OrderStatus.PAID)).toBe(false);
  });
});
