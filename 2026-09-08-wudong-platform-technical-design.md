# 乌东文旅"衣食住行"综合服务平台 技术架构设计说明书

| 项目 | 内容 |
|---|---|
| 文档版本 | V1.0 |
| 编制日期 | 2026-09-08 |
| 项目名称 | 乌东文旅"衣食住行"综合服务平台 |
| 文档性质 | 技术架构设计（Technical Design） |
| 关联文档 | 《2026-06-09-wudong-yishizuxing-platform-design.md》需求规格说明书 V1.0 |
| 终端范围 | 微信小程序端、PC 网页端、管理后台（Web） |
| 实施方式 | 6 个学生小组并行开发，多仓库 + 公共库协作 |

---

## 目录

1. 引言
2. 技术决策汇总
3. 总体架构
4. 仓库与工程划分
5. 公共基础层设计（wudong-common）
6. 技术栈明细
7. 数据模型与 API 约定
8. 测试策略
9. 部署、CI 与协作流程
10. 分阶段建设计划
11. 风险与待定项
12. 附录：术语表

---

## 1. 引言

### 1.1 文档目的

本说明书在《需求规格说明书 V1.0》的基础上，定义平台的**技术架构、技术选型、模块契约、公共基础层设计、部署与协作规范**，作为 6 个学生小组并行开发的工程依据。需求层面（功能范围、角色权限、模块边界）以需求规格说明书为准，本文档不再重复，仅补充工程实现层面必须统一的内容。

### 1.2 阅读对象

- 项目指导老师（用于架构评审与验收）
- 6 个学生开发小组（用于明确各自的工程边界与接口契约）
- 公共组（负责 `wudong-common`、`wudong-server` 等公共仓库）

### 1.3 术语与关联

术语沿用需求规格说明书第 14 章，另补充见本文档第 12 章。

---

## 2. 技术决策汇总

以下决策已经过评审确认，作为全部设计的基线：

| 维度 | 决策 | 说明 |
|---|---|---|
| 后端架构 | Spring Boot 模块化单体 | 单进程、单 DataSource、单事务边界 |
| 后端装配 | Nexus jar 装配 | 各模块打 jar 发布私有 Maven 仓库，引导仓库聚合装配 |
| 前端小程序 | uni-app（Vue3 + Vite） | 一套代码编译为微信小程序 |
| 前端 PC 网页 | Vue3 + Vite + Element Plus | 游客/商家浏览端 |
| 前端管理后台 | Vue3 + Vite + Element Plus | 商家 + 平台管理员 |
| 集成程度 | 部分真实集成 | 微信登录/支付沙箱、阿里云 OSS、高德地图真实；短信/内容审核/搜索 mock |
| 仓库模型 | 多仓库 + 公共库 | 后端模块打 jar，前端 3 应用仓库 + npm 公共库 |
| 部署目标 | 单台云服务器 | Docker 编排 + Nginx + HTTPS/备案域名 |

---

## 3. 总体架构

### 3.1 后端：Nexus jar 装配的单体

```
┌───────────────────────────────────────────────────────────┐
│  客户端：uni-app 小程序 │ Vue3 PC 网页 │ Vue3 管理后台        │
└───────────────────────┬───────────────────────────────────┘
                        │ HTTPS / JSON
┌───────────────────────▼───────────────────────────────────┐
│  Nginx（反向代理 + TLS + 前端静态资源托管）                    │
└───────────────────────┬───────────────────────────────────┘
                        │
┌───────────────────────▼───────────────────────────────────┐
│  wudong-server（唯一 Spring Boot 进程，单 DataSource 单事务）  │
│   ├─ wudong-module-clothing  衣                             │
│   ├─ wudong-module-food      食                             │
│   ├─ wudong-module-housing   住                             │
│   ├─ wudong-module-travel    行                             │
│   ├─ wudong-module-community 社区                           │
│   ├─ wudong-module-admin     管理后台                       │
│   └─ wudong-common（公共层，见第 5 章）                      │
└──────┬──────────────┬──────────────┬──────────────────────┘
       │              │              │
    MySQL 8       Redis 7     阿里云 OSS / 微信支付 / 高德地图
```

