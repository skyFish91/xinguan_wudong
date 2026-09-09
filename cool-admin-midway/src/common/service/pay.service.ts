import { Provide, Config, Logger, ILogger } from '@midwayjs/core';

export interface PayResult {
  success: boolean;
  /** 支付渠道：MOCK / WECHAT / ALIPAY */
  payType: string;
  /** 渠道流水号 */
  tradeNo?: string;
  message?: string;
  /** 唤起支付所需的参数，真实渠道才有 */
  params?: any;
}

export interface RefundResult {
  success: boolean;
  refundNo?: string;
  message?: string;
}

/**
 * 支付Provider抽象（设计文档 §9）
 *
 * 新增渠道只需实现本接口并在 PayService 里注册，业务代码零改动。
 */
export interface PayProvider {
  readonly name: string;
  createPayment(orderNo: string, amountFen: number): Promise<PayResult>;
  queryPayment(orderNo: string): Promise<{ paid: boolean; tradeNo?: string }>;
  refund(orderNo: string, amountFen: number): Promise<RefundResult>;
}

/** 本期默认：无外部依赖，点「支付」直接成功 */
export class MockPayProvider implements PayProvider {
  readonly name = 'MOCK';

  async createPayment(orderNo: string, amountFen: number): Promise<PayResult> {
    console.log(`[mock-pay] 订单 ${orderNo} 支付 ${amountFen} 分 —— 模拟支付成功`);
    return {
      success: true,
      payType: 'MOCK',
      tradeNo: `MOCK${Date.now()}${Math.floor(Math.random() * 1000)}`,
    };
  }

  async queryPayment(orderNo: string) {
    return { paid: true, tradeNo: `MOCK${orderNo}` };
  }

  async refund(orderNo: string, amountFen: number): Promise<RefundResult> {
    console.log(`[mock-pay] 订单 ${orderNo} 退款 ${amountFen} 分 —— 模拟退款成功`);
    return { success: true, refundNo: `RF${Date.now()}` };
  }
}

/** 预留：有商户号后填充，接口不变 */
export class WechatPayProvider implements PayProvider {
  readonly name = 'WECHAT';

  constructor(private config: any) {}

  async createPayment(): Promise<PayResult> {
    return { success: false, payType: 'WECHAT', message: '微信支付未配置' };
  }

  async queryPayment() {
    return { paid: false };
  }

  async refund(): Promise<RefundResult> {
    return { success: false, message: '微信支付未配置' };
  }
}

/**
 * 统一支付服务
 *
 * 通过配置 pay.provider 切换渠道，本期固定 MOCK。
 */
@Provide()
export class PayService {
  @Config('wudong')
  wudongConfig: { payProvider?: string; wechatPay?: any };

  @Logger()
  logger: ILogger;

  private get provider(): PayProvider {
    const name = this.wudongConfig?.payProvider || 'MOCK';
    if (name === 'WECHAT') {
      return new WechatPayProvider(this.wudongConfig?.wechatPay);
    }
    return new MockPayProvider();
  }

  async createPayment(orderNo: string, amountFen: number): Promise<PayResult> {
    this.logger.info(`[pay] ${orderNo} 发起支付 ${amountFen} 分`);
    return this.provider.createPayment(orderNo, amountFen);
  }

  async queryPayment(orderNo: string) {
    return this.provider.queryPayment(orderNo);
  }

  async refund(orderNo: string, amountFen: number): Promise<RefundResult> {
    this.logger.info(`[pay] ${orderNo} 发起退款 ${amountFen} 分`);
    return this.provider.refund(orderNo, amountFen);
  }
}
