import { ErrorCode, ERROR_MESSAGE } from './constants/error-code';

/**
 * 业务异常：携带号段内的业务错误码。
 *
 * Cool Admin 的 CoolExceptionFilter 会把 err.status 映射到响应 { code, message }，
 * 因此这里用 status 承载业务码（见 node_modules/@cool-midway/core/dist/exception/filter.js）。
 *
 * 用法：
 *   throw new BizException(ErrorCode.STOCK_NOT_ENOUGH);           // 取默认文案
 *   throw new BizException(ErrorCode.PARAM_ERROR, '库存不能为负'); // 自定义文案
 */
export class BizException extends Error {
  status: number;
  statusCode?: number;
  /** 业务错误码，与 status 同源，便于业务侧读取 */
  code: number;

  constructor(code: number, message?: string, statusCode?: number) {
    super(message || ERROR_MESSAGE[code] || '操作失败');
    this.name = 'BizException';
    this.status = code;
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** 便捷构造：throw bizError(ErrorCode.STOCK_NOT_ENOUGH) */
export function bizError(code: ErrorCode, message?: string): BizException {
  return new BizException(code, message);
}
