# 乌东文旅"衣食住行"综合服务平台

贵州黔东南乌东村文旅综合服务平台，覆盖**衣（非遗商品）、食（餐饮美食）、住（住宿预订）、行（线路订票）、社区（照片分享）、平台管理** 6 大模块，为游客提供一站式线上服务，为商家提供运营后台，为平台提供全局管理能力。

## 技术栈

| 层次 | 技术 |
|------|------|
| 后端 | Midway（Node.js + TypeScript）+ TypeORM + JWT + bcrypt |
| 前端 PC 端 | Vue 3 + Vite + Element Plus + Pinia + Vue Router |
| 管理后台 | Vue 3 + Vite + Element Plus |
| 数据库 | MySQL 8.0 + Redis 7 |
| 部署 | Docker + Docker Compose + GitHub Actions（CI/CD） |
| AI 协作 | Claude Code + 项目级 Skills |

## 目录结构

```
wudong-platform/
├── docs/          # 全部课程文档产出（架构设计、需求拆解、部署文档等）
├── server/        # Midway 后端服务（6 个模块 + 公共能力，模块化单体）
├── web/           # Vue 3 PC 网页端（游客端）
├── admin/         # Vue 3 管理后台（平台管理员 + 商家）
├── skills/        # 专业 Skill 说明
├── sql/           # 数据库脚本（DDL + DML）
├── deploy/        # Docker 部署方案（Dockerfile、docker-compose、CI/CD）
├── ppt/           # 路演 PPT 与答辩材料
└── .claude/       # Claude Code 项目级配置与 Skills
```

## 快速启动

### 1. 数据库

```bash
# 本机 MySQL 8.0：使用 sql/01-ddl.sql 与 sql/02-dml.sql 建库
mysql -uroot -p < sql/01-ddl.sql
mysql -uroot -p < sql/02-dml.sql
```

### 2. 后端

```bash
cd server
npm install
cp .env.example .env   # 修改数据库连接配置
npm run dev            # http://localhost:7001
```

Swagger 接口文档：http://localhost:7001/swagger-ui

### 3. PC 前端

```bash
cd web
npm install
npm run dev            # http://localhost:5173
```

### 4. 管理后台

```bash
cd admin
npm install
npm run dev            # http://localhost:5174
```

### 5. Docker 一键部署

```bash
cd deploy
docker compose up -d
```

## 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 平台管理员 | admin | admin123 |
| 游客用户 | 13800000001 | user123 |
| 商家（衣） | merchant1 | merchant123 |
| 商家（食） | merchant2 | merchant123 |
| 商家（住） | merchant3 | merchant123 |
| 商家（行） | merchant4 | merchant123 |

## 模块分工（组内）

| 模块 | 负责人 | 说明 |
|------|--------|------|
| 全部 6 模块 + 公共能力 | 唐晶 | 需求书要求每组独立完成完整系统，本仓库为完整交付 |

## 文档索引

见 `docs/` 目录，包含 6 天课程全部产出：

- 项目分组方案与模块认领
- AI 开发环境检查表
- 需求拆解成果
- 项目架构设计文档
- 需求澄清文档
- 开发计划与联调记录
- Redis 缓存优化证据
- Docker 部署方案与 CI/CD 流水线记录
- 测试与验收证据
- 数据库设计文档
- 接口文档、部署文档、测试报告、用户手册
- 项目总结、个人实践报告、答辩记录、演示视频脚本
