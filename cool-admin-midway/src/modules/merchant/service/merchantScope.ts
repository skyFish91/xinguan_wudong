import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MerchantEntity } from '../entity/merchant';

/**
 * 商家数据隔离（设计文档 §7.3）
 * 管理端查询必须经过它注入 merchantId 过滤，防越权。
 */
@Provide()
export class MerchantScopeService {
  @InjectEntityModel(MerchantEntity)
  merchantEntity: Repository<MerchantEntity>;

  @Inject()
  ctx;

  /**
   * 若当前后台用户是商家，返回其 merchantId；否则返回 undefined（平台管理员看全量）。
   * 超管判定：Cool Admin 约定 username === 'admin'（见 base/middleware/authority.ts）。
   */
  async getMerchantId(ctx?: any): Promise<number | undefined> {
    const c = ctx || this.ctx;
    const admin = c?.admin; // 后台鉴权注入 ctx.admin
    if (!admin) {
      return undefined; // 非后台请求
    }
    if (admin.username === 'admin') {
      return undefined; // 超管看全量
    }
    const merchant = await this.merchantEntity.findOneBy({
      ownerUserId: admin.userId,
      status: 1,
    });
    return merchant?.id;
  }
}
