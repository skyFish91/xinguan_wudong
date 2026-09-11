# AI 模块整合说明文档

## 📋 概述

AI 聊天功能已完成代码整合并推送到 GitHub，需要后端同学协助配置数据库权限以完成最后的部署。

---

## ✅ 已完成的工作

### 1. 代码整合
- **分支名称**: `ai-integration`
- **整合位置**: `server/src/module/ai/`
- **包含内容**:
  - AI 聊天控制器 (`ai.controller.ts`)
  - AI 服务层 (`ai.service.ts`)
  - 对话历史管理 (`conversation.service.ts`)
  - 数据库实体 (`ai_conversation.entity.ts`, `ai_message.entity.ts`)

### 2. 修复的问题
- ✅ TypeScript 编译错误已全部修复
- ✅ 路由冲突已解决（删除了 `travel_backup` 目录）
- ✅ 代码风格统一（使用 snake_case 数据库命名）

### 3. API 接口
- **POST** `/ai/chat` - AI 聊天接口
- **GET** `/ai/conversations` - 获取对话列表
- **GET** `/ai/conversations/:id/messages` - 获取对话消息历史
- **DELETE** `/ai/conversations/:id` - 删除对话

---

## ❌ 需要解决的问题

### 数据库权限配置

**问题现象**:
```
Error: Access denied for user 'root'@'172.18.0.1' (using password: YES)
```

**原因**: 
- 后端从宿主机（Windows）通过 Docker 网络连接 MySQL 容器
- MySQL 的 root 用户没有授权 `172.18.0.1`（Docker 网络地址）访问

**解决方案**:

#### 方法 1：授权 root 用户（推荐）

```bash
# 在命令行执行
docker exec mysql-wudong mysql -u root -p15715659594 -e "
CREATE USER IF NOT EXISTS 'root'@'172.18.0.1' IDENTIFIED WITH mysql_native_password BY '15715659594';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'172.18.0.1' WITH GRANT OPTION;
FLUSH PRIVILEGES;
"
```

#### 方法 2：创建专用用户

```bash
# 创建 wudong 用户
docker exec mysql-wudong mysql -u root -p15715659594 -e "
CREATE USER IF NOT EXISTS 'wudong'@'172.18.0.1' IDENTIFIED WITH mysql_native_password BY '15715659594';
GRANT ALL PRIVILEGES ON wudong.* TO 'wudong'@'172.18.0.1';
FLUSH PRIVILEGES;
"

# 然后修改 server/.env 文件
# DB_USER=wudong
```

#### 方法 3：重新创建 MySQL 容器（如果上述方法都不行）

```bash
# 停止并删除旧容器（注意：会丢失数据）
docker stop mysql-wudong
docker rm mysql-wudong

# 重新创建
docker run -d \
  --name mysql-wudong \
  -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=15715659594 \
  -e MYSQL_DATABASE=wudong \
  mysql:8.0 \
  --default-authentication-plugin=mysql_native_password

# 等待 5 秒让 MySQL 启动
sleep 5

# 测试连接
docker exec mysql-wudong mysql -u root -p15715659594 -e "SELECT 1;"
```

---

## 🚀 启动步骤

### 1. 拉取代码
```bash
cd C:\Users\Lenovo\xinguan_wudong
git checkout ai-integration
git pull origin ai-integration
```

### 2. 安装依赖（如果有新依赖）
```bash
cd server
npm install
```

### 3. 配置数据库权限
执行上面"解决方案"中的任一方法

### 4. 启动后端
```bash
cd server
npm run dev
```

**成功标志**: 
- 看到 `乌东文旅平台后端启动完成`
- 看到 Redis 连接成功
- 没有 MySQL 权限错误

### 5. 测试 AI 接口

**使用 curl 测试**:
```bash
curl -X POST http://localhost:7001/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"你好，请介绍一下乌东景点","conversationId":"test123"}'
```

**使用 Postman 测试**:
- URL: `http://localhost:7001/ai/chat`
- Method: `POST`
- Body (JSON):
```json
{
  "message": "你好，请介绍一下乌东景点",
  "conversationId": "test123"
}
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "message": "AI 的回复内容...",
    "conversationId": "test123",
    "messageId": "生成的消息ID"
  }
}
```

---

## 📦 数据库表结构

AI 模块会自动创建以下数据表：

### `ai_conversation` - 对话表
```sql
- id: 主键
- conversation_id: 对话唯一标识
- user_id: 用户ID（可选）
- title: 对话标题
- created_at: 创建时间
- updated_at: 更新时间
```

### `ai_message` - 消息表
```sql
- id: 主键
- conversation_id: 关联对话ID
- role: 角色（user/assistant）
- content: 消息内容
- created_at: 创建时间
```

---

## 🔧 配置文件

### `server/.env`
```env
# 后端环境变量
APP_KEYS=wudong-secret-key-2026
SERVER_PORT=7001
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=root
DB_PASSWORD=15715659594
DB_NAME=wudong
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=wudong-jwt-secret-2026
```

### `server/src/config/config.default.ts`
数据库配置会自动从环境变量读取，无需修改。

---

## 📝 前端调用示例

前端已经有 AI 聊天页面，后端启动后可以直接使用：

```typescript
// 前端调用示例
const response = await fetch('http://localhost:7001/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: '用户输入的消息',
    conversationId: 'conversation-id-123'
  })
});

const data = await response.json();
console.log(data.data.message); // AI 的回复
```

---

## ⚠️ 注意事项

1. **环境变量优先级**: 
   - 命令行传入的环境变量 > `.env` 文件
   - 如果 `.env` 不生效，可以用: `DB_USER=root npm run dev`

2. **Docker 网络地址**:
   - `172.18.0.1` 是 Docker 默认网络地址
   - 可能因环境不同而变化
   - 可以通过 `docker network inspect bridge` 查看

3. **Redis 依赖**:
   - 后端启动需要 Redis 运行
   - 确保 Redis 在 `127.0.0.1:6379` 可访问

4. **端口占用**:
   - 后端: `7001`
   - 数据库: `3307`
   - Redis: `6379`

---

## 🆘 常见问题

### Q1: 后端启动后 `http://localhost:7001` 打不开？
**A**: 这是正常的！后端是纯 API 服务器，不提供网页。需要用 Postman 或 curl 测试接口，或者启动前端项目访问。

### Q2: 如何启动前端？
**A**: 
```bash
cd qianduan0/web   # ⚠️ C 端在 qianduan0/web，根目录 web/ 已废弃
npm install
npm run dev
# 然后访问 http://localhost:5173
```

### Q3: AI 接口返回错误？
**A**: 检查：
1. `.env` 文件中的 `QIANWEN_API_KEY` 是否配置
2. 网络是否能访问通义千问 API
3. 查看后端日志获取详细错误信息

### Q4: 数据库连接失败？
**A**: 
1. 确认 MySQL 容器正在运行: `docker ps | grep mysql`
2. 确认密码正确: `15715659594`
3. 执行上面的权限配置命令

---

## 📞 联系方式

如有问题，请联系 AI 模块负责人。

**GitHub 分支**: `ai-integration`

**最后更新**: 2026-09-10
