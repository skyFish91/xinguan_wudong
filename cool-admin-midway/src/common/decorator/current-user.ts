import { createCustomParamDecorator } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

/** 参数装饰器唯一 key，需在启动时注册 handler（见 configuration.ts） */
export const CURRENT_USER_KEY = 'wudong:currentUser';
export const CURRENT_USER_ID_KEY = 'wudong:currentUserId';

/** JWT 载荷（设计文档 §6.2） */
export interface JwtPayload {
  /** 用户 ID（usr_user.id） */
  userId: number;
  /** 角色：USER / MERCHANT / ADMIN */
  role: string;
  /** 商家 ID，仅 MERCHANT 角色有值 */
  merchantId?: number;
  /** 客户端来源：PC / MINI / ADMIN */
  client?: string;
  /** 签发时间（秒） */
  iat?: number;
  /** 过期时间（秒） */
  exp?: number;
}

/** 从 Koa 上下文中取登录态 */
function userOf(ctx: Context): JwtPayload | null {
  return (ctx?.state?.user || null) as JwtPayload | null;
}

/**
 * 取当前登录用户（设计文档 §6.2）
 *
 * 用法：async list(@CurrentUser() user: JwtPayload) { ... }
 * 未登录时 AuthGuard 会先拦截，所以这里拿到的 user 一定有值。
 */
export function CurrentUser() {
  return createCustomParamDecorator(CURRENT_USER_KEY, {}, { impl: true });
}

/** 取当前用户 ID，未登录返回 null（用于「登录可选」的接口） */
export function CurrentUserId() {
  return createCustomParamDecorator(CURRENT_USER_ID_KEY, {}, { impl: true });
}

/**
 * 注册参数解析 handler
 * Koa 场景下 originArgs = [ctx, next]
 */
export function registerCurrentUserHandlers(register: (key: string, fn: any) => void) {
  register(CURRENT_USER_KEY, (options: any) => {
    return userOf(options.originArgs?.[0]);
  });
  register(CURRENT_USER_ID_KEY, (options: any) => {
    return userOf(options.originArgs?.[0])?.userId ?? null;
  });
}
