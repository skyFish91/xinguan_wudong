/**
 * 支付抽象（设计文档 §10）
 * 无商户号，本期默认 MockPayProvider；资质就绪后切换 WechatPayProvider，接口不变。
 */
export interface PayProvider {
  createPayment(
    orderNo: string,
    amountFen: number
  ): Promise<{ payNo: string; prepayId?: string }>;
  queryPayment(orderNo: string): Promise<'SUCCESS' | 'PENDING' | 'FAIL'>;
  refund(orderNo: string, amountFen: number): Promise<{ refundNo: string }>;
}
