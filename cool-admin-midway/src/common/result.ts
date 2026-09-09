import { ErrorCode, ERROR_MESSAGE } from './constants/error-code';

/**
 * 统一响应体（设计文档 §5.1）
 *
 *   { "code": 0, "message": "ok", "data": {}, "traceId": "a1b2c3" }
 *
 * Controller 直接 return 业务数据即可，由 response.middleware 自动包装，
 * 不要手写 { code, message, data }。
 */
export interface ResultBody<T = any> {
  code: number;
  message: string;
  data: T | null;
  traceId?: string;
}

/** 分页结构（设计文档 §17） */
export interface PageBody<T = any> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
}

export class Result {
  static ok<T>(data: T = null as any, message = 'ok'): ResultBody<T> {
    return { code: ErrorCode.SUCCESS, message, data };
  }

  static page<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number
  ): ResultBody<PageBody<T>> {
    return Result.ok({
      list: list || [],
      total: total || 0,
      page: page || 1,
      pageSize: pageSize || 10,
      totalPage: Math.ceil((total || 0) / (pageSize || 10)),
    });
  }

  static fail(code: number, message?: string): ResultBody {
    return { code, message: message || ERROR_MESSAGE[code] || '操作失败', data: null };
  }
}

/** Cool Admin 内部成功码，响应中间件会把它归一化为 0 */
export const COOL_SUCCESS_CODE = 1000;

/** 判断一个返回值是否已经是「统一响应体」形态 */
export function isResultBody(body: any): body is ResultBody {
  return (
    body &&
    typeof body === 'object' &&
    typeof (body as any).code === 'number' &&
    'message' in body &&
    'data' in body
  );
}
