import { ErrorCode } from './constants/error-code';

/**
 * 业务异常：携带号段内的业务错误码。
 * Cool Admin 的 CoolExceptionFilter 会把 err.status 映射到响应 { code, message }，
 * 因此这里用 status 承载业务码（见 node_modules/@cool-midway/core/dist/exception/filter.js）。
 */
export class BizException extends Error {
  status: number;
  statusCode?: number;

  constructor(code: number, message: string, statusCode?: number) {
    super(message);
    this.name = 'BizException';
    this.status = code;
    this.statusCode = statusCode;
  }
}

export function bizError(code: ErrorCode, message: string): BizException {
  return new BizException(code, message);
}
