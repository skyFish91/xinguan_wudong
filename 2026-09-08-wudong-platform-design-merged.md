# 乌东文旅"衣食住行"综合服务平台 — 设计方案（合并大纲）

| 项目 | 内容 |
|---|---|
| 文档版本 | V1.0（合并大纲） |
| 编制日期 | 2026-09-08 |
| 技术栈 | Midway.js + Cool Admin（Node.js 18+ / TypeScript） |
| 源文档 | ① 需求规格说明书 V1.0　② 技术架构设计说明书 V3.0　③ 详细设计文档 V3.0　④ Phase 0 实施计划 |

> 本文档将三份设计文档合并为一份评审用大纲：每章只列要点，落地细节（完整 DDL、接口清单、代码样例）仍以源文档为准。阅读路径见各章末尾「详见」。

---

## 目录

- 一、项目总览
- 二、需求要点
- 三、技术架构要点
- 四、详细设计要点
- 五、里程碑与分工
- 六、风险与兜底
- 附录：术语表与源文档对照

---

## 一、项目总览

乌东文旅"衣食住行"综合服务平台：以乌东地区非遗手工艺（衣）、餐饮美食与农产品（食）、民宿住宿（住）、线路订票与攻略（行）为核心，叠加游记社区（社区）与平台管理后台，面向游客、商家、管理员三类用户的文旅综合服务平台。

| 维度 | 内容 |
|---|---|
| 三端 | 微信小程序（游客主端）、PC 网页（游客/商家浏览）、管理后台（商家 + 平台管理员） |
| 六模块 | 衣 / 食 / 住 / 行 / 社区 / 管理后台 |
| 公共能力 | 统一用户、统一订单、统一支付、统一购物车、统一上传、统一消息、统一搜索 |
| 技术栈 | 后端 Midway.js + Cool Admin；小程序 uni-app；PC/后台 Vue3 + Element Plus；MySQL 8 + Redis 7 |
| 集成程度 | 微信登录/支付（沙箱）、阿里云 OSS、高德地图真实；短信/内容审核/搜索 mock |
| 开发方式 | 6 个学生小组并行，公共基础层先行 |

---

## 二、需求要点

### 2.1 角色与权限

| 角色 | 主要能力 |
|---|---|
| 游客 | 浏览/搜索、下单支付、收藏评价、发游记、预约预订 |
| 商家 | 入驻申请（审核通过后）、商品/菜品/房型/线路维护、接单核销、店铺数据 |
| 平台管理员 | 商家入驻审核、全量订单/财务、内容审核、推荐位与轮播、用户/权限管理 |

### 2.2 公共功能（所有模块共用）

统一用户体系（手机号+验证码、微信登录）；统一购物车（仅实物：衣、食特产）；统一订单（5 类订单）；统一支付（微信 V3 沙箱）；统一上传（OSS）；统一消息（站内信/模板/短信）；统一搜索；首页与导航；内容安全（审核/举报/封禁）。

### 2.3 五业务模块要点

| 模块 | 核心对象 | 关键功能 |
|---|---|---|
| 衣（非遗商品） | 商品分类 / 商品 / SKU / 图片 | 非遗工艺展示、规格库存、购物车下单、收藏评价 |
| 食（餐饮 + 农产品） | 餐厅 / 菜品 / 餐位时段 / 农产品 | 餐位预约、到店核销、农产品特产购买 |
| 住（住宿预订） | 民宿 / 房型 / 房态日历 / 入住须知 | 按日期查房、入住/离店、身份证登记 |
| 行（线路订票） | 景区 / 票种 / 路线套餐 / 电子票 / 交通攻略 | 门票预订、电子票核销、跟团路线、攻略 |
| 社区（照片分享） | 游记 / 评论 / 话题 / 关注 / 点赞 / 举报 | 发游记（图文/视频）、信息流、关注互动 |

### 2.4 管理后台

商家后台框架 + 平台全局管理：入驻审核、商品/内容上下架、订单与财务分账、推荐位、轮播、公告、操作日志、系统配置。

### 2.5 非功能需求（节选）

性能（接口响应 < 500ms、并发支撑）；安全（密码 bcrypt、身份证/手机号脱敏、内容审核）；可用性；兼容性（小程序各端 + 主流浏览器）；数据统计与分析。

### 2.6 验收标准

每组提交：可运行模块 + 单元测试（覆盖率 ≥ 60%）+ Swagger 接口文档 + DDL；集成验收按需求 13.2 统一进行；交付物清单见需求 13.4。

> 详见：需求规格说明书 V1.0 第 2-13 章。

---

## 三、技术架构要点

### 3.1 技术决策汇总