**关键点**：`wudong-server` 是唯一的 `@SpringBootApplication` 入口，依赖全部模块 jar 与公共 jar，启动时组件扫描 `com.wudong`，各模块的实体 / Mapper / Service / Controller 在同一进程内共享同一个 DataSource 与事务边界。跨模块调用是进程内 Java 方法调用（通过公共层接口），不存在网络调用与分布式事务。

### 3.2 前端架构

```
┌─────────────────────────────────────────────────────────┐
│  wudong-app（uni-app Vue3）──编译──▶ 微信小程序            │
│  wudong-web（Vue3 + Element Plus）────▶ PC 网页端          │
│  wudong-admin（Vue3 + Element Plus）──▶ 管理后台           │
│        │          │           │                          │
│        └──────────┴───────────┘                          │
│                   ▼                                      │
│        wudong-fe-common（npm 公共库）                      │
│        · API 客户端封装 · 类型定义 · 公共组件 · 工具        │
└─────────────────────────────────────────────────────────┘
```

- **小程序、PC 网页、管理后台是三个独立前端应用**，各自独立构建部署；小程序上传微信，PC 网页与管理后台静态文件由 Nginx 托管。
- 三者共用 `wudong-fe-common`（npm 私有包），统一 API 请求封装、DTO 类型、公共组件与工具函数。
- 前端**不按组拆仓库**（见 4.3），各组在 3 个应用仓库内按目录归属提交。

### 3.3 部署拓扑（单台云服务器）

```
                        ┌────────────────────────────┐
   用户/商家/管理员 ─────▶│  云服务器（单机）            │
                        │  ┌──────────────────────┐ │
                        │  │ Nginx（TLS 终止 + 静态托管）│
                        │  └─────────┬────────────┘ │
                        │            │              │
                        │  docker-compose 编排：      │
                        │  ┌─────────▼────────────┐ │
                        │  │ wudong-server（单体 jar）│
                        │  ├──────────┬────────────┤ │
                        │  │ MySQL 8  │ Redis 7    │ │
                        │  └──────────┴────────────┘ │
                        └────────────────────────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    ▼             ▼              ▼
              微信支付沙箱      阿里云 OSS      高德地图
```

### 3.4 架构设计原则

1. **模块边界清晰**：每个模块只在 `com.wudong.module.<模块>` 包内实现，不越界直接读写其它模块的表。
2. **公共能力下沉**：用户 / 订单 / 支付 / 购物车 / 上传 / 消息 / 搜索统一由 `wudong-common` 提供，各模块优先调用公共接口，避免重复造轮子。
3. **单体进程、模块化代码**：运行期是单体，代码期是模块——享受单体的事务与部署简单性，同时保留多仓库的独立交付能力。
4. **可独立理解与测试**：每个模块可脱离其它模块编译与单测，仅依赖 `wudong-common` 的稳定接口。

---

## 4. 仓库与工程划分

### 4.1 仓库清单

| 仓库 | 类型 | 产出物 | 负责 | 备注 |
|---|---|---|---|---|
| `wudong-common` | 后端公共库 | `wudong-common-*.jar` → Nexus | 公共组/老师 | 所有模块的依赖地基 |
| `wudong-module-clothing` | 后端模块 | `wudong-module-clothing.jar` | 第 1 组 | 衣 |
| `wudong-module-food` | 后端模块 | `wudong-module-food.jar` | 第 2 组 | 食 |
| `wudong-module-housing` | 后端模块 | `wudong-module-housing.jar` | 第 3 组 | 住 |
| `wudong-module-travel` | 后端模块 | `wudong-module-travel.jar` | 第 4 组 | 行 |
| `wudong-module-community` | 后端模块 | `wudong-module-community.jar` | 第 5 组 | 社区 |
| `wudong-module-admin` | 后端模块 | `wudong-module-admin.jar` | 第 6 组 | 管理后台 |
| `wudong-server` | 引导装配 | 可部署单体 jar | 公共组 | 唯一 `main()` |
| `wudong-app` | 前端 | uni-app 小程序 | 5 组共用 | 目录归属（见 4.3）|
| `wudong-web` | 前端 | Vue3 PC 网页 | 5 组共用 | 目录归属 |
| `wudong-admin` | 前端 | Vue3 管理后台 | 第 6 组 + 各组业务页 | 目录归属 |
| `wudong-fe-common` | 前端公共库 | npm 私有包 | 公共组 | 前端共享 |

