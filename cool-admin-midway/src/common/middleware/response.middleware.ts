import { Middleware, IMiddleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { ErrorCode, ERROR_MESSAGE } from '../constants/error-code';
import { COOL_SUCCESS_CODE, isResultBody } from '../result';

/**
 * 统一响应包装中间件（设计文档 §5.1）
 *
 * 职责：
 *   1. Controller 直接 return 业务数据，这里包成 { code:0, message:'ok', data }
 *   2. 把 Cool Admin 内置模块的 code:1000 归一化为 0（全平台只有一种成功码）
 *   3. 业务异常 BizException 由 CoolExceptionFilter 转成 { code, message }，
 *      这里补齐 data 与 traceId
 *   4. HTTP 状态码一律 200，业务成败只看 code
 *
 * 只处理 /api/ 前缀，Cool Admin 自带的 /admin/** 接口不受影响。
 */
@Middleware()
export class ResponseMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const traceId = this.genTraceId(ctx);

      try {
        await next();
      } catch (err) {
        // 兜底：任何漏网异常都不许把堆栈抛给前端
        ctx.status = 200;
        ctx.body = {
          code: err?.status || err?.code || ErrorCode.SYSTEM_ERROR,
          message: err?.message || ERROR_MESSAGE[ErrorCode.SYSTEM_ERROR],
          data: null,
          traceId,
        };
        return;
      }

      if (!ctx.path.startsWith('/api/')) return;

      const body = ctx.body;

      // 空响应 → 成功但无数据
      if (body === undefined || body === null) {
        ctx.status = 200;
        ctx.body = { code: ErrorCode.SUCCESS, message: 'ok', data: null, traceId };
        return;
      }

      // 非对象（字符串/流/Buffer）→ 原样包装
      if (typeof body !== 'object' || Buffer.isBuffer(body)) {
        ctx.status = 200;
        ctx.body = { code: ErrorCode.SUCCESS, message: 'ok', data: body, traceId };
        return;
      }

      // 已经是统一响应体：归一化 cool 的 1000，补齐字段
      if (isResultBody(body)) {
        const code = body.code === COOL_SUCCESS_CODE ? ErrorCode.SUCCESS : body.code;
        ctx.status = 200;
        ctx.body = {
          code,
          message: body.message || ERROR_MESSAGE[code] || 'ok',
          data: body.data ?? null,
          traceId,
        };
        return;
      }

      // 普通对象 / 数组 → 包成 data
      ctx.status = 200;
      ctx.body = { code: ErrorCode.SUCCESS, message: 'ok', data: body, traceId };
    };
  }

  private genTraceId(ctx: Context): string {
    const incoming = ctx.get('x-trace-id');
    if (incoming) return incoming;
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }

  static getName() {
    return 'wudongResponse';
  }
}