| 维度 | 决策 |
|---|---|
| 后端架构 | Midway.js 模块化单体（Node 18+ / TS），单进程、单 DataSource、单事务 |
| 后台基座 | Cool Admin Midway（后端）+ Cool Admin Vue（前端），RBAC/CRUD 开箱即用 |
| 后端装配 | 多仓库 + npm 私有包（Verdaccio）；单仓库多目录兜底 |
| 前端 | uni-app 小程序；Vue3 + Element Plus PC 网页；Cool Admin Vue 后台 |
| 集成 | 微信登录/支付沙箱、OSS、高德真实；短信/审核/搜索 mock |
| 部署 | 单台云服务器 + Docker Compose + Nginx + HTTPS/备案域名 |

### 3.2 总体架构

`wudong-server`（唯一 Midway 进程，Cool Admin Midway）通过 `configuration.ts` 装配各模块 npm 包与 `@wudong/common`；各模块 Entity/Service/Controller 同进程共享 TypeORM DataSource 与事务边界；跨模块为进程内 TS 方法调用。前端三应用共用 `wudong-fe-common` npm 公共库。部署为单机 Docker Compose（server + MySQL + Redis）+ Nginx。

### 3.3 仓库与模块契约

12 个仓库：`@wudong/common` + 6 个 `@wudong/module-*` + `wudong-server`（唯一 bootstrap）+ 前端 `wudong-app/web/admin` + `wudong-fe-common`。模块 npm 包契约 7 条：只依赖 common、不声明启动入口、组件由 server 装配、跨模块走 common 接口、TypeORM 迁移不越界等。

### 3.4 公共基础层 @wudong/common

`core`（统一响应/错误码/异常/分页）、`security`（JWT/RBAC）、`user`、`order`（统一订单中心）、`payment`、`cart`（Redis）、`upload`（OSS）、`message`、`search`、`config`。单仓库兜底时等价为 `src/common` 目录。

### 3.5 技术栈明细

后端：TypeScript 5 / Midway.js 3.x / TypeORM 0.3 / Cool Admin RBAC + JWT / Redis（@midwayjs/redis）/ @midwayjs/validate。前端：uni-app、Vue3 + Element Plus + Pinia、Cool Admin Vue。中间件：MySQL 8、Redis 7、OSS、微信支付 V3、高德地图。

> 详见：技术架构设计说明书 V3.0 第 2-9 章。

---

## 四、详细设计要点

### 4.1 数据库设计

- 通用约定：InnoDB / utf8mb4；主键 `bigint` 自增；时间 `datetime`；金额「分」`bigint`；逻辑删除 `deleted`；DB snake_case / 实体 camelCase。
- **公共表**：`user`、`merchant`、`merchant_application`、`admin_user`、`role`、`permission`、`address`、`order`（主表）+ `goods_order/dining_order/housing_order/ticket_order/route_order`（类型子表）、`payment_record`、`refund_record`、`message`、`banner`、`announcement`、`activity_banner`、`recommend_slot`、`hot_keyword`、`operation_log`、`finance_record`、`sys_config`。购物车用 Redis，不建表。
- **模块表**：衣（`clothing_category/product/sku/product_image`）、食（`restaurant/dish/time_slot/agri_category/agri_product`）、住（`homestay/room_type/room_calendar/house_rule`）、行（`scenic_spot/ticket_type/route_package/route_itinerary/e_ticket/traffic_guide`）、社区（`post/comment/topic/follow/post_like/report`）。
- **收藏/评价按模块分表**：`clothing_favorite/clothing_review`、`food_favorite/food_review`（target_type 区分餐厅/农产品）、`housing_favorite/housing_review`、`travel_favorite/travel_review`（target_type 区分景区/路线/攻略）、`post_favorite`；公共层不设统一表，「我的收藏/评价」由各模块接口聚合。
- 建表：开发期 TypeORM `synchronize: true`；生产 `synchronize: false` + migration。DDL 作为评审/验收依据。

### 4.2 接口约定

RESTful；统一响应 `{ code, message, data }`（`code === 0` 成功）；路径 `/api/{clothing|food|housing|travel|community|admin|...}`；分页 `page/size`，响应 `{ list, total, page, size }`；鉴权 `Authorization: Bearer <token>`；业务错误 HTTP 200 + 非零 code。

**错误码**：`0` 成功；`1xxx` 业务；`2xxx` 鉴权（2001 未登录 / 2002 无权限）；`3xxx` 参数校验；`4xxx` 支付；`5xxx` 系统。全局异常过滤器统一捕获，业务抛 `BizError(code, message)`。

### 4.3 订单状态机（统一订单中心）

