# 乌东文旅平台 — Phase 0 公共基础层 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一个可运行的 wudong-server 后端骨架（Midway.js + Cool Admin），包含数据库/缓存连接、公共代码（错误码/统一返回/工具）、用户实体与登录鉴权、OSS 上传，作为衣/食/住/行/社区/后台六个模块的地基。

**Architecture:** 单仓库单体（modular monolith）。`wudong-server` 基于 Cool Admin Midway 模板启动，`src/common` 放跨模块公共代码（错误码、异常、返回体、金额/ID 工具），`src/modules/{base,user,auth,upload}` 放本阶段模块。MySQL 8 + Redis 7 由 docker-compose 拉起，TypeORM `synchronize: true` 开发期自动建表。

**Tech Stack:** Node 18 / TypeScript 5、Midway.js 3.x、Cool Admin Midway（TypeORM + Redis 基座）、MySQL 8、Redis 7、pnpm、Docker Compose、Jest（@midwayjs/jest）。

**Spec:** `C:\Users\Lenovo\xinguan_wudong\2026-09-08-wudong-platform-detailed-design.md`（§0、§1、§2.3、§3.3、§6、§7）

**结构说明（重要，覆盖设计文档的两种仓库方案）：**
- 本计划按 **单仓库多目录** 落地（设计文档 §12.3 的兜底方案）。`@wudong/common` npm 包在本阶段等价实现为 `src/common` 目录，不建 Verdaccio、不拆包。
- 设计文档 §2.2 的 Verdaccio 多仓库方案**延后**为后续独立计划；届时若 Cool Admin 外部模块加载已确认，再做「`src/common` → `@wudong/common` 包」的迁移，公共代码接口签名不变。

## Global Constraints

- Node.js ≥ 18；包管理器 pnpm；TypeScript 5。
- 金额字段统一用 `BIGINT`（单位：分），代码内不得用浮点存金额。
- 主键 `id BIGINT UNSIGNED AUTO_INCREMENT`；时间 `DATETIME`；逻辑删除字段 `deleted TINYINT DEFAULT 0`。
- DB 列名 snake_case，实体属性 camelCase（TypeORM 用 `@Column({ name: ... })` 映射）。
- 统一返回体：`{ code, message, data }`，`code === 0` 表示成功。
- 错误码区间：1xxx 业务、2xxx 认证、3xxx 校验、4xxx 支付、5xxx 系统（见 `src/common/error-code.ts`）。
- 业务错误统一 HTTP 200 + 非零 `code`（全局异常过滤器负责）。
- 密钥一律走环境变量，`.env` 不进版本库。

---

### Task 1: 初始化 Cool Admin Midway 后端骨架

**Files:**
- Create: `wudong-server/package.json`、`wudong-server/tsconfig.json`、`wudong-server/.gitignore`、`wudong-server/.env.example`
- Create: `wudong-server/src/configuration.ts`、`wudong-server/src/bootstrap.ts`

**Interfaces:**
- Produces: 一个能 `pnpm dev` 启动、监听 7001 的空服务骨架，供后续任务挂载 config、模块、中间件。

- [ ] **Step 1: 拉取官方模板并确认可运行**

Run:
```bash
# 若官方提供 CLI：npx create-cool-admin-midway wudong-server
# 否则 git clone 官方 Cool Admin Midway 模板到 wudong-server 后删除 .git
cd wudong-server && pnpm install && pnpm dev
```
Expected: 控制台输出 `Midway started on port 7001`，浏览器访问 `http://127.0.0.1:7001` 返回非 404。

> 说明：模板确切命令/目录以官方最新文档为准（设计文档 §12.2 的 cool-js.com）。本步目标是「拿到官方脚手架 + 跑通」，不要手写 bootstrap。

- [ ] **Step 2: 固化依赖版本**

在 `package.json` 确认并锁定以下关键依赖存在（缺失则 `pnpm add`）：
```bash
pnpm add @midwayjs/core @midwayjs/koa @midwayjs/typeorm typeorm mysql2
pnpm add @midwayjs/redis @midwayjs/jwt @midwayjs/validate @midwayjs/oss
pnpm add -D @midwayjs/jest jest ts-jest supertest
```

