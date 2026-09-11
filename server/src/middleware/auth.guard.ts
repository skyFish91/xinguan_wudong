import { IMiddleware, Inject, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { BizError } from '../common/BizError';
import { CurrentUser } from '../common/decorators';

/**
 * 鉴权中间件（粗粒度，按路径前缀拦截）：
 *
 * 为什么不用 @Auth 装饰器 + Reflect.getMetadata：
 * 全局中间件在路由中间件之前执行，ctx.handler 还没挂上去（甚至连 metadata 都不在该对象上）。
 * 老代码 Reflect.getMetadata('auth:roles', handler) 永远拿不到，装饰器形同虚设。
 *
 * 策略：路径前缀匹配 + 角色检查。
 *  - /api/auth/(login|register|sms-code|refresh)   公开
 *  - /api/auth/(profile|password)                  要求登录（个人数据）
 *  - /api/admin/*               仅 admin
 *  - /api/(clothing|food|hotel|travel|community)/admin/*  仅 admin（运营域管理员接口）
 *  - /api/merchant/*            要求登录（商家角色由 controller 内 mustMerchant 精确校验）
 *  - /api/home、/api/ai/*       公开浏览
 *  - /api/(clothing|food|hotel|travel|community|search)/* 的 GET  公开浏览（游客可看列表/详情）
 *  - /api/travel/* 的非 GET     仅商家/管理员（写操作）
 *  - 其它 /api/*                要求登录即可
 *
 * 商家类型的精确校验（merchantType 与商家自身匹配）由 controller 内调 mustMerchant() 完成。
 */
@Middleware()
export class AuthGuard implements IMiddleware<Context, NextFunction> {
  @Inject()
  jwtService: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 1. 解析 token（无论是否需要鉴权都给 ctx.currentUser 备用）
      const authHeader = ctx.headers['authorization'] || '';
      if (authHeader.startsWith('Bearer ')) {
        try {
          const payload = (await this.jwtService.verify(authHeader.slice(7))) as any;
          ctx.currentUser = {
            userId: Number(payload.userId),
            role: payload.role,
            merchantId: payload.merchantId ? Number(payload.merchantId) : undefined,
            merchantType: payload.merchantType,
          } as CurrentUser;
        } catch (err) {
          ctx.currentUser = null;
        }
      }

      // 2. 路径级鉴权
      const path = ctx.path || '';
      if (!path.startsWith('/api/')) {
        // 非 /api 路径（如 health、uploads）直接放行
        await next();
        return;
      }

      // 公开接口：仅登录/注册/验证码/刷新令牌
      // （/api/auth/profile、/api/auth/password 属于个人数据，必须登录，否则 controller 里 user 为 null 会 500）
      if (/^\/api\/auth\/(login|register|sms-code|refresh)(\/|$)/.test(path)) {
        await next();
        return;
      }

      // 平台管理域
      if (path.startsWith('/api/admin/')) {
        this.requireUser(ctx);
        this.requireRole(ctx, 'admin');
        await next();
        return;
      }

      // 运营域管理员接口（按模块前缀的 admin/*）
      const moduleAdminMatch = path.match(/^\/api\/(clothing|food|hotel|travel|community)\/admin\//);
      if (moduleAdminMatch) {
        this.requireUser(ctx);
        this.requireRole(ctx, 'admin');
        await next();
        return;
      }

      // 商家管理接口（商家中心，角色由 controller 内 mustMerchant 精确校验）
      if (path.startsWith('/api/merchant/')) {
        this.requireUser(ctx);
        await next();
        return;
      }

      // 游客可浏览的公开接口：
      //  - 首页 / AI 客服：全部放行
      //  - 衣食住行/社区/搜索：GET 放行（列表、详情浏览）
      //  - 例外：/api/travel/my-etickets 是个人数据，必须登录
      const publicBrowse =
        /^\/api\/home(\/|$)/.test(path) ||
        /^\/api\/ai(\/|$)/.test(path) ||
        (/^\/api\/(clothing|food|hotel|travel|community|search)\//.test(path) &&
          ctx.method === 'GET' &&
          !path.startsWith('/api/travel/my-etickets'));
      if (publicBrowse) {
        await next();
        return;
      }

      // 商家写接口：travel 模块的非 GET（create/update/delete 等）仅商家/管理员
      if (/^\/api\/travel\//.test(path) && ctx.method !== 'GET') {
        this.requireUser(ctx);
        const user = ctx.currentUser as CurrentUser;
        if (!['merchant', 'admin'].includes(user.role)) {
          throw BizError.forbidden('仅商家或管理员可访问');
        }
        await next();
        return;
      }

      // 其它 /api/*（下单、收藏、评价、上传、个人数据等）要求登录
      this.requireUser(ctx);

      await next();
    };
  }

  private requireUser(ctx: Context) {
    const user = ctx.currentUser as CurrentUser;
    if (!user || !user.userId) {
      throw BizError.unauthorized('请先登录');
    }
  }

  private requireRole(ctx: Context, ...roles: string[]) {
    const user = ctx.currentUser as CurrentUser;
    if (!user || !roles.includes(user.role)) {
      throw BizError.forbidden(`仅 ${roles.join('/')} 可访问`);
    }
  }

  static getName(): string {
    return 'auth';
  }
}