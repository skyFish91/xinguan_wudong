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
 *  - /api/auth/*                公开（登录/注册/profile）
 *  - /api/admin/*               仅 admin
 *  - /api/merchant/*            商家本人 + admin（商家管理域）
 *  - /api/(home|clothing|food|hotel|travel|community|search)/*  的 GET  公开（游客浏览）
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

      // 公开接口
      if (path.startsWith('/api/auth/')) {
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

      // 商家管理域（merchant 或 admin）
      if (path.startsWith('/api/merchant/')) {
        this.requireUser(ctx);
        const user = ctx.currentUser as CurrentUser;
        if (!['merchant', 'admin'].includes(user.role)) {
          throw BizError.forbidden('仅商家或管理员可访问');
        }
        await next();
        return;
      }

      // 用户端公开浏览接口（GET）：首页/衣/食/住/行/社区/搜索的浏览数据游客可见；
      // 排除“我的”类 GET（收藏/我的评论/我的电子票/我的帖子等）仍要求登录
      const browseMatch = path.match(/^\/api\/(home|clothing|food|hotel|travel|community|search)(\/|$)/);
      const isPrivateGet = /(\/my\/|\/my-|\/favorite|\/eticket)/.test(path);
      if (browseMatch && ctx.method === 'GET' && !isPrivateGet) {
        await next();
        return;
      }

      // 其它 /api/*（如上传、社区用户接口）要求登录
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