### 4.2 后端模块 jar 契约（6 组必须遵守）

1. **依赖**：只依赖 `wudong-common`（及其传递依赖），不得反向依赖其它模块 jar。
2. **包名**：统一 `com.wudong.module.<模块名>`，如 `com.wudong.module.clothing`。
3. **无启动类**：不得声明自己的 `@SpringBootApplication` / `main()`；启动入口只在 `wudong-server`。
4. **组件扫描**：实体 / Mapper / Service / Controller 全部放自己包内，由 `wudong-server` 扫描 `com.wudong`。
5. **跨模块调用**：只能通过 `wudong-common` 暴露的接口调用（如第 4 组路线套餐对接第 2/3 组餐饮/住宿，调用 common 中的对应服务接口）。
6. **数据库迁移**：自带 Flyway 迁移脚本（见 4.4），不直接操作其它模块的表。
7. **接口文档**：Controller 使用 springdoc-openapi 注解，Swagger 分组按模块名区分。

### 4.3 前端仓库与目录归属

前端应用是单一构建产物，不拆独立仓库。3 个应用仓库内按业务模块目录归属：

| 仓库 | 目录归属约定 |
|---|---|
| `wudong-app` | `pages/clothing/`、`pages/food/`、`pages/housing/`、`pages/travel/`、`pages/community/`、`pages/common/` |
| `wudong-web` | `views/clothing/`、`views/food/`、`views/housing/`、`views/travel/`、`views/community/` |
| `wudong-admin` | `views/admin/`（第 6 组框架）+ `views/clothing/`、`views/food/`、`views/housing/`、`views/travel/`、`views/community/`（各组业务管理页）|

各组只在自己归属目录内提交，公共目录（`common/`、路由、布局）的变更需公共组评审。

### 4.4 数据库迁移约定

- 采用 **Flyway**，扫描 classpath `db/migration`；每个模块 jar 自带自己的迁移脚本，`wudong-server` 启动时自动拾取并执行。
- **版本号约定**（避免多仓库冲突）：

| 版本段 | 归属 |
|---|---|
| `V1_0xx__` | 公共层（`wudong-common`：user / order / payment / cart / message）|
| `V1_1xx__` | 模块一 衣 |
| `V1_2xx__` | 模块二 食 |
| `V1_3xx__` | 模块三 住 |
| `V1_4xx__` | 模块四 行 |
| `V1_5xx__` | 模块五 社区 |
| `V1_6xx__` | 模块六 管理后台 |

- 脚本命名：`V{版本}__{说明}.sql`，如 `V1_101__create_clothing_tables.sql`。

---

## 5. 公共基础层设计（wudong-common）

### 5.1 包结构

| 包 | 职责 |
|---|---|
| `com.wudong.common.core` | 统一响应 `Result<T>`、错误码、全局异常处理器、分页、工具类、常量 |
| `com.wudong.common.security` | 登录鉴权（Sa-Token）、JWT、RBAC、当前用户上下文 |
| `com.wudong.common.user` | 用户 / 商家 / 角色 领域模型与统一注册登录 |
| `com.wudong.common.order` | **统一订单中心** |
| `com.wudong.common.payment` | 统一支付（微信支付适配、回调、退款、分账记账）|
| `com.wudong.common.cart` | 统一购物车 |
| `com.wudong.common.upload` | 统一上传（阿里云 OSS）|
| `com.wudong.common.message` | 站内信 / 模板消息 / 短信（mock）|
| `com.wudong.common.search` | 统一搜索（MySQL 全文检索兜底，预留 ES 扩展）|
| `com.wudong.common.config` | 自动配置（Redis、MyBatis-Plus、Jackson、Sa-Token 等）|

### 5.2 统一用户与鉴权

- 注册/登录：手机号 + 短信验证码（mock）、微信授权登录（沙箱）。
- 鉴权：Sa-Token + RBAC。角色 = 游客 / 商家 / 管理员；商家按所属模块分组（衣/食/住/行）。
- 当前用户上下文：从 token 解析，`common.security` 提供 `LoginUser` 获取工具。
- 商家入驻：入驻申请 → 管理员审核 → 分配模块分组 → 开通商家权限（需求 5.1.3）。

