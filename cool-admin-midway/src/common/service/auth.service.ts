import { Provide, Config } from '@midwayjs/core';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../decorator/current-user';
import { Role, ClientType } from '../constants/biz-type';
import { BizException } from '../biz-error';
import { ErrorCode } from '../constants/error-code';

/**
 * 鉴权服务（设计文档 §6.2）
 *
 * | 项   | 值                                            |
 * |------|-----------------------------------------------|
 * | 载荷 | { userId, role, merchantId, client }           |
 * | 有效期 | 用户端 7 天；管理端 2 小时                      |
 * | 传参 | Authorization: Bearer <token>                  |
 */
@Provide()
export class AuthService {
  @Config('wudong')
  wudongConfig: {
    jwtSecret: string;
    userTokenExpire: number;
    adminTokenExpire: number;
  };

  private get secret(): string {
    return this.wudongConfig?.jwtSecret || 'wudong-dev-secret';
  }

  /** 用户端 token：默认 7 天 */
  signUser(user: {
    id: number;
    role?: string;
    merchantId?: number;
  }, client: ClientType | string = ClientType.PC): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      role: user.role || Role.USER,
      merchantId: user.merchantId,
      client: String(client),
    };
    return jwt.sign(payload, this.secret, {
      expiresIn: this.wudongConfig?.userTokenExpire || 7 * 24 * 3600,
    });
  }

  /** 管理端 token：默认 2 小时 */
  signAdmin(admin: {
    id: number;
    role?: string;
    merchantId?: number;
  }): string {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: admin.id,
      role: admin.role || Role.ADMIN,
      merchantId: admin.merchantId,
      client: ClientType.ADMIN,
    };
    return jwt.sign(payload, this.secret, {
      expiresIn: this.wudongConfig?.adminTokenExpire || 2 * 3600,
    });
  }

  /** 校验 token，失败抛业务异常 */
  verify(token: string): JwtPayload {
    if (!token) {
      throw new BizException(ErrorCode.UNAUTHORIZED);
    }
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new BizException(ErrorCode.LOGIN_EXPIRED);
      }
      throw new BizException(ErrorCode.UNAUTHORIZED);
    }
  }

  /** 从 Authorization 头解析 token */
  parseToken(authorization: string): string {
    if (!authorization) return '';
    const parts = authorization.split(' ');
    if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
      return parts[1];
    }
    return authorization;
  }
}
