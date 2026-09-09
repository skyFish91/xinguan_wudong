import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { MockPayProvider } from '../provider/mockPayProvider';
import { OrderService } from '../../order/service/order';
import { OrderStatus } from '../../../common/order-status';

/**
 * 统一支付服务（设计文档 §10）
 */
@Provide()
export class PayService extends BaseService {
  @Inject()
  provider: MockPayProvider; // 后续按配置切换 WechatPayProvider

  @Inject()
  orderService: OrderService;

  /**
   * 发起支付（mock 直接改状态为 PAID）
   */
  async pay(orderNo: string) {
    const order = await this.orderService.orderEntity.findOneBy({ orderNo });
    if (!order) throw new Error('订单不存在');
    if (order.status !== OrderStatus.PENDING) {
      return { paid: false, reason: '订单已处理' };
    }
    const res = await this.provider.createPayment(orderNo, order.payAmount);
    await this.orderService.changeStatus(order.id, OrderStatus.PAID, null, '支付成功(mock)');
    return { paid: true, payNo: res.payNo };
  }

  /**
   * 支付回调幂等（设计文档 §29.3）：重复回调不重复改状态
   */
  async handleNotify(payload: any) {
    const order = await this.orderService.orderEntity.findOneBy({
      orderNo: payload.out_trade_no,
    });
    if (!order) return { code: 'FAIL' };
    if (order.status !== OrderStatus.PENDING) {
      return { code: 'SUCCESS' }; // 幂等：已处理
    }
    await this.orderService.changeStatus(order.id, OrderStatus.PAID, null, '支付回调');
    return { code: 'SUCCESS' };
  }
}
