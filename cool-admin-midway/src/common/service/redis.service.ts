import {
  Provide,
  Scope,
  ScopeEnum,
  Init,
  Destroy,
  Config,
  Logger,
  ILogger,
} from '@midwayjs/core';
import Redis from 'ioredis';

/**
 * Redis 服务（设计文档 §9 幂等、§11 验证码、§12 缓存）
 *
 * 用途边界：Redis 只用于缓存、验证码、幂等键与限流计数，
 * **不作为库存的最终依据**（库存一律走 MySQL 条件更新）。
 */
@Provide()
@Scope(ScopeEnum.Singleton)
export class RedisService {
  private client: Redis;

  @Config('redis')
  redisConfig: { host: string; port: number; password?: string; db?: number };

  @Logger()
  logger: ILogger;

  @Init()
  async init() {
    const cfg = this.redisConfig || { host: '127.0.0.1', port: 6379 };
    this.client = new Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password || undefined,
      db: cfg.db || 0,
      lazyConnect: false,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
    });

    this.client.on('error', err => {
      this.logger.error('[redis] 连接异常：%s', err.message);
    });
    this.client.on('connect', () => {
      this.logger.info(
        `[redis] 已连接 ${cfg.host}:${cfg.port}`
      );
    });
  }

  @Destroy()
  async destroy() {
    if (this.client) {
      await this.client.quit().catch(() => undefined);
    }
  }

  /** 原始客户端，仅在本服务封装不够用时才允许直接取用 */
  get raw(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  /**
   * SETNX 幂等锁（设计文档 §9）
   * @returns true 表示抢到锁（首次提交）；false 表示已有并发请求在处理
   */
  async tryLock(key: string, value = '1', ttlSeconds = 30): Promise<boolean> {
    const res = await this.client.set(key, value, 'EX', ttlSeconds, 'NX');
    return res === 'OK';
  }

  /**
   * 幂等：同一 key 在 ttl 内重复提交返回已存在的值
   * @returns 首次返回 null；重复返回之前存的值
   */
  async idempotentGet(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async idempotentSet(
    key: string,
    value: string,
    ttlSeconds = 300
  ): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  /** 限流：ttl 秒内允许 max 次，超过返回 false */
  async rateLimit(
    key: string,
    max: number,
    ttlSeconds: number
  ): Promise<boolean> {
    const count = await this.client.incr(key);
    if (count === 1) {
      await this.client.expire(key, ttlSeconds);
    }
    return count <= max;
  }

  /** 带计数的每日限额，如社区每日最多发 10 篇 */
  async dailyCount(key: string): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      await this.client.expire(key, Math.ceil((end.getTime() - now.getTime()) / 1000));
    }
    return count;
  }
}
