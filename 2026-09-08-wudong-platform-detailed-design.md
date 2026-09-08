# 乌东文旅"衣食住行"综合服务平台 技术详细设计方案（可执行版）

| 项目 | 内容 |
|---|---|
| 文档版本 | V3.0（技术栈切换为 Midway.js + Cool Admin） |
| 编制日期 | 2026-09-08 |
| 项目名称 | 乌东文旅"衣食住行"综合服务平台 |
| 关联文档 | ① 需求规格说明书 V1.0（2026-06-09）② 技术架构设计 V1.0（2026-09-08） |
| 文档性质 | 可执行技术详细设计（DDL / API / 目录树 / 时序 / 配置） |
| 实施方式 | 6 个学生小组并行，多仓库 + npm 私有包 |

> 本文档为可执行详细设计，V3.0 起后端技术栈由 Spring Boot（Java）切换为 **Midway.js + Cool Admin（Node.js / TypeScript）**。DDL、接口、流程等与语言无关的部分沿用；工程结构、代码样例、配置改为 Node 生态。

---

## 0. 使用说明（快速上手）

### 0.1 各角色按阶段阅读

| 角色 | 重点章节 |
|---|---|
| 公共组 / 老师 | §2 工程结构、§3.3 公共层 DDL、§5-§7、§8 部署 |
| 第 1-5 组 | §2 目录树、§3.4 对应模块 DDL、§4.3 对应模块接口、§6 关键实现 |
| 第 6 组 | §2 Cool Admin 结构、§3.3/§3.4 后台表、§4.3 后台接口 |
| 全体 | §4.1 通用约定、§4.2 公共接口（登录/订单/支付必读）|

### 0.2 阶段阅读路径

- **Phase 0（公共基础层）**：先读 §2 → §3.3（公共层 DDL）→ §4.2（公共接口）→ §5-§7。
- **Phase 1-5（业务模块）**：读 §2 目录树 → §3.4（本模块 DDL）→ §4.3（本模块接口）。

### 0.3 学习与入门（团队第一次做，先补这几块）

1. **TypeScript 基础**：类型、interface、装饰器（`@`）语法。
2. **Midway.js 核心**：IoC 依赖注入（`@Provide`/`@Inject`）、`@Controller`/`@Get`/`@Post` 路由、中间件/守卫。
3. **TypeORM**：`@Entity`/`@Column`/`@PrimaryGeneratedColumn` 实体定义、Repository 增删改查。
4. **Cool Admin**：工程结构（`src/modules/`）、base 模块（登录/用户/角色/菜单）、CRUD 代码生成。

参考：Midway.js 官方文档 `midwayjs.org`、Cool Admin 文档（前端 `vue.cool-admin.com`、后端 `cool-admin-midway` 仓库）。

### 0.4 字段/术语约定

- 金额一律以「分」为单位的整数存储；时间用 `datetime`；主键 `bigint` 自增；逻辑删除用 `deleted`（0/1）。
- 表名/字段名 `snake_case`，TypeORM 实体属性 `camelCase`（`@Column` 显式指定列名）。
- 开发期 TypeORM `synchronize: true` 自动建表（快速上手）；本文档 DDL 作为**规范参考**与验收依据，生产环境切换为 migration。

---

## 1. 技术决策与总体架构

### 1.1 技术决策表

| 维度 | 决策 |
|---|---|
| 后端 | Midway.js（Node.js 18+ / TypeScript）+ Cool Admin Midway（TypeORM + MySQL + Redis） |
| 管理后台 | Cool Admin Vue（Vue3 + Element Plus，自带 RBAC / 用户 / 角色 / 菜单 / CRUD） |
| 小程序 | uni-app（Vue3 + Vite）自建 |
| PC 网页 | Vue3 + Vite + Element Plus 自建 |
| 集成 | 部分真实（微信支付/登录沙箱、阿里云 OSS、高德地图真实；短信/内容审核/搜索 mock） |
| 仓库 | 多仓库 + npm 私有包（Verdaccio 私有 npm 源） |
| 部署 | 单台云服务器 + Docker + Nginx |

### 1.2 总体架构图

```
uni-app小程序 │ Vue3 PC网页 │ Cool Admin Vue 管理后台
      └────────────┬────────────┘   HTTPS/JSON
                   ▼
              Nginx（TLS + 静态托管）
                   ▼
   wudong-server（Cool Admin Midway 单体进程）
   ├─ module-clothing / food / housing / travel / community   （第1-5组 npm 包）
   ├─ module-admin   （第6组 npm 包：商家审核/看板/财务/运营）
   ├─ base 模块       （Cool Admin 自带：登录/用户/角色/菜单/RBAC）
   └─ @wudong/common （公共 npm 包：Result/异常/订单/支付/购物车/上传/消息/搜索）
      └────┬────────┬────────┬────────┘
        MySQL 8   Redis 7   阿里云OSS / 微信支付 / 高德地图
```

### 1.3 设计原则（工程约束）

1. 单体进程、模块化代码；跨模块只能经 `@wudong/common` 接口调用。
2. 状态流转只在订单中心；模块只提交「请求 + 类型专属字段」。
3. 每个模块只依赖 `@wudong/common`，可独立编译、单测。
4. 表结构按需求文档**每模块分表**，模块不读写其它模块的表。

---

## 2. 工程结构与代码仓库

### 2.1 仓库清单（多仓库 + npm 私有包）

| 仓库 | 产出物 | 负责 |
|---|---|---|
| `wudong-common` | npm `@wudong/common` → Verdaccio | 公共组 |
| `wudong-module-clothing` | npm `@wudong/module-clothing` | 第 1 组 |
| `wudong-module-food` | npm `@wudong/module-food` | 第 2 组 |
| `wudong-module-housing` | npm `@wudong/module-housing` | 第 3 组 |
| `wudong-module-travel` | npm `@wudong/module-travel` | 第 4 组 |
| `wudong-module-community` | npm `@wudong/module-community` | 第 5 组 |
| `wudong-module-admin` | npm `@wudong/module-admin` | 第 6 组 |
| `wudong-server` | Cool Admin Midway 基础工程（聚合装配） | 公共组 |
| `wudong-app` | uni-app 小程序 | 5 组共用（目录归属） |
| `wudong-web` | Vue3 PC 网页 | 5 组共用 |
| `wudong-admin` | Cool Admin Vue 管理后台 | 第 6 组 + 各组业务页 |
| `wudong-fe-common` | npm `@wudong/fe-common` | 公共组 |

### 2.2 私有 npm 源（Verdaccio）

- 本地/云服务器起 Verdaccio，作为团队私有 npm 源，发布 `@wudong/*` 作用域包。
- 各组在 `.npmrc` 配置：`registry=http://<私有源>/` 与 `@wudong:registry=http://<私有源>/`。
- 版本管理：`@wudong/common` 发版本 → 各组模块 `npm install @wudong/common@latest`；联调前锁定版本。
- 若 Verdaccio 搭建受阻，退化为**单仓库多目录**（`wudong-server/src/modules/` 下直接放各模块源码，跳过 npm 发布）。

### 2.3 后端工程结构（Cool Admin Midway）

```
wudong-server/                        # Cool Admin Midway 基础工程（聚合装配）
├── package.json                      # 依赖 @wudong/common + @wudong/module-*
├── tsconfig.json
└── src/
    ├── modules/
    │   ├── base/                     # Cool Admin 自带：登录/用户/角色/菜单/权限/字典
    │   └── demo/                     # Cool Admin 示例模块（可删）
    ├── config/
    │   ├── config.default.ts         # 数据库/Redis/TypeORM 配置
    │   └── config.prod.ts
    ├── configuration.ts              # 加载业务模块 npm 包 + 注册 TypeORM 实体
    └── bootstrap.ts                  # 启动入口
```

业务模块 npm 包（各组件结构）：

```
@wudong/module-clothing/              # 第1组（其余模块同构）
├── package.json                      # name: @wudong/module-clothing
└── src/
    ├── entity/clothing-product.entity.ts      # TypeORM 实体（对应 DDL）
    ├── controller/clothing-product.controller.ts
    ├── service/clothing-product.service.ts
    └── index.ts                      # 导出 Midway 模块配置，供 wudong-server 加载
```

