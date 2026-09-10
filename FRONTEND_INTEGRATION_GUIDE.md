# 游记呈现完整指南 - 前后端集成

## 后端状态确认

✅ 后端接口正常工作：
- 游记信息流返回数据正确
- 共有 10 条游记
- 数据格式符合预期

## 游记呈现流程

### 第一步：获取信息流数据

**请求**：
```
POST /app/notePost/feed
Body: {
  "sort": "latest",  // or "hot"
  "page": 1,
  "size": 10
}
```

**响应格式**：
```json
{
  "code": 1000,
  "data": {
    "list": [
      {
        "id": 10,
        "title": "游记标题",
        "content": "游记内容...",
        "cover": "图片URL或Base64",
        "userId": 1,
        "likeCount": 5,
        "commentCount": 2,
        "favoriteCount": 1,
        "viewCount": 100,
        "createTime": "2026-09-10 16:06:34",
        "status": 1
      }
    ],
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 10
    }
  }
}
```

### 第二步：前端渲染逻辑

**需要实现的组件**：

1. **游记卡片组件** - 显示单条游记
   - 标题
   - 封面图片
   - 作者信息
   - 点赞数、评论数、收藏数
   - 发布时间

2. **信息流列表** - 瀑布流或网格布局
   - 双列网格布局（推荐）
   - 无限滚动分页
   - 加载状态处理

3. **交互按钮**
   - 点赞按钮（调用 `/app/notePost/like/toggle`）
   - 评论按钮（跳转到详情页）
   - 收藏按钮（调用公共收藏接口）
   - 分享按钮

### 第三步：详情页呈现

**请求**：
```
POST /app/notePost/detail
Body: { "id": 10 }
```

**响应包含**：
- 完整游记内容
- 图片列表（排序后）
- 话题列表
- 关联地点
- 点赞/收藏状态
- 评论列表（需二次请求）

### 第四步：评论展示

**请求**：
```
POST /app/noteComment/list
Body: { "postId": 10, "page": 1, "size": 15 }
```

**响应**：
```json
{
  "list": [
    {
      "id": 5,
      "content": "评论内容",
      "userId": 1,
      "likeCount": 2,
      "status": 1,
      "createTime": "2026-09-10 15:33:48"
    }
  ],
  "pagination": { ... }
}
```

## 常见问题与解决

### Q1: 游记显示但封面是乱码/Base64

**原因**：图片URL 格式问题或 Base64 编码

**解决**：
- 确保 cover 字段有值
- 如果是 Base64，确保格式正确：`data:image/jpeg;base64,/9j/4QD0...`
- 如果是 URL，确保前端能访问该 URL

### Q2: 中文标题/内容显示为 ??????

**原因**：数据库字符集问题（后端已修复 collation 设置）

**验证**：
```sql
SELECT CHARACTER_SET_NAME, COLLATION_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME='note_post' AND COLUMN_NAME='title';
```

### Q3: 点赞数不更新

**原因**：前端没有调用点赞 API 或缓存问题

**确认**：
- 点赞时调用 `/app/notePost/like/toggle`
- 返回后刷新游记详情重新获取 likeCount
- 或在前端直接修改计数

### Q4: 评论无法显示

**原因**：评论列表接口需要传正确的 postId

**确认**：
```bash
# 确认接口返回评论
POST /app/noteComment/list
Body: {"postId":10,"page":1,"size":15}
```

## 前端集成检查清单

- [ ] 安装依赖（图片懒加载库、虚拟滚动等）
- [ ] 实现信息流列表组件
- [ ] 实现游记卡片组件
- [ ] 实现点赞/评论/收藏交互
- [ ] 实现详情页路由
- [ ] 实现评论列表展示
- [ ] 处理加载中/错误状态
- [ ] 添加分页/无限滚动
- [ ] 测试中文字符显示
- [ ] 测试图片加载

## 数据流示意图

```
用户打开社区首页
    ↓
GET /app/notePost/feed (sort=latest, page=1)
    ↓
返回 10 条游记列表
    ↓
前端渲染双列卡片网格
    ↓
用户点击某个卡片
    ↓
GET /app/notePost/detail (id=10)
    ↓
返回详情 + 获取评论列表
    ↓
GET /app/noteComment/list (postId=10)
    ↓
显示详情页和评论
    ↓
用户可以点赞/评论/收藏
    ↓
POST /app/notePost/like/toggle (targetType=POST, targetId=10)
    ↓
返回点赞状态，前端更新计数
```

## 后端 API 完整清单

| 功能 | 方法 | 端点 | 认证 | 响应 |
|------|------|------|------|------|
| 信息流 | POST | /app/notePost/feed | ✗ | list, pagination |
| 详情 | POST | /app/notePost/detail | ✗ | post data |
| 发布 | POST | /app/notePost/publish | ✓ | post id |
| 删除 | POST | /app/notePost/delete | ✓ | ok |
| 点赞 | POST | /app/notePost/like/toggle | ✓ | liked status |
| 评论列表 | POST | /app/noteComment/list | ✗ | comments, pagination |
| 发表评论 | POST | /app/noteComment/create | ✓ | comment id |
| 话题列表 | POST | /app/noteTopic/list | ✗ | topics, pagination |
| 话题详情 | POST | /app/noteTopic/detail | ✗ | topic data |
| 关注话题 | POST | /app/noteTopic/follow | ✓ | followed status |
| 关注用户 | POST | /app/noteFollow/toggle | ✓ | followed status |
| 举报 | POST | /app/noteReport/create | ✓ | ok |