- [ ] **Step 3: 写 `.env.example`**

```bash
# wudong-server/.env.example
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=root
DB_NAME=wudong
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=change-me
OSS_REGION=oss-cn-hangzhou
OSS_BUCKET=wudong-dev
OSS_AK=your-access-key
OSS_SK=your-secret-key
```

- [ ] **Step 4: `.gitignore` 排除本地产物与密钥**

```gitignore
node_modules/
dist/
.env
coverage/
*.log
```

- [ ] **Step 5: Commit**

```bash
git init && git add -A && git commit -m "chore: init cool-admin-midway skeleton"
```

---

### Task 2: Docker 环境 + 数据库/缓存连接

**Files:**
- Create: `wudong-server/docker-compose.yml`
- Create: `wudong-server/src/config/config.default.ts`、`wudong-server/src/config/config.local.ts`

**Interfaces:**
- Produces: `DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME`、`REDIS_HOST/REDIS_PORT` 环境变量可用；`config.default.ts` 暴露 typeorm / redis 配置对象。

- [ ] **Step 1: 写 docker-compose.yml**

```yaml
# wudong-server/docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: wudong-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wudong
      TZ: Asia/Shanghai
    command: --default-authentication-plugin=mysql_native_password
    ports: ["3306:3306"]
    volumes: ["./data/mysql:/var/lib/mysql"]
  redis:
    image: redis:7-alpine
    container_name: wudong-redis
    ports: ["6379:6379"]
```

- [ ] **Step 2: 启动并验证**

Run:
```bash
cd wudong-server && docker compose up -d
docker compose ps
```
Expected: 两个容器 `Up`。用 `pnpm add -D dotenv` 后本阶段开发用 `.env` 注入（或临时 `export DB_PASS=root`）。

- [ ] **Step 3: 写 config.default.ts**

```typescript
// wudong-server/src/config/config.default.ts
import { MidwayConfig } from '@midwayjs/core';

export default {
  koa: { port: 7001 },
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || 'root',
        database: process.env.DB_NAME || 'wudong',
        synchronize: true,
        logging: false,
        entities: ['**/entity/*.{ts,js}'],
      },
    },
  },
  redis: {
    client: { host: process.env.REDIS_HOST || '127.0.0.1', port: 6379, db: 0 },
  },
} as MidwayConfig;
```

- [ ] **Step 4: 写 config.local.ts（开发覆盖，含 JWT/OSS 占位）**

```typescript
// wudong-server/src/config/config.local.ts
export default {
  jwt: { secret: process.env.JWT_SECRET || 'dev-secret' },
  oss: {
    client: {
      region: process.env.OSS_REGION,
      bucket: process.env.OSS_BUCKET,
      accessKeyId: process.env.OSS_AK,
      accessKeySecret: process.env.OSS_SK,
    },
  },
};
```

- [ ] **Step 5: 重启服务确认连接**

Run:
```bash
pnpm dev
```
Expected: 无连接报错，服务正常启动（TypeORM 尚未有实体，不建表属正常）。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: docker mysql/redis + config"
```

---

### Task 3: src/common 公共代码（错误码 / 异常 / 返回体 / 金额工具）

**Files:**
- Create: `wudong-server/src/common/error-code.ts`、`wudong-server/src/common/exceptions.ts`、`wudong-server/src/common/response.ts`、`wudong-server/src/common/utils/money.ts`
- Test: `wudong-server/test/common/money.test.ts`、`wudong-server/test/common/error-code.test.ts`

**Interfaces:**
- Consumes: 无（地基任务）。
- Produces:
  - `ErrorCode` 枚举（`OK=0`, `BUSINESS_ERROR=1000`, `RESOURCE_NOT_FOUND=1001`, `STOCK_NOT_ENOUGH=1002`, `UNAUTHORIZED=2001`, `FORBIDDEN=2002`, `VALIDATION_ERROR=3001`, `PAY_SIGN_ERROR=4001`, `PAY_DUPLICATE=4002`, `SYSTEM_ERROR=5000`）
  - `class BizError extends Error { code: number }`
  - `ok(data?, message?)`、`fail(code, message)`
  - `yuanToFen(yuan): number`、`fenToYuan(fen): number`

- [ ] **Step 1: 写金额工具失败测试**

```typescript
// wudong-server/test/common/money.test.ts
import { yuanToFen, fenToYuan } from '../../src/common/utils/money';