订单类型：`GOODS / DINING / HOUSING / TICKET / ROUTE`。主表 + 类型子表 + 公共状态机。

```
CREATED → PAID → CONFIRMED → IN_PROGRESS → COMPLETED
   │         │         │           │
   └──CANCELLED  └──REFUNDING──REFUNDED（异常分支）
```

状态流转只在 `order` 模块实现；模块专属规则（取消扣款、退票手续费）以策略回调注入。

### 4.4 核心流程

下单 → 发起支付（微信统一下单）→ 微信异步回调（验签 + 幂等 → 订单 PAID）；退款（生成退款单 → 微信退款 → 回调 REFUNDED → 财务冲销）；商家入驻（申请 → 审核 → 建 merchant + 绑定角色）；社区发帖（提交 → 内容审核 → NORMAL/OFFLINE）。

### 4.5 关键实现方案（TS）

- 依赖注入：`@Provide` / `@Inject` / `@EntityModel`（TypeORM）。
- 状态机：TS 迁移表 `canTransit(from, to)` + 条件 UPDATE 乐观锁。
- 支付回调幂等：验签 + `pay_no` 唯一约束 + `WHERE status='CREATED'` 条件更新。
- 购物车：Redis `cart:{userId}`，JSON 数组，下单即清。
- 库存扣减：条件 UPDATE（`stock >= count` 才扣），防超卖。
- 参数校验：`@midwayjs/validate`（Joi）。

### 4.6 配置与部署

`config.default.ts`（typeorm/redis/oss/wechat/amap 走环境变量）+ `config.local.ts`/`config.prod.ts`；生产 `synchronize: false`。Docker Compose：MySQL 8 + Redis 7 + `wudong-server`（`node:18`）+ Nginx。Nginx 托管三端静态资源、反代 `/api`。

> 详见：详细设计文档 V3.0 第 0-12 章（§3 DDL、§4 接口、§6 代码、§7 配置）。

---

## 五、里程碑与分工

| 阶段 | 内容 | 周期（建议 8 周） | 负责 |
|---|---|---|---|
| Phase 0 | 公共基础层（@wudong/common + server 骨架 + 登录鉴权 + OSS + Docker） | 第 1-2 周 | 公共组 |
| Phase 1-5 | 衣 / 食 / 住 / 行 / 社区（并行） | 第 3-6 周 | 第 1-5 组 |
| Phase 2 | 统一订单支付闭环（跨 Phase 0-5） | 第 4-7 周 | 公共组 |
| Phase 6 | 管理后台框架 + 全局管理 | 第 6-8 周 | 第 6 组 |
| 集成验收 | 三端联调 + 按需求 13.x 验收 | 第 8 周 | 全体 |

---

## 六、风险与兜底

| 风险 | 应对 |
|---|---|
| Cool Admin 外部模块（npm 包）装配机制未验证 | 单仓库多目录兜底（详细设计 §12.3） |
| Verdaccio 私有源搭建 | 无则退化为单仓库 |
| 微信支付/登录需企业资质 | 资质未就绪先 mock，接口预留真实适配 |
| 跨模块事务（路线套餐跨餐饮/住宿） | 单体单事务，通过 common 接口进程内调用 |
| TypeORM migration 多仓库冲突 | 严格执行迁移前缀约定 |
| 团队首次接触 Midway/Cool Admin | 学习清单先行（详细设计 §0.3），先单仓库跑通再拆包 |

---

## 附录：术语表与源文档对照

| 术语 | 说明 |
|---|---|
| Midway.js | 阿里系企业级 Node 服务端框架（TS / 装饰器 / IoC） |
| Cool Admin | 开源后台基座：Midway 版（后端）+ Vue 版（前端） |
| TypeORM | TS/JS ORM；synchronize 为开发期自动建表开关 |
| Verdaccio | npm 私有制品仓库 |
| RBAC | 基于角色的访问控制 |
| JWT | 无状态登录凭证 |
| DTO | 数据传输对象 |

| 源文档 | 路径 | 角色 |
|---|---|---|
| ① 需求规格说明书 V1.0 | `2026-06-09-wudong-yishizuxing-platform-design.md` | 功能/角色/模块源头 |
| ② 技术架构设计说明书 V3.0 | `2026-09-08-wudong-platform-technical-design.md` | 架构/选型/契约 |
| ③ 详细设计文档 V3.0 | `2026-09-08-wudong-platform-detailed-design.md` | DDL/接口/实现落地 |
| ④ Phase 0 实施计划 | `2026-09-08-wudong-phase0-common-base-plan.md` | 构建用 Task 清单 |

---

## 文档结束
