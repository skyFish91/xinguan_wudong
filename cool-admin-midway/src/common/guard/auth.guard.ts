import { Provide, Guard, IGuard, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { AuthService } from '../service/auth.service';
import { isPublicMethod } from '../decorator/public';

/**
 * 登录守卫
 *
 * - 方法上加了 @Public() 的，直接放行
 * - /api/v1/admin/** 走 Cool Admin 自带鉴权，这里不拦
 * - 其余要求 Authorization: Bearer <token>，校验通过后把载荷挂到 ctx.state.user
 *
 * 用法：在 Controller 类上加 @UseGuard(AuthGuard) 或 @Guard(AuthGuard)
 */
@Provide()
@Guard()
export class AuthGuard implements IGuard<Context> {
  @Inject()
  authService: AuthService;

  async canActivate(
    ctx: Context,
    supplierClz: any,
    methodName: string
  ): Promise<boolean> {
    // 免鉴权方法
    if (isPublicMethod(supplierClz, methodName)) return true;

    // 管理端接口交给 Cool Admin 自身的鉴权中间件
    if (ctx.path.startsWith('/api/v1/admin/')) return true;

    const token = this.authService.parseToken(ctx.get('authorization'));
    const payload = this.authService.verify(token);
    ctx.state.user = payload;
    return true;
  }
}