describe('money', () => {
  it('元转分，四舍五入', () => {
    expect(yuanToFen(19.9)).toBe(1990);
    expect(yuanToFen(0.1)).toBe(10);
    expect(yuanToFen(1.005)).toBe(101);
  });
  it('分转元', () => {
    expect(fenToYuan(1990)).toBe(19.9);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test test/common/money.test.ts`
Expected: FAIL（模块不存在）。

- [ ] **Step 3: 实现 money.ts**

```typescript
// wudong-server/src/common/utils/money.ts
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100);
}

export function fenToYuan(fen: number): number {
  return fen / 100;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm test test/common/money.test.ts`
Expected: PASS。

- [ ] **Step 5: 写错误码 + 异常 + 返回体（含测试）**

```typescript
// wudong-server/src/common/error-code.ts
export enum ErrorCode {
  OK = 0,
  BUSINESS_ERROR = 1000,
  RESOURCE_NOT_FOUND = 1001,
  STOCK_NOT_ENOUGH = 1002,
  UNAUTHORIZED = 2001,
  FORBIDDEN = 2002,
  VALIDATION_ERROR = 3001,
  PAY_SIGN_ERROR = 4001,
  PAY_DUPLICATE = 4002,
  SYSTEM_ERROR = 5000,
}
```

```typescript
// wudong-server/src/common/exceptions.ts
import { ErrorCode } from './error-code';

export class BizError extends Error {
  code: number;
  constructor(code: number = ErrorCode.BUSINESS_ERROR, message = '业务错误') {
    super(message);
    this.name = 'BizError';
    this.code = code;
  }
}
```

```typescript
// wudong-server/src/common/response.ts
export function ok(data: unknown = null, message = 'ok') {
  return { code: 0, message, data };
}

export function fail(code: number, message: string) {
  return { code, message, data: null };
}
```

```typescript
// wudong-server/test/common/error-code.test.ts
import { BizError } from '../../src/common/exceptions';
import { ErrorCode } from '../../src/common/error-code';
import { ok, fail } from '../../src/common/response';

describe('common', () => {
  it('BizError 携带业务码', () => {
    const e = new BizError(ErrorCode.UNAUTHORIZED, '未登录');
    expect(e.code).toBe(2001);
  });
  it('统一返回体', () => {
    expect(ok({ id: 1 })).toEqual({ code: 0, message: 'ok', data: { id: 1 } });
    expect(fail(1001, '商品不存在').code).toBe(1001);
  });
});
```

- [ ] **Step 6: 跑全部 common 测试**

Run: `pnpm test test/common/`
Expected: 全部 PASS。

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(common): error-code, biz-error, response, money utils"
```

---

### Task 4: 全局异常过滤器 + 统一返回接入

**Files:**
- Create: `wudong-server/src/middleware/error.filter.ts`
- Test: `wudong-server/test/middleware/error.filter.test.ts`

**Interfaces:**
- Consumes: `BizError`、`ErrorCode`（Task 3）。
- Produces: 全局 `@Catch()` 过滤器，把 `BizError` 转为 `HTTP 200 + {code,message}`，未知异常转 `code:5000`。在 `configuration.ts` 注册后对全站生效。

- [ ] **Step 1: 写失败测试**

```typescript
// wudong-server/test/middleware/error.filter.test.ts
import { DefaultErrorFilter } from '../../src/middleware/error.filter';
import { BizError } from '../../src/common/exceptions';
import { ErrorCode } from '../../src/common/error-code';

describe('DefaultErrorFilter', () => {
  it('BizError -> HTTP200 + code', async () => {
    const ctx: any = { status: 200, body: null };
    const filter = new DefaultErrorFilter();
    await filter.catch(new BizError(ErrorCode.UNAUTHORIZED, '未登录'), ctx);
    expect(ctx.status).toBe(200);
    expect(ctx.body.code).toBe(2001);
    expect(ctx.body.message).toBe('未登录');
  });
  it('未知异常 -> 5000', async () => {
    const ctx: any = { status: 200, body: null };
    const filter = new DefaultErrorFilter();
    await filter.catch(new Error('boom'), ctx);
    expect(ctx.body.code).toBe(5000);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test test/middleware/error.filter.test.ts`
Expected: FAIL。

- [ ] **Step 3: 实现 error.filter.ts**

```typescript
// wudong-server/src/middleware/error.filter.ts
import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BizError } from '../common/exceptions';
import { ErrorCode } from '../common/error-code';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    const code = err instanceof BizError ? err.code : ErrorCode.SYSTEM_ERROR;
    const message = err instanceof BizError ? err.message : '系统错误';
    ctx.status = 200;
    ctx.body = { code, message, data: null };
  }
}
```

- [ ] **Step 4: 在 configuration.ts 注册过滤器**

在 `configuration.ts` 的 `onReady` 或过滤器配置中启用（具体挂载方式以 Cool Admin 模板为准，通常 `@Filter` 或 `config.middleware`）：

```typescript
import { DefaultErrorFilter } from './middleware/error.filter';
// 注册到应用过滤器列表，例如：
// this.app.useFilter(DefaultErrorFilter);
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm test test/middleware/error.filter.test.ts`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(common): global error filter"
```

---

### Task 5: 用户实体 + 基础表建表验证

**Files:**
- Create: `wudong-server/src/modules/user/entity/user.ts`
- Create: `wudong-server/src/modules/user/service/user.ts`

**Interfaces:**
- Consumes: typeorm 数据源（Task 2）。
- Produces: `UserEntity`（映射 `user` 表）、`UserService.findByPhone / findById / create`，供 Task 6 登录使用。

- [ ] **Step 1: 写 UserEntity**

```typescript
// wudong-server/src/modules/user/entity/user.ts
import { EntityModel } from '@midwayjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@EntityModel('user')
@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'phone', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password', length: 100, nullable: true })
  password: string;

  @Column({ name: 'wechat_openid', length: 64, nullable: true })
  wechatOpenid: string;

  @Column({ name: 'nickname', length: 50, nullable: true })
  nickname: string;

  @Column({ name: 'avatar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'gender', type: 'tinyint', default: 0 })
  gender: number;

  @Column({ name: 'status', type: 'tinyint', default: 0 })
  status: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'deleted', type: 'tinyint', default: 0 })
  deleted: number;
}
```

- [ ] **Step 2: 写 UserService**

```typescript
// wudong-server/src/modules/user/service/user.ts
import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/user';

@Provide()
export class UserService {
  @InjectEntityModel(UserEntity)
  repo: Repository<UserEntity>;

  findByPhone(phone: string) {
    return this.repo.findOneBy({ phone, deleted: 0 });
  }

  findByOpenid(openid: string) {
    return this.repo.findOneBy({ wechatOpenid: openid, deleted: 0 });
  }

  findById(id: number) {
    return this.repo.findOneBy({ id, deleted: 0 });
  }

  create(data: Partial<UserEntity>) {
    return this.repo.save(this.repo.create(data));
  }
}
```

- [ ] **Step 3: 重启服务验证自动建表**

Run: `pnpm dev`，然后：
```bash
docker compose exec mysql mysql -uroot -proot -e "SHOW TABLES FROM wudong;"
```
Expected: 出现 `user` 表（及 Cool Admin 模板自带的 base 表如 `base_sys_user` 等）。若 `user` 表未出现，检查实体路径 `entities: ['**/entity/*.{ts,js}']` 是否匹配。

- [ ] **Step 4: 手工插一条用户数据验证读写**

```bash
docker compose exec mysql mysql -uroot -proot wudong \
  -e "INSERT INTO user(phone,nickname,status,deleted) VALUES('13800000000','测试用户',0,0);"
```
Expected: 无报错，`SELECT id,phone,nickname FROM user;` 能查到。

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(user): user entity + service"
```

---

### Task 6: 用户登录与鉴权（JWT）

**Files:**
- Create: `wudong-server/src/modules/auth/controller/auth.ts`、`wudong-server/src/modules/auth/service/auth.ts`
- Create: `wudong-server/src/middleware/user-auth.middleware.ts`
- Create: `wudong-server/src/modules/user/controller/user.ts`
- Test: `wudong-server/test/auth/auth.test.ts`

**Interfaces:**
- Consumes: `UserService`（Task 5）、`ErrorCode`/`BizError`（Task 3）。
- Produces:
  - `AuthService.loginByPhone(phone, code): Promise<{ token, user }>`（验证码 mock 固定 `1234`）
  - `AuthService.loginByWechat(code): Promise<{ token, user }>`（mock：用 `code` 直接当 openid）
  - `UserAuthMiddleware`（校验 `Authorization: Bearer <token>`，把 `userId` 挂到 `ctx`）
  - `POST /api/auth/phone/login`、`POST /api/auth/wechat/login`、`GET /api/user/profile`

- [ ] **Step 1: 写登录失败测试**

```typescript
// wudong-server/test/auth/auth.test.ts
import { AuthService } from '../../src/modules/auth/service/auth';
import { UserService } from '../../src/modules/user/service/user';
import { BizError } from '../../src/common/exceptions';

describe('AuthService', () => {
  it('手机号登录成功返回 token 和用户', async () => {
    const userSvc = {
      findByPhone: async () => ({ id: 1, phone: '13800000000', nickname: 'u' }),
      create: async (d: any) => ({ id: 1, ...d }),
    } as unknown as UserService;
    const jwt = { sign: async () => 'fake-token' } as any;
    const svc = new AuthService();
    (svc as any).userService = userSvc;
    (svc as any).jwt = jwt;

    const r = await svc.loginByPhone('13800000000', '1234');
    expect(r.token).toBe('fake-token');
    expect((r.user as any).id).toBe(1);
  });

  it('验证码错误抛 3001', async () => {
    const svc = new AuthService();
    (svc as any).userService = { findByPhone: async () => null } as any;
    await expect(svc.loginByPhone('13800000000', '0000')).rejects.toThrow(BizError);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm test test/auth/auth.test.ts`
Expected: FAIL。

- [ ] **Step 3: 实现 AuthService**

```typescript
// wudong-server/src/modules/auth/service/auth.ts
import { Provide, Inject } from '@midwayjs/core';
import { JwtService } from '@midwayjs/jwt';
import { UserService } from '../../user/service/user';
import { BizError } from '../../../common/exceptions';
import { ErrorCode } from '../../../common/error-code';

const MOCK_SMS_CODE = '1234';

@Provide()
export class AuthService {
  @Inject()
  userService: UserService;

  @Inject()
  jwt: JwtService;

  async loginByPhone(phone: string, code: string) {
    if (code !== MOCK_SMS_CODE) {
      throw new BizError(ErrorCode.VALIDATION_ERROR, '验证码错误');
    }
    let user = await this.userService.findByPhone(phone);
    if (!user) user = await this.userService.create({ phone, nickname: '用户' + phone.slice(-4) });
    const token = await this.jwt.sign({ userId: user.id });
    return { token, user };
  }

  async loginByWechat(code: string) {
    // mock：真实实现用 code 调微信 jscode2session 换 openid
    const openid = code;
    let user = await this.userService.findByOpenid(openid);
    if (!user) user = await this.userService.create({ wechatOpenid: openid });
    const token = await this.jwt.sign({ userId: user.id });
    return { token, user };
  }
}
```

- [ ] **Step 4: 实现 AuthController**

```typescript
// wudong-server/src/modules/auth/controller/auth.ts
import { Controller, Post, Inject, Body } from '@midwayjs/core';
import { AuthService } from '../service/auth';
import { ok } from '../../../common/response';

@Controller('/api/auth')
export class AuthController {
  @Inject()
  authService: AuthService;

  @Post('/phone/login')
  async phoneLogin(@Body() body: { phone: string; code: string }) {
    return ok(await this.authService.loginByPhone(body.phone, body.code));
  }

  @Post('/wechat/login')
  async wechatLogin(@Body() body: { code: string }) {
    return ok(await this.authService.loginByWechat(body.code));
  }
}
```

- [ ] **Step 5: 实现 UserAuthMiddleware**

```typescript
// wudong-server/src/middleware/user-auth.middleware.ts
import { Inject, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { JwtService } from '@midwayjs/jwt';
import { BizError } from '../common/exceptions';
import { ErrorCode } from '../common/error-code';

@Middleware()
export class UserAuthMiddleware {
  @Inject()
  jwt: JwtService;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const auth = ctx.get('authorization') || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
      if (!token) throw new BizError(ErrorCode.UNAUTHORIZED, '未登录');
      try {
        const payload = await this.jwt.verify(token);
        (ctx as any).userId = (payload as any).userId;
      } catch {
        throw new BizError(ErrorCode.UNAUTHORIZED, '登录已过期');
      }
      await next();
    };
  }
}
```

- [ ] **Step 6: 实现 UserController（受保护接口示例）**

```typescript
// wudong-server/src/modules/user/controller/user.ts
import { Controller, Get, Inject, Context } from '@midwayjs/core';
import { UserService } from '../service/user';
import { ok } from '../../../common/response';

@Controller('/api/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Inject()
  ctx: Context;

  @Get('/profile', { middleware: ['userAuthMiddleware'] })
  async profile() {
    return ok(await this.userService.findById((this.ctx as any).userId));
  }
}
```

- [ ] **Step 7: 跑测试确认通过**

Run: `pnpm test test/auth/auth.test.ts`
Expected: PASS。

- [ ] **Step 8: 手工冒烟**

```bash
curl -X POST http://127.0.0.1:7001/api/auth/phone/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800000000","code":"1234"}'
```
Expected: 返回 `code:0` 和 `data.token`。再带 token 调 `GET /api/user/profile` 应返回用户信息；不带 token 应返回 `code:2001`。

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat(auth): phone/wechat login + jwt middleware"
```

---

### Task 7: OSS 文件上传接口

**Files:**
- Create: `wudong-server/src/modules/upload/controller/upload.ts`
- Create: `wudong-server/src/modules/upload/service/upload.ts`

**Interfaces:**
- Consumes: OSS 配置（Task 2 `config.local.ts`）。
- Produces: `POST /api/upload/image`（`multipart/form-data` 单文件），返回 `{ url }`。供后续模块传商品图/头像/评价图。

- [ ] **Step 1: 实现 UploadService（封装 OSS 客户端）**

```typescript
// wudong-server/src/modules/upload/service/upload.ts
import { Provide, Inject } from '@midwayjs/core';
import { Config } from '@midwayjs/core';
import * as OSS from 'ali-oss';
import { BizError } from '../../../common/exceptions';
import { ErrorCode } from '../../../common/error-code';

@Provide()
export class UploadService {
  @Inject()
  ctx: any;

  @Config('oss.client')
  ossConfig: { region: string; bucket: string; accessKeyId: string; accessKeySecret: string };

  private client() {
    return new OSS({
      region: this.ossConfig.region,
      bucket: this.ossConfig.bucket,
      accessKeyId: this.ossConfig.accessKeyId,
      accessKeySecret: this.ossConfig.accessKeySecret,
    });
  }

  async uploadImage(file: { filename: string; data: Buffer }) {
    if (!this.ossConfig.accessKeyId) {
      throw new BizError(ErrorCode.SYSTEM_ERROR, 'OSS 未配置');
    }
    const key = `images/${Date.now()}_${file.filename}`;
    await this.client().put(key, file.data);
    return { url: `https://${this.ossConfig.bucket}.${this.ossConfig.region}.aliyuncs.com/${key}` };
  }
}
```

> 若未配置 OSS 凭证，可用本地存储兜底：写 `dist/upload/` 并返回相对路径。此处以 OSS 为主，凭证缺失时抛错提示配置。

- [ ] **Step 2: 实现 UploadController**

```typescript
// wudong-server/src/modules/upload/controller/upload.ts
import { Controller, Post, Inject, Files } from '@midwayjs/core';
import { UploadService } from '../service/upload';
import { ok } from '../../../common/response';

@Controller('/api/upload')
export class UploadController {
  @Inject()
  uploadService: UploadService;

  @Post('/image')
  async image(@Files() files: Array<{ filename: string; data: Buffer }>) {
    const f = files?.[0];
    if (!f) return ok({ url: '' });
    return ok(await this.uploadService.uploadImage({ filename: f.filename, data: f.data }));
  }
}
```

- [ ] **Step 3: 手工冒烟**

```bash
curl -X POST http://127.0.0.1:7001/api/upload/image \
  -F "file=@./test.png"
```
Expected: 返回 `{ url: "https://..." }`（OSS 已配置）或 5000（未配置凭证，此时补上 `.env` 的 OSS 凭证再试）。

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(upload): oss image upload"
```

---

### Task 8: 端到端冒烟 + README 交付说明

**Files:**
- Create: `wudong-server/README.md`

**Interfaces:**
- Consumes: Task 1-7 全部产物。
- Produces: 一条可复现的启动文档 + 主链路冒烟通过记录。

- [ ] **Step 1: 全量测试**

Run: `pnpm test`
Expected: 全部 PASS。

- [ ] **Step 2: 冷启动冒烟**

```bash
docker compose up -d
pnpm dev
# 依次验证：登录 → profile → 上传（无凭证则跳过）→ 错误码（不带 token 访问 profile 返回 2001）
```
Expected: 无异常，各接口符合预期返回体。

- [ ] **Step 3: 写 README（新成员上手文档）**

```markdown
# wudong-server

乌东文旅平台后端（Midway.js + Cool Admin）。本仓库为单仓库模块化单体。

## 快速开始
1. pnpm install
2. cp .env.example .env 并填写
3. docker compose up -d   # MySQL8 + Redis7
4. pnpm dev               # http://127.0.0.1:7001

## 目录
- src/common/      错误码/异常/返回体/工具
- src/config/      多环境配置
- src/middleware/  异常过滤器/鉴权中间件
- src/modules/     user/auth/upload/base（后续衣/食/住/行/社区/后台）

## 约定
- 金额:分(BIGINT)；主键 bigint；deleted 逻辑删除；DB snake_case / 实体 camelCase
- 统一返回 {code,message,data}；code=0 成功
- 业务错误 HTTP200 + 非零 code
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: phase0 readme + smoke record"
```

---

## 自检记录（写完本计划后执行）

- **Spec 覆盖**：对应设计文档 §0 学习路径、§1 技术栈、§2.3 工程结构、§3.3 `user` 表、§6.4 鉴权、§6.5 异常过滤器、§6.8 DTO 校验（验证码）、§7 配置/Docker、§3.5 TypeORM 建表 —— 均有任务覆盖。§3.3 其余公共表（merchant/order/payment/运营）属 P1/P2 计划，不在本阶段。
- **占位符**：无 TBD/TODO；唯一需对照官方的是 Task 1 脚手架命令与 Task 4 过滤器挂载方式（均已标注「以模板为准」的兜底说明，非空占位）。
- **类型一致**：`ErrorCode`、`BizError`、`ok/fail`、`UserService`、`JwtService`、`userId`（挂在 ctx）在 Task 3→6 间命名一致。

## 执行交接

Phase 0 计划已保存。下一步执行二选一（见 writing-plans 交接）：
1. Subagent-Driven（推荐）—— 每个 Task 派新 subagent + 双阶段 review
2. Inline —— 本会话内用 executing-plans 批量执行