### 5.3 统一订单中心

**核心设计：主表 + 类型子表 + 公共状态机。**

#### 5.3.1 订单主表 `order`

| 字段 | 说明 |
|---|---|
| `order_no` | 全局唯一订单号 |
| `user_id` | 下单用户 |
| `merchant_id` | 商家（可空，平台自营时为空）|
| `order_type` | 订单类型：`GOODS` / `DINING` / `HOUSING` / `TICKET` / `ROUTE` |
| `total_amount` | 订单金额（分）|
| `status` | 订单状态（见状态机）|
| `pay_no` / `pay_time` | 支付单号 / 支付时间 |
| `refund_no` / `refund_time` | 退款单号 / 退款时间 |
| `create_time` / `update_time` | 创建 / 更新时间 |

#### 5.3.2 类型子表

各模块维护自己的「订单子表」，通过 `order_id` 关联主表，存放类型专属字段，例如：

| 订单类型 | 子表（示例） | 专属字段 |
|---|---|---|
| `GOODS`（衣/食特产）| `goods_order` | 收货地址、物流、运费 |
| `DINING` | `dining_order` | 餐厅、日期、时段、人数 |
| `HOUSING` | `housing_order` | 民宿、房型、入住/离店日期、入住人 |
| `TICKET` | `ticket_order` | 票种、日期、数量、电子票 |
| `ROUTE` | `route_order` | 路线套餐、出发日期、人数 |

#### 5.3.3 订单状态机（common 统一实现）

状态枚举与流转：

```
CREATED（待支付）
   │ 支付成功
   ▼
PAID（已支付/待确认）
   │ 商家确认
   ▼
CONFIRMED（已确认）
   │ 开始（入住/出行/发货）
   ▼
IN_PROGRESS（进行中）
   │ 完成
   ▼
COMPLETED（已完成）
```

异常分支：

| 当前状态 | 触发 | 目标状态 |
|---|---|---|
| `CREATED` | 超时未支付 / 用户取消 | `CANCELLED` |
| `PAID` | 用户申请退款 | `REFUNDING` → `REFUNDED` |
| `CONFIRMED` | 申请退款（符合规则）| `REFUNDING` → `REFUNDED` |
| `IN_PROGRESS` | 退款 / 评价 | `REFUNDED` / `COMPLETED` |

**约定**：状态流转逻辑只在 `common.order` 中实现，模块提交「订单创建请求 + 类型专属字段」，不自行编写状态流转代码。模块的专属业务规则（如取消扣款比例、退票手续费）以「策略回调」方式注入订单中心。

### 5.4 统一支付

- 统一下单：`common.payment` 提供 `createPayment(orderNo, amount, ...)`，适配微信支付（沙箱）与支付宝（预留）。
- 回调：微信支付回调验签后，回调订单中心更新状态；幂等处理（重复回调）。
- 退款：原路返回；商家分账记账（平台抽佣比例可配置，需求 11.3.8）。
- 关键操作（支付/退款）二次验证。

### 5.5 统一购物车

- 衣（实物）、食（农产品特产）共用购物车；民宿/餐位/门票/线路为预订类，不进购物车，直接生成订单（需求 5.2）。
- 支持商品增删改、规格切换、库存校验、失效提醒；购物车数据存 Redis，用户维度隔离。

### 5.6 统一上传

- 阿里云 OSS 真实接入；图片（jpg/png/webp ≤ 5MB）、视频（mp4 ≤ 100MB / ≤ 60s）。
- 自动生成多尺寸缩略图；图片内容审核（mock：敏感词 + 简单规则过滤）。

### 5.7 统一消息

- 站内信（系统公告、订单状态）；微信模板消息；短信验证码（mock）。
- 统一在"消息中心"展示（需求 5.6）。

### 5.8 统一搜索

- 商品/餐厅/民宿/线路/游记关键词搜索；MySQL 全文检索兜底（mock 阶段），预留 ElasticSearch 扩展接口。
- 排序：热度/价格/评分/时间；搜索历史、热搜词。

---

## 6. 技术栈明细

### 6.1 后端

