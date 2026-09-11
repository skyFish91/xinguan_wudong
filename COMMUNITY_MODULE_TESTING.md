# 社区板块功能测试指南

## 已实现的功能概览

### 前台接口（App）

#### 1. 游记管理（/app/notePost）
- ✓ `POST /publish` - 发布游记（含敏感词检测）
- ✓ `POST /feed` - 信息流（推荐/最新排序）
- ✓ `POST /detail` - 游记详情（含点赞/收藏状态）
- ✓ `POST /delete` - 删除游记
- ✓ `POST /like/toggle` - 点赞/取消点赞

#### 2. 评论管理（/app/noteComment）
- ✓ `POST /list` - 评论列表（按游记ID）
- ✓ `POST /create` - 发表评论
- ✓ `POST /delete` - 删除评论

#### 3. 话题管理（/app/noteTopic）
- ✓ `POST /list` - 话题列表
- ✓ `POST /detail` - 话题详情
- ✓ `POST /follow` - 关注/取关话题
- ✓ `POST /posts` - 话题下的游记列表

#### 4. 用户关注（/app/noteFollow）
- ✓ `POST /toggle` - 关注/取关用户
- ✓ `POST /following` - 关注列表
- ✓ `POST /followers` - 粉丝列表

#### 5. 举报管理（/app/noteReport）
- ✓ `POST /create` - 创建举报（游记/评论）

### 后台接口（Admin）

#### 游记审核（/app/notePost 或 admin/notePost）
- ✓ 审核通过 - `auditPass(id)`
- ✓ 审核拒绝 - `auditReject(id, reason)`
- ✓ 下架游记 - `offShelf(ids[])`

#### 举报处理（admin/noteReport）
- ✓ 举报列表 - `listReports(query)`
- ✓ 处理举报 - `handle(id, action, result)`
  - action: delete（删除内容）/ warn（警告用户）/ reject（驳回）

---

## 完整测试流程

### 环境准备

```bash
# 启动后端
cd cool-admin-midway
npm run dev

# 后端访问地址：http://127.0.0.1:8001
# 测试账号：13800138000 / 123456
```

### 测试用例

#### 用例1：发布游记 + 查看信息流

```bash
# 1. 登录获取 token
POST http://127.0.0.1:8001/app/user/login/password
Body: {"phone":"13800138000","password":"123456"}
Response: { data: { token: "..." } }

# 2. 发布游记
POST http://127.0.0.1:8001/app/notePost/publish
Header: Authorization: <token>
Body: {
  "title": "苗寨梯田之旅",
  "content": "美丽的风景吸引了我...",
  "images": [],
  "topicIds": [1, 2],
  "poiType": "SCENIC",
  "poiId": 1
}
Response: { data: { id: 8, status: 1 } }

# 3. 查看信息流（无需认证）
POST http://127.0.0.1:8001/app/notePost/feed
Body: {"sort":"latest","page":1,"size":10}
Response: { data: { list: [...], pagination: {...} } }

# 4. 查看游记详情（无需认证）
POST http://127.0.0.1:8001/app/notePost/detail
Body: {"id":8}
Response: { data: { id: 8, title: "...", liked: false, favorited: false } }
```

#### 用例2：评论互动

```bash
# 1. 发表评论
POST http://127.0.0.1:8001/app/noteComment/create
Header: Authorization: <token>
Body: {"postId":8,"content":"太美了！"}
Response: { data: { id: 5 } }

# 2. 查看评论列表
POST http://127.0.0.1:8001/app/noteComment/list
Header: Authorization: <token>（可选）
Body: {"postId":8,"page":1,"size":15}
Response: { 
  data: { 
    list: [
      { id: 5, content: "太美了！", userId: 1, likeCount: 0, status: 1 }
    ],
    pagination: { total: 1 }
  } 
}

# 3. 点赞游记
POST http://127.0.0.1:8001/app/notePost/like/toggle
Header: Authorization: <token>
Body: {"targetType":"POST","targetId":8}
Response: { data: { liked: true } }

# 4. 点赞评论
POST http://127.0.0.1:8001/app/notePost/like/toggle
Header: Authorization: <token>
Body: {"targetType":"COMMENT","targetId":5}
Response: { data: { liked: true } }
```

#### 用例3：话题与关注

```bash
# 1. 话题列表
POST http://127.0.0.1:8001/app/noteTopic/list
Body: {"page":1,"size":10}

# 2. 话题详情
POST http://127.0.0.1:8001/app/noteTopic/detail
Body: {"id":1}

# 3. 关注话题
POST http://127.0.0.1:8001/app/noteTopic/follow
Header: Authorization: <token>
Body: {"topicId":1}
Response: { data: { followed: true } }

# 4. 关注用户
POST http://127.0.0.1:8001/app/noteFollow/toggle
Header: Authorization: <token>
Body: {"userId":2}
Response: { data: { followed: true } }

# 5. 查看关注列表
POST http://127.0.0.1:8001/app/noteFollow/following
Header: Authorization: <token>
Body: {"page":1,"size":15}
```

#### 用例4：举报流程

```bash
# 1. 举报游记
POST http://127.0.0.1:8001/app/noteReport/create
Header: Authorization: <token>
Body: {
  "targetType": "POST",
  "targetId": 8,
  "reason": "内容不当"
}
Response: { data: {} }

# 2. 后台处理举报（需管理员权限）
POST http://127.0.0.1:admin/noteReport/handle
Header: Authorization: <admin_token>
Body: {
  "id": 1,
  "action": "delete",
  "result": "已下架违规内容"
}
```

---

## 已知问题与修复方案

### 问题1：中文字符显示为 ??????

**原因**：数据库连接字符集或表字符集设置问题

**修复方案**：
```sql
-- 检查表字符集
ALTER TABLE note_post CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE note_comment CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证数据库连接
-- 检查 src/config/config.local.ts 中的 collation 设置
collation: 'utf8mb4_unicode_ci'
```

### 问题2：认证状态在公开接口中丢失

**原因**：/feed 和 /detail 接口标记为 IGNORE_TOKEN，导致中间件不验证 token

**修复方案**：已在中间件中添加 token 验证逻辑，即使是公开接口也会尝试获取用户信息

---

## 数据验证检查清单

- [ ] 发布游记时敏感词检测有效
- [ ] 单用户每日游记数上限（10篇）生效
- [ ] 点赞重复被唯一索引拦截
- [ ] 二级评论正确嵌套显示
- [ ] 举报后台处理闭环完整
- [ ] 用户关注数、粉丝数正确更新
- [ ] 话题关注数正确更新
- [ ] 消息通知正确发送（点赞/评论/关注/举报）
- [ ] 游记浏览数正确增加
- [ ] 游记/评论点赞数正确计算

---

## 后续优化项

1. **搜索功能**：游记/话题/用户搜索
2. **用户主页**：个人游记网格、粉丝/关注统计
3. **消息中心**：点赞/评论/关注/举报消息聚合
4. **内容推荐**：热门话题、推荐游记算法
5. **短视频支持**：视频上传、视频流播放
6. **PC 瀑布流**：响应式双列卡片布局
7. **性能优化**：缓存热点数据、数据库查询优化