```
@wudong/common/                       # 公共层
├── package.json                      # name: @wudong/common
└── src/
    ├── core/result.ts  error-code.ts  biz-exception.ts  exception-filter.ts
    ├── security/                      # 鉴权中间件、当前用户上下文、权限装饰器
    ├── user/                          # 用户/商家/角色 实体 + 服务 + 控制器
    ├── order/                         # 订单中心（实体/枚举/状态机/服务/控制器）
    ├── payment/                       # 支付（微信支付适配/回调/退款）
    ├── cart/  upload/  message/  search/  address/
    └── index.ts                       # 统一导出
```

### 2.4 前端目录树

```
wudong-fe-common/ (npm @wudong/fe-common)
└── src/
    ├── request/index.ts              # axios 封装：统一 Result 解包、token、错误提示
    ├── api/{auth,user,order,payment,cart,upload,clothing,food,housing,travel,community,admin}.ts
    ├── types/                        # 与后端 DTO 对齐的 TS 类型
    └── components/                   # 公共组件（图片上传、评分、分页等）

wudong-app/ (uni-app, Vue3)
└── src/pages/{common,index,clothing,food,housing,travel,community}/

wudong-web/ (Vue3 + Vite + Element Plus)
└── src/views/{index,clothing,food,housing,travel,community}/

wudong-admin/ (Cool Admin Vue)
└── src/                              # 基于 Cool Admin Vue 二次开发
    ├── views/                        # 第6组：用户/商家/看板/财务/运营
    └── modules/                      # 各组业务管理页作为子模块嵌入
```

### 2.5 后端模块契约（npm 包，6 组必须遵守）

1. 只依赖 `@wudong/common`（及其传递依赖），不得反向依赖其它模块包。
2. 包名统一 `@wudong/module-<模块>`，实体/服务/控制器在包内，命名 `com.wudong` 风格统一为 `@wudong/`。
3. 不声明自己的启动入口（`bootstrap`）；启动入口只在 `wudong-server`。
4. 跨模块只能调 `@wudong/common` 暴露的接口（如路线套餐对接餐饮/住宿调用 common 接口）。
5. 表结构按需求文档分表，不直接读写其它模块的表。
6. 实体在 `src/entity/` 下，`wudong-server` 通过 `configuration.ts` 注册各包实体路径。
7. 控制器用装饰器 + 接口文档（Swagger，Midway `@midwayjs/swagger`），按模块分组。

> 注：Cool Admin 加载外部 npm 模块的具体机制（模块注册、实体发现）以 Cool Admin Midway 文档为准；本文档给出标准约定，落地时按官方示例微调。

## 3. 数据库详细设计（DDL）

### 3.1 通用约定

- 引擎 `InnoDB`，字符集 `utf8mb4`，排序 `utf8mb4_general_ci`。
- 主键 `id BIGINT UNSIGNED AUTO_INCREMENT`。
- 金额字段 `BIGINT`（单位：分）；时间 `DATETIME`。
- 逻辑删除字段 `deleted TINYINT DEFAULT 0`（1=已删除）。
- 每表必备 `create_time`、`update_time`（`DEFAULT CURRENT_TIMESTAMP` / `ON UPDATE`）。
- 外键关系靠业务层保证，DDL 一般不写物理外键，仅建索引。
- **收藏/评价按需求文档每模块分表**（不合并），公共层不设统一的 `favorite`/`review` 表。

### 3.2 ER 关系概览（文字）

- `user` 1—N `order`、`address`、`message`、`post`，以及各模块的 `*_favorite`、`*_review`。
- `order`（主表）1—1 `goods_order/dining_order/housing_order/ticket_order/route_order`（类型子表）。
- `order` 1—N `payment_record`、`refund_record`、`finance_record`。
- `merchant` N—1 `user`；`merchant` 按 `module` 字段归属衣/食/住/行模块。
- 模块内：`clothing_product` 1—N `clothing_sku`、`clothing_product_image`、`clothing_review`；`restaurant` 1—N `restaurant_dish`、`dining_time_slot`；`homestay` 1—N `room_type`、`house_rule`；`room_type` 1—N `room_calendar`；`route_package` 1—N `route_itinerary`；`scenic_spot` 1—N `ticket_type`；`post` 1—N `comment`。
- 「我的收藏 / 我的评价」跨模块聚合：个人中心调用各模块的「我的收藏列表 / 我的评价列表」接口，前端或公共层汇总（见 §4.2.2 注）。

### 3.3 公共层表 DDL（@wudong/common）