| 项 | 选型 | 备注 |
|---|---|---|
| 语言 | Java 17 | 学校环境受限可退 JDK 8 |
| 框架 | Spring Boot 3.2.x | 退路 Spring Boot 2.7.x |
| 构建 | Maven（多模块 parent POM） | `wudong-common` 提供 parent BOM |
| ORM | MyBatis-Plus 3.5 | |
| 鉴权 | Sa-Token | RBAC，比 Spring Security 轻 |
| 接口文档 | springdoc-openapi | Swagger |
| 数据库迁移 | Flyway | 见 4.4 |
| 缓存 | Redis（Spring Data Redis）| token / 购物车 / 缓存 |
| 校验 | spring-boot-starter-validation | |
| 工具 | Lombok | |

### 6.2 前端

| 项 | 选型 |
|---|---|
| 小程序 | uni-app（Vue3 + Vite）|
| PC 网页 / 管理后台 | Vue3 + Vite + Element Plus + Pinia + Vue Router + axios |
| 类型 | TypeScript（web/admin 建议启用；uni-app 可用 JS 降低门槛）|
| 公共库 | `wudong-fe-common` npm 私有包 |

### 6.3 中间件与第三方

| 项 | 选型 | 程度 |
|---|---|---|
| 数据库 | MySQL 8 | 真实 |
| 缓存 | Redis 7 | 真实 |
| 对象存储 | 阿里云 OSS | 真实 |
| 支付 | 微信支付 V3（沙箱）| 真实（需企业资质）|
| 登录 | 微信授权登录 | 真实（需小程序资质）|
| 地图 | 高德地图 JS API / 小程序 SDK | 真实 |
| 短信 | — | mock |
| 内容审核 | — | mock（敏感词 + 规则）|
| 搜索 | MySQL 全文检索 | mock（预留 ES）|

---

## 7. 数据模型与 API 约定

### 7.1 数据模型

- 各模块实体字段沿用需求规格说明书第 6-11 节定义，落到各模块的 Flyway 迁移脚本。
- 公共表（`user`、`order`、`payment`、`cart`、`message` 等）由 `wudong-common` 定义。
- 命名规范：表名小写下划线（`snake_case`），主键 `bigint` 自增，时间字段 `datetime`，金额以「分」为单位 `bigint`，逻辑删除用 `deleted` 标志位。
- 索引：外键关联字段、高频查询字段（`order_no`、`user_id`、`status` + `create_time`）建索引。

### 7.2 API 约定

- RESTful + 统一响应包装 `Result<T>`（`code` / `message` / `data`）。
- 路径前缀按模块：`/api/{common|clothing|food|housing|travel|community|admin}/...`
- 分页请求统一 `pageNum` / `pageSize`，响应统一 `PageResult<T>`。
- Swagger 按模块分组（`@Tag`）。
- 认证接口需携带 token（`Authorization` 头），鉴权由 `common.security` 统一处理。

### 7.3 错误码表

| 段 | 含义 | 示例 |
|---|---|---|
| `0` | 成功 | `0` |
| `1xxx` | 业务错误 | 库存不足、订单状态不允许 |
| `2xxx` | 鉴权错误 | 未登录、无权限 |
| `3xxx` | 参数校验错误 | 参数缺失、格式错误 |
| `4xxx` | 支付错误 | 支付失败、回调验签失败 |
| `5xxx` | 系统错误 | 服务器内部错误 |

全局异常处理器统一捕获并转为 `Result`，业务异常抛 `BizException(code, message)`。

### 7.4 认证鉴权约定

- 游客登录后获得 token；商家/管理员登录走后台，token 中携带角色与模块分组。
- 敏感信息（身份证、手机号）脱敏展示；密码 bcrypt 加密存储（需求 12.2）。

---

## 8. 测试策略

### 8.1 分层测试

| 层 | 内容 |
|---|---|
| 公共层 | 集成测试，重点覆盖订单状态机、支付回调、鉴权、购物车 |
| 各模块 | 单元测试（Service 层）为主，关键 Controller 做 MockMvc 冒烟 |
| 联调 | 接口联调（Swagger + Postman），关键页面截图/录屏 |

### 8.2 覆盖率要求

- 各模块单元测试覆盖率 **≥ 60%**（对齐需求 13.1）。
- 公共层核心类（订单中心、支付）覆盖率建议 ≥ 80%。

