import { Provide } from '@midwayjs/core';
import { randomUUID } from 'crypto';
import { PayProvider } from './payProvider';

/**
 * 模拟支付（设计文档 §10、§1.5）：点支付直接成功，无外部依赖。
 */
@Provide()
export class MockPayProvider implements PayProvider {
  async createPayment(orderNo: string, amountFen: number) {
    return { payNo: `MOCK-${randomUUID()}`, prepayId: undefined };
  }

  async queryPayment(orderNo: string): Promise<'SUCCESS' | 'PENDING' | 'FAIL'> {
    return 'SUCCESS';
  }

  async refund(orderNo: string, amountFen: number) {
    return { refundNo: `MOCKRF-${randomUUID()}` };
  }
}