```sql
-- ============ 用户与账号 ============
CREATE TABLE `user` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `phone`         VARCHAR(20)  DEFAULT NULL COMMENT '手机号，唯一',
  `password`      VARCHAR(100) DEFAULT NULL COMMENT 'bcrypt 加密密码',
  `wechat_openid` VARCHAR(64)  DEFAULT NULL COMMENT '微信 openid',
  `nickname`      VARCHAR(50)  DEFAULT NULL,
  `avatar`        VARCHAR(255) DEFAULT NULL,
  `gender`        TINYINT      DEFAULT 0 COMMENT '0未知 1男 2女',
  `region`        VARCHAR(50)  DEFAULT NULL,
  `bio`           VARCHAR(255) DEFAULT NULL,
  `status`        TINYINT      DEFAULT 0 COMMENT '0正常 1封禁',
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`),
  UNIQUE KEY `uk_openid` (`wechat_openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户';

CREATE TABLE `merchant` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`      BIGINT UNSIGNED NOT NULL COMMENT '关联 user.id',
  `merchant_no`  VARCHAR(32)  DEFAULT NULL,
  `shop_name`    VARCHAR(100) DEFAULT NULL,
  `module`       VARCHAR(20)  DEFAULT NULL COMMENT 'CLOTHING/FOOD/HOUSING/TRAVEL',
  `contact_name` VARCHAR(50)  DEFAULT NULL,
  `contact_phone` VARCHAR(20) DEFAULT NULL,
  `license_img`  VARCHAR(255) DEFAULT NULL,
  `status`       TINYINT      DEFAULT 0 COMMENT '0待审 1正常 2封禁',
  `join_time`    DATETIME     DEFAULT NULL,
  `create_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家';

CREATE TABLE `merchant_application` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `shop_name`      VARCHAR(100) DEFAULT NULL,
  `module`         VARCHAR(20)  DEFAULT NULL,
  `id_card_img`    VARCHAR(255) DEFAULT NULL,
  `license_img`    VARCHAR(255) DEFAULT NULL,
  `shop_desc`      VARCHAR(500) DEFAULT NULL,
  `apply_status`   TINYINT      DEFAULT 0 COMMENT '0待审 1通过 2驳回',
  `audit_user_id`  BIGINT UNSIGNED DEFAULT NULL,
  `audit_time`     DATETIME     DEFAULT NULL,
  `reject_reason`  VARCHAR(255) DEFAULT NULL,
  `create_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`        TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`apply_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商家入驻申请';

CREATE TABLE `admin_user` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username`        VARCHAR(50)  NOT NULL,
  `password`        VARCHAR(100) NOT NULL COMMENT 'bcrypt',
  `real_name`       VARCHAR(50)  DEFAULT NULL,
  `role_id`         BIGINT UNSIGNED DEFAULT NULL,
  `status`          TINYINT      DEFAULT 0 COMMENT '0正常 1禁用',
  `last_login_time` DATETIME     DEFAULT NULL,
  `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`         TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员账号';

CREATE TABLE `role` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_code`   VARCHAR(50)  NOT NULL COMMENT 'TOURIST/MERCHANT/ADMIN',
  `role_name`   VARCHAR(50)  DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `create_time` DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色';

CREATE TABLE `permission` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `perm_code` VARCHAR(100) NOT NULL,
  `perm_name` VARCHAR(50)  DEFAULT NULL,
  `module`    VARCHAR(50)  DEFAULT NULL,
  `parent_id` BIGINT UNSIGNED DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_perm` (`perm_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限';

CREATE TABLE `role_permission` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id`       BIGINT UNSIGNED NOT NULL,
  `permission_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联';

CREATE TABLE `address` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `receiver_name` VARCHAR(50)  DEFAULT NULL,
  `receiver_phone` VARCHAR(20) DEFAULT NULL,
  `province`      VARCHAR(30)  DEFAULT NULL,
  `city`          VARCHAR(30)  DEFAULT NULL,
  `district`      VARCHAR(30)  DEFAULT NULL,
  `detail`        VARCHAR(255) DEFAULT NULL,
  `is_default`    TINYINT      DEFAULT 0,
  `create_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT      DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收货地址';

-- ============ 订单主表 + 类型子表 ============
CREATE TABLE `order` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no`      VARCHAR(32) NOT NULL COMMENT '全局唯一订单号',
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `merchant_id`   BIGINT UNSIGNED DEFAULT NULL COMMENT '平台自营为空',
  `order_type`    VARCHAR(20) NOT NULL COMMENT 'GOODS/DINING/HOUSING/TICKET/ROUTE',
  `total_amount`  BIGINT NOT NULL DEFAULT 0 COMMENT '订单金额(分)',
  `pay_amount`    BIGINT NOT NULL DEFAULT 0 COMMENT '实付(分)',
  `status`        VARCHAR(20) NOT NULL DEFAULT 'CREATED',
  `pay_no`        VARCHAR(64)  DEFAULT NULL,
  `pay_time`      DATETIME     DEFAULT NULL,
  `refund_no`     VARCHAR(64)  DEFAULT NULL,
  `refund_time`   DATETIME     DEFAULT NULL,
  `remark`        VARCHAR(255) DEFAULT NULL,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_user` (`user_id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_status_time` (`status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

CREATE TABLE `goods_order` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`         BIGINT UNSIGNED NOT NULL,
  `receiver_name`    VARCHAR(50)  DEFAULT NULL,
  `receiver_phone`   VARCHAR(20)  DEFAULT NULL,
  `address_text`     VARCHAR(255) DEFAULT NULL COMMENT '冗余收货地址快照',
  `freight`          BIGINT DEFAULT 0,
  `logistics_company`VARCHAR(50)  DEFAULT NULL,
  `logistics_no`     VARCHAR(50)  DEFAULT NULL,
  `ship_time`        DATETIME     DEFAULT NULL,
  `confirm_time`     DATETIME     DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品订单子表(衣/食特产)';

CREATE TABLE `dining_order` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `restaurant_id`  BIGINT UNSIGNED NOT NULL,
  `dining_date`    DATE NOT NULL,
  `time_slot_id`   BIGINT UNSIGNED NOT NULL,
  `guest_count`    INT NOT NULL DEFAULT 1,
  `contact_name`   VARCHAR(50) DEFAULT NULL,
  `contact_phone`  VARCHAR(20) DEFAULT NULL,
  `note`           VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order` (`order_id`),
  KEY `idx_rest_date` (`restaurant_id`, `dining_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐位订单子表';

CREATE TABLE `housing_order` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `homestay_id`    BIGINT UNSIGNED NOT NULL,
  `room_type_id`   BIGINT UNSIGNED NOT NULL,
  `check_in_date`  DATE NOT NULL,
  `check_out_date` DATE NOT NULL,
  `guest_name`     VARCHAR(50)  DEFAULT NULL,
  `guest_id_card`  VARCHAR(30)  DEFAULT NULL COMMENT '身份证(加密/脱敏)',
  `guest_phone`    VARCHAR(20)  DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order` (`order_id`),
  KEY `idx_homestay_date` (`homestay_id`, `check_in_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='住宿订单子表';

CREATE TABLE `ticket_order` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `scenic_spot_id` BIGINT UNSIGNED NOT NULL,
  `ticket_type_id` BIGINT UNSIGNED NOT NULL,
  `use_date`       DATE NOT NULL,
  `quantity`       INT NOT NULL DEFAULT 1,
  `visitor_names`  JSON DEFAULT NULL COMMENT '游客姓名列表',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='门票订单子表';

CREATE TABLE `route_order` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`        BIGINT UNSIGNED NOT NULL,
  `route_package_id`BIGINT UNSIGNED NOT NULL,
  `depart_date`     DATE NOT NULL,
  `guest_count`     INT NOT NULL DEFAULT 1,
  `visitor_names`   JSON DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线订单子表';

-- ============ 支付与退款 ============
CREATE TABLE `payment_record` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pay_no`         VARCHAR(64) NOT NULL,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `pay_type`       VARCHAR(20) NOT NULL COMMENT 'WECHAT/ALIPAY',
  `amount`         BIGINT NOT NULL,
  `status`         VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING/SUCCESS/FAILED/CLOSED',
  `transaction_id` VARCHAR(64) DEFAULT NULL COMMENT '微信/支付宝交易单号',
  `notify_data`    JSON DEFAULT NULL COMMENT '回调原文',
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_pay_no` (`pay_no`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付记录';

CREATE TABLE `refund_record` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `refund_no`   VARCHAR(64) NOT NULL,
  `order_id`    BIGINT UNSIGNED NOT NULL,
  `pay_no`      VARCHAR(64) DEFAULT NULL,
  `amount`      BIGINT NOT NULL,
  `reason`      VARCHAR(255) DEFAULT NULL,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'APPLYING' COMMENT 'APPLYING/SUCCESS/FAILED',
  `refund_time` DATETIME DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_refund_no` (`refund_no`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='退款记录';

-- ============ 消息 ============
CREATE TABLE `message` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `type`        VARCHAR(20) NOT NULL COMMENT 'SYSTEM/ORDER/INTERACTION',
  `title`       VARCHAR(100) DEFAULT NULL,
  `content`     VARCHAR(500) DEFAULT NULL,
  `is_read`     TINYINT DEFAULT 0,
  `related_id`  BIGINT UNSIGNED DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='站内消息';

-- ============ 运营与系统 ============
CREATE TABLE `banner` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(100) DEFAULT NULL,
  `image_url`   VARCHAR(255) NOT NULL,
  `link_url`    VARCHAR(255) DEFAULT NULL,
  `sort`        INT DEFAULT 0,
  `status`      TINYINT DEFAULT 1 COMMENT '0下架 1上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='首页轮播';

CREATE TABLE `announcement` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`        VARCHAR(100) NOT NULL,
  `content`      TEXT,
  `status`       TINYINT DEFAULT 1,
  `publish_time` DATETIME DEFAULT NULL,
  `create_time`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='平台公告';

CREATE TABLE `activity_banner` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`       VARCHAR(100) DEFAULT NULL,
  `image_url`   VARCHAR(255) NOT NULL,
  `link_url`    VARCHAR(255) DEFAULT NULL,
  `start_time`  DATETIME DEFAULT NULL,
  `end_time`    DATETIME DEFAULT NULL,
  `sort`        INT DEFAULT 0,
  `status`      TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动横幅';

CREATE TABLE `recommend_slot` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slot_name`    VARCHAR(50) DEFAULT NULL COMMENT '推荐位名称',
  `content_type` VARCHAR(20) DEFAULT NULL COMMENT 'PRODUCT/RESTAURANT/HOMESTAY/ROUTE/POST',
  `content_id`   BIGINT UNSIGNED DEFAULT NULL,
  `sort`         INT DEFAULT 0,
  `status`       TINYINT DEFAULT 1,
  `create_time`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐位';

CREATE TABLE `hot_keyword` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `keyword`     VARCHAR(50) NOT NULL,
  `sort`        INT DEFAULT 0,
  `status`      TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='热搜词';

CREATE TABLE `operation_log` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `operator_id`   BIGINT UNSIGNED DEFAULT NULL,
  `operator_name` VARCHAR(50) DEFAULT NULL,
  `module`        VARCHAR(50) DEFAULT NULL,
  `action`        VARCHAR(50) DEFAULT NULL,
  `target`        VARCHAR(255) DEFAULT NULL,
  `detail`        VARCHAR(1000) DEFAULT NULL,
  `ip`            VARCHAR(64) DEFAULT NULL,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_operator` (`operator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志';

CREATE TABLE `finance_record` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`          BIGINT UNSIGNED NOT NULL,
  `merchant_id`       BIGINT UNSIGNED NOT NULL,
  `order_amount`      BIGINT NOT NULL,
  `commission_rate`   DECIMAL(5,2) DEFAULT 0 COMMENT '抽佣比例%',
  `commission_amount` BIGINT NOT NULL DEFAULT 0 COMMENT '平台抽佣(分)',
  `merchant_amount`   BIGINT NOT NULL DEFAULT 0 COMMENT '商家所得(分)',
  `settle_status`     VARCHAR(20) DEFAULT 'UNSETTLED' COMMENT 'UNSETTLED/SETTLED',
  `settle_time`       DATETIME DEFAULT NULL,
  `create_time`       DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_merchant` (`merchant_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='财务分账记录';

CREATE TABLE `sys_config` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `config_key`   VARCHAR(100) NOT NULL,
  `config_value` VARCHAR(500) DEFAULT NULL,
  `description`  VARCHAR(255) DEFAULT NULL,
  `create_time`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置';
```

> 注：购物车（`cart`）不建 MySQL 表，存 Redis，见 §6.6。

### 3.4 模块层表 DDL

#### 模块一（衣）

```sql
CREATE TABLE `clothing_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` BIGINT UNSIGNED DEFAULT 0,
  `name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `sort` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类';

CREATE TABLE `clothing_product` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id`   BIGINT UNSIGNED NOT NULL,
  `category_id`   BIGINT UNSIGNED NOT NULL,
  `title`         VARCHAR(100) NOT NULL,
  `subtitle`      VARCHAR(255) DEFAULT NULL,
  `main_image`    VARCHAR(255) DEFAULT NULL,
  `price`         BIGINT NOT NULL DEFAULT 0,
  `market_price`  BIGINT DEFAULT NULL,
  `stock`         INT NOT NULL DEFAULT 0,
  `sales`         INT NOT NULL DEFAULT 0,
  `detail`        TEXT COMMENT '富文本详情',
  `craft_intro`   TEXT COMMENT '工艺介绍',
  `inheritor_id`  BIGINT UNSIGNED DEFAULT NULL COMMENT '传承人',
  `status`        TINYINT DEFAULT 1 COMMENT '0下架 1上架',
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='非遗商品';

CREATE TABLE `clothing_sku` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `spec_name`  VARCHAR(100) DEFAULT NULL COMMENT '如 银饰-手镯-中号',
  `price`      BIGINT NOT NULL DEFAULT 0,
  `stock`      INT NOT NULL DEFAULT 0,
  `image`      VARCHAR(255) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`    TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品SKU';

CREATE TABLE `clothing_product_image` (
  `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `image_url`  VARCHAR(255) NOT NULL,
  `sort`       INT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品图片';

CREATE TABLE `clothing_favorite` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `product_id`  BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_product` (`user_id`, `product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品收藏';

CREATE TABLE `clothing_review` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`      BIGINT UNSIGNED DEFAULT NULL,
  `product_id`    BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `rating`        TINYINT NOT NULL DEFAULT 5 COMMENT '1-5',
  `content`       VARCHAR(1000) DEFAULT NULL,
  `images`        JSON DEFAULT NULL,
  `follow_up`     VARCHAR(500) DEFAULT NULL COMMENT '追评',
  `follow_up_time`DATETIME DEFAULT NULL,
  `merchant_reply`VARCHAR(500) DEFAULT NULL,
  `status`        TINYINT DEFAULT 0 COMMENT '0正常 1隐藏',
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品评价';
```

#### 模块二（食）

```sql
CREATE TABLE `restaurant` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id`   BIGINT UNSIGNED NOT NULL,
  `name`          VARCHAR(100) NOT NULL,
  `address`       VARCHAR(255) DEFAULT NULL,
  `longitude`     DECIMAL(10,6) DEFAULT NULL,
  `latitude`      DECIMAL(10,6) DEFAULT NULL,
  `business_hours`VARCHAR(100) DEFAULT NULL,
  `capacity`      INT DEFAULT 0 COMMENT '容纳人数',
  `intro`         TEXT,
  `main_image`    VARCHAR(255) DEFAULT NULL,
  `status`        TINYINT DEFAULT 1,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅';

CREATE TABLE `restaurant_dish` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `restaurant_id` BIGINT UNSIGNED NOT NULL,
  `name`          VARCHAR(100) NOT NULL,
  `price`         BIGINT NOT NULL DEFAULT 0,
  `main_image`    VARCHAR(255) DEFAULT NULL,
  `intro`         VARCHAR(255) DEFAULT NULL,
  `is_signature`  TINYINT DEFAULT 0 COMMENT '是否招牌',
  `status`        TINYINT DEFAULT 1,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅菜品';

CREATE TABLE `dining_time_slot` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `restaurant_id` BIGINT UNSIGNED NOT NULL,
  `slot_name`     VARCHAR(50) DEFAULT NULL COMMENT '如 午餐11:30-13:30',
  `start_time`    VARCHAR(10) DEFAULT NULL,
  `end_time`      VARCHAR(10) DEFAULT NULL,
  `max_booking`   INT DEFAULT 0,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_restaurant` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐位时段';

CREATE TABLE `agri_category` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `icon` VARCHAR(255) DEFAULT NULL,
  `sort` INT DEFAULT 0,
  `status` TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted` TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农产品分类';

CREATE TABLE `agri_product` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id` BIGINT UNSIGNED NOT NULL,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `price`       BIGINT NOT NULL DEFAULT 0,
  `spec`        VARCHAR(50) DEFAULT NULL,
  `stock`       INT NOT NULL DEFAULT 0,
  `main_image`  VARCHAR(255) DEFAULT NULL,
  `origin`      VARCHAR(100) DEFAULT NULL COMMENT '产地',
  `shelf_life`  VARCHAR(50) DEFAULT NULL COMMENT '保质期',
  `detail`      TEXT,
  `status`      TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category_id`),
  KEY `idx_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='农产品商品';

CREATE TABLE `food_favorite` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `target_type` VARCHAR(20) NOT NULL COMMENT 'RESTAURANT/PRODUCT',
  `target_id`   BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅/农产品收藏';

CREATE TABLE `food_review` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`      BIGINT UNSIGNED DEFAULT NULL,
  `target_type`   VARCHAR(20) NOT NULL COMMENT 'RESTAURANT/PRODUCT',
  `target_id`     BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `rating`        TINYINT NOT NULL DEFAULT 5,
  `content`       VARCHAR(1000) DEFAULT NULL,
  `images`        JSON DEFAULT NULL,
  `merchant_reply`VARCHAR(500) DEFAULT NULL,
  `status`        TINYINT DEFAULT 0,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='餐厅/农产品评价';
```

#### 模块三（住）

```sql
CREATE TABLE `homestay` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `merchant_id`  BIGINT UNSIGNED NOT NULL,
  `name`         VARCHAR(100) NOT NULL,
  `address`      VARCHAR(255) DEFAULT NULL,
  `longitude`    DECIMAL(10,6) DEFAULT NULL,
  `latitude`     DECIMAL(10,6) DEFAULT NULL,
  `style_tag`    VARCHAR(255) DEFAULT NULL COMMENT '风格标签,逗号分隔',
  `facility_tag` VARCHAR(255) DEFAULT NULL COMMENT '设施标签,逗号分隔',
  `main_image`   VARCHAR(255) DEFAULT NULL,
  `intro`        TEXT,
  `rating`       DECIMAL(2,1) DEFAULT 5.0,
  `status`       TINYINT DEFAULT 1,
  `create_time`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`      TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_merchant` (`merchant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民宿';

CREATE TABLE `room_type` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `name`        VARCHAR(100) NOT NULL,
  `bed_type`    VARCHAR(50) DEFAULT NULL,
  `area`        VARCHAR(50) DEFAULT NULL,
  `capacity`    INT DEFAULT 1,
  `facility`    VARCHAR(255) DEFAULT NULL,
  `price`       BIGINT NOT NULL DEFAULT 0,
  `stock`       INT NOT NULL DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_homestay` (`homestay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房型';

CREATE TABLE `room_calendar` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_type_id`    BIGINT UNSIGNED NOT NULL,
  `date`            DATE NOT NULL,
  `available_stock` INT NOT NULL DEFAULT 0,
  `price`           BIGINT NOT NULL DEFAULT 0 COMMENT '动态定价',
  `status`          TINYINT DEFAULT 1 COMMENT '0不可订 1可订',
  `create_time`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_room_date` (`room_type_id`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房态日历';

CREATE TABLE `house_rule` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `homestay_id`    BIGINT UNSIGNED NOT NULL,
  `check_in_time`  VARCHAR(20) DEFAULT NULL,
  `check_out_time` VARCHAR(20) DEFAULT NULL,
  `pet_policy`     VARCHAR(100) DEFAULT NULL,
  `has_breakfast`  TINYINT DEFAULT 0,
  `deposit`        BIGINT DEFAULT 0,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_homestay` (`homestay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='入住须知';

CREATE TABLE `housing_favorite` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `homestay_id` BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_homestay` (`user_id`, `homestay_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民宿收藏';

CREATE TABLE `housing_review` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`      BIGINT UNSIGNED DEFAULT NULL,
  `homestay_id`   BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `rating`        TINYINT NOT NULL DEFAULT 5,
  `content`       VARCHAR(1000) DEFAULT NULL,
  `images`        JSON DEFAULT NULL,
  `merchant_reply`VARCHAR(500) DEFAULT NULL,
  `status`        TINYINT DEFAULT 0,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_homestay` (`homestay_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='民宿评价';
```

#### 模块四（行）

```sql
CREATE TABLE `scenic_spot` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(100) NOT NULL,
  `address`     VARCHAR(255) DEFAULT NULL,
  `longitude`   DECIMAL(10,6) DEFAULT NULL,
  `latitude`    DECIMAL(10,6) DEFAULT NULL,
  `open_time`   VARCHAR(100) DEFAULT NULL,
  `intro`       TEXT,
  `main_image`  VARCHAR(255) DEFAULT NULL,
  `status`      TINYINT DEFAULT 1,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景区';

CREATE TABLE `ticket_type` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `scenic_spot_id` BIGINT UNSIGNED NOT NULL,
  `name`           VARCHAR(50) NOT NULL COMMENT '成人/儿童/学生/家庭套票',
  `price`          BIGINT NOT NULL DEFAULT 0,
  `stock`          INT NOT NULL DEFAULT 0,
  `valid_rule`     VARCHAR(100) DEFAULT NULL COMMENT '有效期规则',
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`        TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_scenic` (`scenic_spot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='票种';

CREATE TABLE `route_package` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`          VARCHAR(100) NOT NULL,
  `days`           INT DEFAULT 1,
  `price`          BIGINT NOT NULL DEFAULT 0,
  `include_items`  TEXT COMMENT '包含项目',
  `itinerary_desc` TEXT COMMENT '行程安排',
  `depart_from`    VARCHAR(50) DEFAULT NULL,
  `destination`    VARCHAR(50) DEFAULT NULL,
  `hotel_standard` VARCHAR(50) DEFAULT NULL,
  `meal_standard`  VARCHAR(50) DEFAULT NULL,
  `notice`         TEXT COMMENT '注意事项',
  `main_image`     VARCHAR(255) DEFAULT NULL,
  `detail`         TEXT,
  `status`         TINYINT DEFAULT 1,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`        TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线套餐';

CREATE TABLE `route_itinerary` (
  `id`        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `route_id`  BIGINT UNSIGNED NOT NULL,
  `day_no`    INT NOT NULL,
  `desc`      VARCHAR(500) DEFAULT NULL,
  `scenic`    VARCHAR(255) DEFAULT NULL,
  `meal`      VARCHAR(255) DEFAULT NULL,
  `hotel`     VARCHAR(255) DEFAULT NULL,
  `transport` VARCHAR(255) DEFAULT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_route` (`route_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='路线行程';

CREATE TABLE `e_ticket` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`       BIGINT UNSIGNED NOT NULL,
  `target_type`    VARCHAR(20) DEFAULT NULL COMMENT 'TICKET/ROUTE',
  `target_id`      BIGINT UNSIGNED DEFAULT NULL,
  `ticket_no`      VARCHAR(64) NOT NULL COMMENT '二维码内容',
  `valid_date`     DATE DEFAULT NULL,
  `status`         VARCHAR(20) DEFAULT 'UNUSED' COMMENT 'UNUSED/USED/REFUNDED',
  `use_time`       DATETIME DEFAULT NULL,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_no` (`ticket_no`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电子票';

CREATE TABLE `traffic_guide` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title`          VARCHAR(100) NOT NULL,
  `depart_from`    VARCHAR(50) DEFAULT NULL,
  `destination`    VARCHAR(50) DEFAULT NULL,
  `transport_type` VARCHAR(50) DEFAULT NULL,
  `duration`       VARCHAR(50) DEFAULT NULL,
  `cost`           VARCHAR(50) DEFAULT NULL,
  `detail`         TEXT,
  `image`          VARCHAR(255) DEFAULT NULL,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`        TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='交通攻略';

CREATE TABLE `travel_favorite` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `target_type` VARCHAR(20) NOT NULL COMMENT 'SCENIC/ROUTE/GUIDE',
  `target_id`   BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景区/路线/攻略收藏';

CREATE TABLE `travel_review` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id`      BIGINT UNSIGNED DEFAULT NULL,
  `target_type`   VARCHAR(20) NOT NULL COMMENT 'SCENIC/ROUTE',
  `target_id`     BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `rating`        TINYINT NOT NULL DEFAULT 5,
  `content`       VARCHAR(1000) DEFAULT NULL,
  `images`        JSON DEFAULT NULL,
  `merchant_reply`VARCHAR(500) DEFAULT NULL,
  `status`        TINYINT DEFAULT 0,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='景区/路线评价';
```

#### 模块五（社区）

```sql
CREATE TABLE `post` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `title`         VARCHAR(100) DEFAULT NULL,
  `content`       TEXT,
  `image_list`    JSON DEFAULT NULL COMMENT '图片URL列表(≤9)',
  `video_url`     VARCHAR(255) DEFAULT NULL,
  `related_type`  VARCHAR(20) DEFAULT NULL COMMENT 'RESTAURANT/HOMESTAY/SCENIC',
  `related_id`    BIGINT UNSIGNED DEFAULT NULL,
  `topic_ids`     JSON DEFAULT NULL,
  `like_count`    INT DEFAULT 0,
  `comment_count` INT DEFAULT 0,
  `favorite_count`INT DEFAULT 0,
  `view_count`    INT DEFAULT 0,
  `status`        VARCHAR(20) DEFAULT 'AUDITING' COMMENT 'NORMAL/AUDITING/OFFLINE',
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status_time` (`status`, `create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游记';

CREATE TABLE `comment` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `post_id`       BIGINT UNSIGNED NOT NULL,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `content`       VARCHAR(500) NOT NULL,
  `reply_to_id`   BIGINT UNSIGNED DEFAULT NULL COMMENT '被回复评论id(二级)',
  `reply_user_id` BIGINT UNSIGNED DEFAULT NULL,
  `like_count`    INT DEFAULT 0,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `deleted`       TINYINT DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论';

CREATE TABLE `topic` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(50) NOT NULL,
  `intro`       VARCHAR(255) DEFAULT NULL,
  `follow_count` INT DEFAULT 0,
  `post_count`  INT DEFAULT 0,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted`     TINYINT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='话题';

CREATE TABLE `follow` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT UNSIGNED NOT NULL,
  `follow_user_id` BIGINT UNSIGNED NOT NULL,
  `create_time`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_follow` (`user_id`, `follow_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关注关系';

CREATE TABLE `post_like` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `target_type` VARCHAR(20) NOT NULL COMMENT 'POST/COMMENT',
  `target_id`   BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_target` (`user_id`, `target_type`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='点赞';

CREATE TABLE `post_favorite` (
  `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`     BIGINT UNSIGNED NOT NULL,
  `post_id`     BIGINT UNSIGNED NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_post` (`user_id`, `post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='游记收藏';

CREATE TABLE `report` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`       BIGINT UNSIGNED NOT NULL,
  `target_type`   VARCHAR(20) NOT NULL COMMENT 'POST/COMMENT',
  `target_id`     BIGINT UNSIGNED NOT NULL,
  `reason`        VARCHAR(255) DEFAULT NULL,
  `status`        VARCHAR(20) DEFAULT 'PENDING' COMMENT 'PENDING/PROCESSED/REJECTED',
  `handle_result` VARCHAR(500) DEFAULT NULL,
  `create_time`   DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='举报';
```

> 模块六（管理后台）复用公共层 `admin_user/role/permission/merchant_application/banner/announcement/activity_banner/recommend_slot/hot_keyword/operation_log/finance_record/sys_config`，无新增业务表。

### 3.5 建表方式（TypeORM）

- 开发期：`typeorm.synchronize: true` 由实体自动建表，快速上手。
- 本文档 DDL 作为**规范参考**与验收依据（评审需提交 DDL，见需求 13.4）。
- 生产环境：切换 `synchronize: false`，改用 TypeORM migration（各包 `src/migration/` 维护）。

## 4. 接口设计（API）

### 4.1 通用约定

- 风格：REST，路径统一 `/api/<module>/...`；后台 `/admin/<module>/...`（走 Cool Admin 的 Curd 控制器）。
- 响应包裹（统一返回体）：

```json
{ "code": 0, "message": "ok", "data": { } }
```

- 分页请求：`page`（1 起）、`size`（默认 10，最大 50）；分页返回 `{ "list": [], "total": 0, "page": 1, "size": 10 }`。
- 认证：小程序/PC 用户端请求头 `Authorization: Bearer <token>`；后台用 Cool Admin 内置鉴权（管理员 JWT）。
- 错误码（见 §2.5 / 公共包 `ErrorCode`）：

| 区间 | 含义 | 示例 |
|---|---|---|
| 0 | 成功 | — |
| 1xxx | 业务 | 1001 商品不存在、1002 库存不足 |
| 2xxx | 认证/权限 | 2001 未登录、2002 无权限 |
| 3xxx | 参数校验 | 3001 参数错误、3002 手机号格式错误 |
| 4xxx | 支付 | 4001 支付单不存在、4002 重复回调 |
| 5xxx | 系统 | 5000 系统错误、5001 第三方服务异常 |

### 4.2 用户与账号

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/auth/wechat/login | 微信登录（code 换 openid，静默注册） |
| POST | /api/auth/phone/code | 发送短信验证码（mock） |
| POST | /api/auth/phone/login | 手机号+验证码登录 |
| GET | /api/user/profile | 获取个人信息 |
| PUT | /api/user/profile | 修改个人信息 |
| GET | /api/user/addresses | 收货地址列表 |
| POST | /api/user/addresses | 新增地址 |
| PUT | /api/user/addresses/:id | 修改地址 |
| DELETE | /api/user/addresses/:id | 删除地址 |
| GET | /api/user/messages | 我的消息 |
| PUT | /api/user/messages/:id/read | 标记已读 |

### 4.2.2 我的收藏 / 我的评价（跨模块聚合）

> 收藏/评价已按模块分表，个人中心「我的收藏/我的评价」由**各模块接口汇总**：前端并行请求各模块的列表接口，公共层可提供一个聚合入口（`/api/user/favorites`）在后端并发调用各模块 Service 组装，前端二选一即可。

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/user/favorites | 聚合我的收藏（跨模块，可选实现） |
| GET | /api/user/reviews | 聚合我的评价（跨模块，可选实现） |

### 4.3 模块一（衣）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/clothing/categories | 分类树 |
| GET | /api/clothing/products | 商品列表（分页/筛选/搜索） |
| GET | /api/clothing/products/:id | 商品详情（含 SKU、图片） |
| POST | /api/clothing/favorites | 收藏商品 |
| DELETE | /api/clothing/favorites/:productId | 取消收藏 |
| GET | /api/clothing/favorites | 我的商品收藏 |
| POST | /api/clothing/reviews | 发表商品评价 |
| GET | /api/clothing/products/:id/reviews | 商品评价列表 |
| POST | /api/clothing/reviews/:id/reply | 商家回复 |

### 4.4 模块二（食）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/food/restaurants | 餐厅列表（按距离/评分） |
| GET | /api/food/restaurants/:id | 餐厅详情（含菜品） |
| GET | /api/food/restaurants/:id/time-slots | 可订餐位时段 |
| GET | /api/food/agri-products | 农产品列表 |
| GET | /api/food/agri-products/:id | 农产品详情 |
| POST | /api/food/favorites | 收藏（body 带 targetType/targetId） |
| DELETE | /api/food/favorites/:targetType/:targetId | 取消收藏 |
| GET | /api/food/favorites | 我的美食收藏 |
| POST | /api/food/reviews | 发表评价 |
| GET | /api/food/reviews | 餐厅/商品评价列表（按 targetType/targetId） |

### 4.5 模块三（住）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/housing/homestays | 民宿列表 |
| GET | /api/housing/homestays/:id | 民宿详情（含房型/须知） |
| GET | /api/housing/homestays/:id/calendar | 房态日历（按月） |
| POST | /api/housing/favorites | 收藏民宿 |
| DELETE | /api/housing/favorites/:homestayId | 取消收藏 |
| GET | /api/housing/favorites | 我的民宿收藏 |
| POST | /api/housing/reviews | 发表评价 |
| GET | /api/housing/homestays/:id/reviews | 民宿评价列表 |

### 4.6 模块四（行）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/travel/scenic-spots | 景区列表 |
| GET | /api/travel/scenic-spots/:id | 景区详情（含票种） |
| GET | /api/travel/routes | 路线列表 |
| GET | /api/travel/routes/:id | 路线详情（含行程） |
| GET | /api/travel/guides | 交通攻略列表 |
| GET | /api/travel/guides/:id | 攻略详情 |
| GET | /api/travel/etickets/:orderId | 电子票二维码 |
| POST | /api/travel/favorites | 收藏（targetType: SCENIC/ROUTE/GUIDE） |
| DELETE | /api/travel/favorites/:targetType/:targetId | 取消收藏 |
| GET | /api/travel/favorites | 我的旅行收藏 |
| POST | /api/travel/reviews | 发表评价 |
| GET | /api/travel/reviews | 景区/路线评价列表 |

### 4.7 模块五（社区）

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | /api/community/feed | 游记信息流（推荐/关注/最新） |
| GET | /api/community/posts/:id | 游记详情 |
| POST | /api/community/posts | 发布游记（先过内容审核） |
| DELETE | /api/community/posts/:id | 删除游记 |
| POST | /api/community/posts/:id/like | 点赞/取消点赞 |
| POST | /api/community/posts/:id/favorite | 收藏游记 |
| DELETE | /api/community/posts/:id/favorite | 取消收藏 |
| GET | /api/community/favorites | 我的游记收藏 |
| POST | /api/community/posts/:id/comments | 发表评论 |
| GET | /api/community/posts/:id/comments | 评论列表 |
| GET | /api/community/topics | 话题列表 |
| POST | /api/community/topics/:id/follow | 关注话题 |
| POST | /api/community/users/:id/follow | 关注用户 |
| GET | /api/community/users/:id/followers | 粉丝列表 |
| GET | /api/community/users/:id/followings | 关注列表 |
| POST | /api/community/reports | 举报 |

### 4.8 订单与支付

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/order | 创建订单（购物车结算/直接购买） |
| GET | /api/order | 我的订单列表（按类型/状态） |
| GET | /api/order/:id | 订单详情 |
| POST | /api/order/:id/cancel | 取消订单 |
| POST | /api/order/:id/pay | 发起支付（返回微信支付参数） |
| POST | /api/order/:id/confirm | 确认收货/核销 |
| POST | /api/order/:id/refund | 申请退款 |
| GET | /api/pay/notify/wechat | 微信支付回调（幂等） |
| GET | /api/pay/refund/notify/wechat | 微信退款回调 |

### 4.9 管理后台（Cool Admin 自动 CRUD + 业务扩展）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /admin/auth/login | 管理员登录 |
| GET | /admin/merchant/applications | 入驻申请列表 |
| POST | /admin/merchant/applications/:id/approve | 审核通过 |
| POST | /admin/merchant/applications/:id/reject | 驳回 |
| GET | /admin/orders | 全量订单 |
| GET | /admin/finance | 财务分账 |
| GET | /admin/operations/logs | 操作日志 |
| PUT | /admin/sys/config | 系统配置 |

> 各模块的「商品/餐厅/民宿/景区/路线/游记」管理走 Cool Admin 的 Curd 自动 CRUD（`/admin/clothing/products` 等），少数页面在对应模块 Controller 里扩展自定义接口（审核、上下架、推荐位）。

## 5. 核心流程与时序

### 5.1 下单 → 支付 → 回调

```
客户端                 wudong-server(订单/支付)          微信支付
  |  1. POST /api/order (创建订单)             |
  |------------------------------------------>|
  |  <-- 返回 orderNo + 金额，status=CREATED    |
  |  2. POST /api/order/:id/pay               |
  |------------------------------------------>|
  |      生成 payment_record(PENDING)，调微信统一下单 |
  |------------------------------------------>|
  |  <-- 返回 prepay_id + 签名参数               |
  |  3. 客户端拉起微信支付，用户完成支付            |
  |  4. 微信异步回调 GET /api/pay/notify/wechat   |
  |------------------------------------------>|
  |     验签 → 幂等判断 → 更新 order.status=PAID |
  |     回写 payment_record=SUCCESS             |
  |  <-- 返回 {"code":"SUCCESS"}                 |
  |  5. 客户端查询订单，确认已支付                  |
```

- 关键点：以**回调**为准更新订单状态，客户端轮询仅作展示；回调需验签 + 幂等（见 §6.3）。

### 5.2 退款

```
客户端          订单服务            微信退款           账务
  | POST /api/order/:id/refund      |                 |
  |------------------------------>|                 |
  |  校验状态(可退)→生成refund_record |                |
  |  调微信退款                    |                |
  |------------------------------>|                |
  |  <-- 受理成功                   |                |
  |  异步回调 refund notify          |                |
  |------------------------------>|                |
  |  更新 order.status=REFUNDED     |                |
  |  生成 finance_record(负向冲销)   |---------------->|
```

### 5.3 商家入驻审核

```
商家用户          平台后台
  | 提交申请(材料上传OSS) |
  |-------------------->| merchant_application=待审
  |   后台审核通过/驳回    |
  |-------------------->| 通过→ merchant 创建 + user 绑定商家角色
  |   通知(站内信)        |
```

### 5.4 社区发帖审核

```
用户           社区服务          内容审核(mock)
  | 发布游记        |                 |
  |------------->| post.status=AUDITING|
  |              | 调审核接口          |
  |              |----------------->|
  |  <-- 通过 → NORMAL；不通过 → OFFLINE |
  | 信息流仅展示 NORMAL 状态帖子            |
```

## 6. 关键实现方案（TypeScript / Midway）

### 6.1 分层结构与依赖注入

Midway 采用 IoC 容器 + 装饰器注入，典型模块分层：

```typescript
// modules/clothing/entity/product.ts
import { EntityModel } from '@midwayjs/typeorm';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@EntityModel('clothing_product')
@Entity()
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'merchant_id', type: 'bigint' })
  merchantId: number;

  @Column({ name: 'title', length: 100 })
  title: string;

  @Column({ name: 'price', type: 'bigint' })
  price: number; // 单位:分
}

// modules/clothing/service/product.ts
import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entity/product';

@Provide()
export class ProductService {
  @InjectEntityModel(ProductEntity)
  repo: Repository<ProductEntity>;

  async detail(id: number) {
    return this.repo.findOneBy({ id, deleted: 0 });
  }
}

// modules/clothing/controller/product.ts
import { Controller, Get, Inject, Query } from '@midwayjs/core';
import { ProductService } from '../service/product';

@Controller('/api/clothing')
export class ProductController {
  @Inject()
  productService: ProductService;

  @Get('/products/:id')
  async detail(@Param('id') id: number) {
    return { code: 0, data: await this.productService.detail(id) };
  }
}
```

- `@EntityModel` 由 `@midwayjs/typeorm` 提供，自动把实体注册进 TypeORM 数据源。
- 模块 npm 包统一在 `src/index.ts` 导出 `* as entity`、`* as service`、`* as controller`，由 `wudong-server` 的 `configuration.ts` 通过 `importConfigs` 加载（外部模块加载机制以官方文档为准，见 §12 附录，兜底方案单仓库）。

### 6.2 订单状态机

```typescript
// modules/order/order.state.ts
export enum OrderStatus {
  CREATED = 'CREATED',       // 已创建待支付
  PAID = 'PAID',             // 已支付
  CONFIRMED = 'CONFIRMED',   // 已确认（商家接单/预约确认）
  IN_PROGRESS = 'IN_PROGRESS', // 进行中（入住/发团/配送中）
  COMPLETED = 'COMPLETED',   // 已完成
  CANCELLED = 'CANCELLED',   // 已取消
  REFUNDING = 'REFUNDING',   // 退款中
  REFUNDED = 'REFUNDED',     // 已退款
}

export const OrderTransition: Record<string, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.REFUNDING],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED, OrderStatus.REFUNDING],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED, OrderStatus.REFUNDING],
  [OrderStatus.COMPLETED]: [OrderStatus.REFUNDING],
  [OrderStatus.REFUNDING]: [OrderStatus.REFUNDED, OrderStatus.COMPLETED],
  // CANCELLED / REFUNDED 为终态，无出边
};

export function canTransit(from: OrderStatus, to: OrderStatus): boolean {
  return OrderTransition[from]?.includes(to) ?? false;
}
```

- 状态变更统一走 `OrderService.transit(orderId, target)`，先 `canTransit` 校验，再用乐观更新 `UPDATE order SET status=:to WHERE id=:id AND status=:from`，防并发重复变更。

### 6.3 支付回调幂等

```typescript
// modules/pay/service/wechat-pay.ts
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PaymentRecordEntity } from '../entity/payment-record';
import { OrderEntity } from '../../order/entity/order';

@Provide()
export class WechatPayService {
  @InjectEntityModel(PaymentRecordEntity)
  payRepo: Repository<PaymentRecordEntity>;

  async handleNotify(payload: any, em: EntityManager) {
    // 1) 验签（用微信平台证书/APIv3 公钥）
    if (!this.verifySign(payload)) throw new BizError(ErrorCode.PAY_SIGN_ERROR);

    const payNo = payload.out_trade_no;
    // 2) 幂等：已成功直接返回，避免重复处理
    const record = await em.findOne(PaymentRecordEntity, { where: { payNo } });
    if (record && record.status === 'SUCCESS') return { code: 'SUCCESS' };

    // 3) 单事务：更新支付记录 + 订单状态
    await em.transaction(async (tx) => {
      await tx.update(PaymentRecordEntity, { payNo }, {
        status: 'SUCCESS', transactionId: payload.transaction_id, notifyData: payload,
      });
      await tx.update(OrderEntity, { orderNo: payload.out_trade_no, status: 'CREATED' },
        { status: 'PAID', payNo, payTime: new Date() });
    });

    return { code: 'SUCCESS', message: '成功' };
  }
}
```

- `out_trade_no` 唯一约束 + 状态条件更新（`WHERE status='CREATED'`）双重保证幂等。

### 6.4 认证与鉴权（Cool Admin 内置）

- 后台：直接用 Cool Admin 的登录/JWT + RBAC（`@CoolController`、`@CoolUrlTag`），无需自研。
- 用户端：基于 JWT 的中间件，装饰器 `@Get('/xxx', { middleware: ['userAuthMiddleware'] })` 校验 `Authorization`，把 `userId` 注入上下文。
- 权限点：`PERMISSION` 表 + 自定义 `@CoolPermission('clothing:product:edit')` 装饰器（Cool Admin 支持）。

### 6.5 全局异常过滤器

```typescript
// middleware/error.filter.ts
import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: any, ctx: Context) {
    const status = err.status ?? 500;
    const body = {
      code: err.code ?? 5000,
      message: err.message ?? '系统错误',
    };
    ctx.status = 200; // 业务错误统一 HTTP 200 + code
    ctx.body = body;
  }
}
```

- 自定义 `BizError extends Error`（带 `code`），业务层 `throw new BizError(ErrorCode.XXX, 'msg')`；`ErrorCode` 定义在 `@wudong/common`。

### 6.6 Redis 购物车（不建表）

```typescript
// modules/cart/service/cart.ts
@Provide()
export class CartService {
  @Inject()
  redisService: RedisService; // Cool Admin 内置 Redis 封装

  private key(userId: number) { return `cart:${userId}`; }

  async add(userId: number, item: { productId: number; skuId: number; count: number }) {
    const k = this.key(userId);
    const cart: CartItem[] = JSON.parse((await this.redisService.get(k)) || '[]');
    const idx = cart.findIndex(i => i.skuId === item.skuId);
    if (idx >= 0) cart[idx].count += item.count; else cart.push({ ...item, addTime: Date.now() });
    await this.redisService.set(k, JSON.stringify(cart));
  }

  async list(userId: number) {
    const k = this.key(userId);
    return JSON.parse((await this.redisService.get(k)) || '[]');
  }

  async clear(userId: number) { await this.redisService.del(this.key(userId)); }
}
```

- Key 设计：`cart:{userId}`，值 JSON 数组；下单成功即 `clear`。

### 6.7 库存扣减（乐观锁）

```typescript
// modules/clothing/service/stock.ts
async deduct(productId: number, count: number, tx: EntityManager) {
  const r = await tx.update(ProductEntity,
    { id: productId, stock: MoreThanOrEqual(count) },   // 库存充足才扣
    { stock: () => `stock - ${count}` });
  if (r.affected === 0) throw new BizError(ErrorCode.STOCK_NOT_ENOUGH);
}
```

- 房态/票量扣减同理，用「条件 UPDATE」防超卖；高并发再叠加 Redis 预扣（可选）。

### 6.8 参数校验（DTO）

```typescript
// dto/order.create.ts
import { Rule, RuleType } from '@midwayjs/validate';

export class CreateOrderDTO {
  @Rule(RuleType.string().required())
  orderType: string; // GOODS/DINING/HOUSING/TICKET/ROUTE

  @Rule(RuleType.number().integer().min(1))
  quantity?: number;
}
```

- Midway 内置 `@midwayjs/validate`（基于 Joi），Controller 用 `@Body()` 绑定后自动校验，失败抛 3001。

## 7. 配置与环境

### 7.1 后端配置（Midway 多环境）

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
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'wudong',
        synchronize: true,          // 开发期自动建表；生产 false + migration
        logging: false,
        entities: ['**/entity/*.{ts,js}'],
      },
    },
  },
  redis: {
    client: {
      port: 6379,
      host: '127.0.0.1',
      db: 0,
    },
  },
  oss: {
    region: process.env.OSS_REGION,
    bucket: process.env.OSS_BUCKET,
    accessKeyId: process.env.OSS_AK,
    accessKeySecret: process.env.OSS_SK,
  },
  wechat: {
    appId: process.env.WX_APPID,
    appSecret: process.env.WX_SECRET,
    mchId: process.env.WX_MCHID,
    apiV3Key: process.env.WX_APIV3_KEY,
    privateKeyPath: process.env.WX_PRIVATE_KEY,
    notifyUrl: 'https://域名/api/pay/notify/wechat',
  },
  amap: {
    key: process.env.AMAP_KEY,
  },
} as MidwayConfig;
```

- 环境切换：`config.local.ts` / `config.prod.ts` 覆盖，`NODE_ENV=production` 生效。
- 密钥一律走环境变量，`config.prod.ts` 里 `synchronize: false`。

### 7.2 Docker Compose（Node 版）

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: wudong
    ports: ["3306:3306"]
    volumes: ["./data/mysql:/var/lib/mysql"]
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
  server:
    build:
      context: ./wudong-server
      dockerfile: Dockerfile
    environment:
      DB_HOST: mysql
      DB_PORT: "3306"
      NODE_ENV: production
    depends_on: [mysql, redis]
    ports: ["7001:7001"]
  nginx:
    image: nginx:1.25
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf", "./dist/web:/usr/share/nginx/html"]
    depends_on: [server]
    ports: ["80:80", "443:443"]
```

```dockerfile
# wudong-server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 7001
CMD ["node", "dist/bootstrap.js"]
```

## 8. 部署方案

- 单台云服务器（2C4G 起步）+ Docker Compose 编排：MySQL 8 + Redis 7 + wudong-server + Nginx。
- Nginx 托管三端静态资源：`/`（PC web）、`/admin`（Cool Admin Vue 构建产物）、`/h5`（uni-app H5）；`/api`、`/admin/api` 反代到 `server:7001`。
- 域名 + ICP 备案 + HTTPS（Let's Encrypt / 云厂商证书）；OSS 独立域名做静态资源 + 图片 CDN。
- 环境变量由 `.env` 注入；迁移用 `pnpm migration:run`（生产 `synchronize: false`）。

## 9. 测试策略

- 单元测试：Jest（Midway 官方 `@midwayjs/jest` 脚手架），覆盖状态机 `canTransit`、金额/分转换、购物车逻辑、库存扣减 SQL 条件。
- 接口测试：SuperTest 调 Controller，重点覆盖支付回调幂等（重复回调）、退款、库存不足。
- 联调冒烟：本地 Docker 起 MySQL/Redis → 建表 → 造种子数据 → 走通「登录→浏览→下单→支付(mock)→回调→评价」主链路。
- 前端：uni-app 用 HBuilderX 内置调试，PC/admin 用 Vitest 关键组件。

## 10. 里程碑（建议 8 周，6 组并行）

| 阶段 | 周期 | 交付物 |
|---|---|---|
| P0 公共基础层 | 第 1-2 周 | Verdaccio 私有源、@wudong/common（实体/错误码/工具）、wudong-server 骨架、MySQL/Redis Docker、登录鉴权、OSS 上传 |
| P1 五模块业务 | 第 3-6 周 | 衣/食/住/行/社区各模块 CRUD + 收藏/评价 + 后台 CRUD |
| P2 订单支付闭环 | 第 4-7 周 | 统一订单中心、5 类型下单、微信支付(mock)、退款、电子票 |
| P3 三端联调 | 第 6-8 周 | uni-app 小程序、PC web、Cool Admin 后台打通 |
| P4 集成验收 | 第 8 周 | 部署上线、按需求 13.x 验收、提交 DDL/演示 |

> 六个小组建议分工：公共/订单支付 1 组，衣/食/住/行/社区各 1 组。P0 未冻结前各模块先按契约 mock 数据。

## 11. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| 团队首次接触 Midway/Cool Admin，上手慢 | 进度 | §0.3 学习清单先行；P0 用 2 周消化；先单仓库跑通再拆包 |
| Cool Admin 外部模块加载机制与设想不符 | 架构 | 以官方文档为准；兜底改单仓库多目录（不拆 npm 包） |
| 微信支付/登录 sandbox 申请受限 | 支付闭环 | 保留 mock 适配层，接口签名不变，可切换 |
| TypeORM synchronize 与 DDL 不一致 | 验收 | 以本文档 DDL 为准，生产关 synchronize 用 migration |
| 库存/房态并发超卖 | 业务 | 条件 UPDATE 乐观扣减 + 唯一约束（房态 uk_room_date） |
| 多组并行接口契约漂移 | 联调 | @wudong/common 统一 DTO/错误码；定期对齐契约 |

## 12. 附录

### 12.1 技术栈清单

| 层 | 选型 | 说明 |
|---|---|---|
| 后端框架 | Midway.js 3.x（Node 18 / TS 5） | 阿里系企业级 Node 框架，装饰器/IoC |
| 管理后台后端 | Cool Admin Midway | 基于 Midway 的 RBAC/CRUD 后台基座 |
| 管理后台前端 | Cool Admin Vue（Vue3 + Element Plus） | 开箱即用的后台前端 |
| ORM | TypeORM | 实体映射、synchronize、migration |
| 数据库 | MySQL 8 | 关系数据 |
| 缓存 | Redis 7 | 购物车、验证码、token、热点 |
| 小程序 | uni-app（Vue3 + Vite） | 一套代码多端 |
| PC 前端 | Vue3 + Vite + Element Plus | 官网/商城 |
| 私有 npm | Verdaccio | 多仓库公共包分发 |
| 部署 | Docker + Nginx + 云服务器 | 单机部署 |

### 12.2 学习资料

- Midway.js 官方文档：https://midwayjs.org/docs/intro
- Cool Admin Midway：https://cool-js.com （后端）
- Cool Admin Vue：https://vue.cool-admin.com （后台前端）
- TypeORM 官方文档：https://typeorm.io
- uni-app 官方文档：https://uniapp.dcloud.net.cn

### 12.3 外部模块加载（待验证项）

Cool Admin 官方是否支持将业务模块作为独立 npm 包动态加载（`configuration.ts` 里 `importConfigs` 引入外部包 entity/controller）——**需对照官方文档核实**。若支持：维持 §2 多仓库 npm 包方案；若不支持：退化为**单仓库多目录**（`wudong-server/src/modules/{clothing,food,housing,travel,community,admin}`），公共代码放 `src/common`，取消 Verdaccio，其余设计不变。此为唯一需团队二次确认的技术点。

### 12.4 变更记录

| 版本 | 日期 | 变更 |
|---|---|---|
| V1.0 | 2026-09-08 | 初版（Spring Boot 架构） |
| V2.0 | 2026-09-08 | Spring Boot 详细设计（Nexus + Flyway + Maven 多模块） |
| V3.0 | 2026-09-08 | 全面切换 Midway.js + Cool Admin；收藏/评价按需求文档每模块分表；Nexus→Verdaccio；Flyway→TypeORM synchronize/migration |

---

（全文完）