### 8.3 接口文档

- 每组提交 OpenAPI/Swagger 文档（请求/响应/错误码完整），对齐需求 13.1。

---

## 9. 部署、CI 与协作流程

### 9.1 部署（单台云服务器）

- `docker-compose` 编排：`wudong-server` + MySQL 8 + Redis 7。
- Nginx：TLS 终止 + 反向代理后端 + 托管 PC 网页 / 管理后台静态文件。
- 小程序：uni-app 编译后上传微信（HTTPS 备案域名）。
- 环境配置（微信商户号、OSS AK/SK、高德 Key、数据库连接）通过环境变量注入，不写入代码库。

### 9.2 CI/CD

- 每组 push 到自己仓库 `main` 触发 CI：编译 + 单测 + 打 jar 发布 Nexus（后端）/ 构建上传静态资源（前端）。
- `wudong-server` 拉最新模块 jar 版本，打包部署到云服务器。

### 9.3 协作规范

- 分支：`main` 受保护，功能走 `feat/*` 分支 + PR（至少 1 人 review）。
- 公共库变更：`wudong-common` 变更需公共组评审，发布新版本号后各组升级。
- 版本对齐：每次联调前锁定各模块 jar 版本与 `wudong-common` 版本（`wudong-server` 的 pom 中显式声明）。

---

## 10. 分阶段建设计划

项目按依赖关系分解，公共基础层是关键路径，必须先建。

| 阶段 | 内容 | 前置 | 负责 |
|---|---|---|---|
| **Phase 0** | 公共基础层：`wudong-common`（user/order/payment/cart/upload/message/search）+ `wudong-server` 骨架 + `wudong-fe-common` + 脚手架 + Docker/CI | — | 公共组/老师 |
| Phase 1 | 衣（非遗商品） | Phase 0 | 第 1 组 |
| Phase 2 | 食（餐饮 + 农产品）| Phase 0 | 第 2 组 |
| Phase 3 | 住（住宿预订）| Phase 0 | 第 3 组 |
| Phase 4 | 行（线路订票）| Phase 0 | 第 4 组 |
| Phase 5 | 社区（照片分享）| Phase 0 | 第 5 组 |
| Phase 6 | 管理后台框架 + 全局管理 | Phase 0 | 第 6 组 |

- Phase 1-5 在 Phase 0 完成后可**并行**开发；Phase 6 的商家后台框架优先，各组业务管理页嵌入。
- 集成验收（需求 13.2）在各模块完成后统一进行。

---

## 11. 风险与待定项

| 风险/待定 | 说明 | 应对 |
|---|---|---|
| Nexus 私有仓库搭建 | 需搭建/申请 Maven 私有仓库 | 无 Nexus 时退化为 git submodule 装配（备选）|
| 微信支付/登录需企业资质 | 沙箱接入需小程序/商户资质 | 资质未就绪前先 mock，接口预留真实适配 |
| 跨模块事务 | 单体进程内单事务，风险低；但路线套餐跨餐饮/住宿 | 通过 common 接口进程内调用，必要时补偿 |
| Flyway 多仓库版本冲突 | 版本号约定可规避 | 严格执行 4.4 版本段约定 |
| 前端多组共用单仓库冲突 | 目录归属 + PR review | 明确目录归属，公共目录变更走公共组 |

---

## 12. 附录：术语表

| 术语 | 说明 |
|---|---|
| 单体（Monolith）| 单一可部署进程，内部按模块组织代码 |
| jar 装配 | 各模块打成 jar，由引导仓库聚合为一个可部署应用 |
| Nexus | Maven 私有制品仓库 |
| BOM | Bill of Materials，统一依赖版本管理的 POM |
| Flyway | 数据库版本迁移工具 |
| RBAC | Role-Based Access Control，基于角色的访问控制 |
| Sa-Token | 轻量级 Java 鉴权框架 |
| `Result<T>` | 统一 API 响应包装 |
| DTO | Data Transfer Object，数据传输对象 |
| 其余术语 | 见需求规格说明书第 14 章 |

---

## 文档结束

> 本说明书定义乌东文旅"衣食住行"综合服务平台的技术架构、模块契约与工程规范。若需调整架构或模块边界，需经项目指导老师审批并更新本文档。
