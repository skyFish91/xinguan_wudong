---
name: wudong-dev-runbook
description: 乌东文旅平台（Wudong）本地开发与接口联调手册。当需要启动本项目、排查前后端接口对不上（含路由缺失与 body 字段名不匹配导致的静默失效）、处理 401/403、验证页面能否渲染、或定位「前端调了后端没有」的缺口时使用。触发词：乌东、wudong、社区、衣食住行模块联调、接口 401、接口 404、接口返回 200 但没生效、页面白屏、vite 报错、启动前端、接口差集。
agent_created: true
---

# 乌东文旅平台 本地联调手册

## 一、仓库真相：哪些目录才是「在用的」

仓库根目录有 13+ 个顶层目录，绝大多数是历史遗留，**不要碰、不要基于它们改**：

| 目录 | 状态 | 说明 |
|---|---|---|
| `server/` | ✅ 使用中 | 统一后端（Midway.js v4 + TypeORM），端口 **7001** |
| `qianduan0/web/` | ✅ 使用中 | **C 端唯一正确版本**，端口 **5173** |
| `admin/` | ✅ 使用中 | 管理后台（平台管理员 + 商家两套视图），端口 **5174** |
| `sql/` | ✅ 使用中 | `01-ddl.sql` / `02-dml.sql` / `03-community-seed.sql` |
| `web/` | ❌ 半迁移 | `api/request.js` 的 baseURL 为空、代理指向 8001、router 会解析到 `index.js` 而非 `index.ts`。**别用** |
| `web-pc/`、`qianduan0/admin/` | ❌ 未装依赖 | 未使用 |
| `wudong-server/`、`wudong-web/`、`cool-admin-midway/`、`cool-admin-vue/`、`food-module/`、`住模块/` | ❌ 遗留 | 早期独立版本，内容已并入统一版 |

判断某个目录是否"服役"的快速方法：看它的 `package.json` 里 `dev` 脚本端口 + 它的 `vite.config` 代理 `target` 是否指向 7001。

## 二、启动（三个终端）

```bash
# 1. 后端（必须先起）
cd D:/xinguan_wudong/server && npm run dev                 # → 7001

# 2. C 端
cd D:/xinguan_wudong/qianduan0/web && npm run dev           # → 5173

# 3. 管理后台
cd D:/xinguan_wudong/admin && npm run dev                   # → 5174
```

依赖：MySQL `127.0.0.1:3306`（库 `wudong`，root/`ws764766`）、Redis `6379`。

## 三、测试账号

| 角色 | 账号 | 密码 |
|---|---|---|
| 平台管理员 | `13800000000` | `admin123` |
| 演示用户 | `13800000001` | `user123` |
| 联调用户 | `13800001111` | `test123456` |
| 商家（衣/食/住/行） | `13800000002` ~ `13800000005` | `merchant123` |

短信验证码在开发模式固定为 **`123456`**。

## 四、本机环境的三个坑（必读）

1. **有系统代理 `http_proxy`（127.0.0.1:64988）**。用 curl 测本地服务**必须加 `--noproxy '*'`**，否则请求会被代理截胡，报莫名的连接错误。
2. **curl 的 `-F` 传文件在本机 Git Bash 下会失败（HTTP 000）**。测上传改用 Node：

```bash
"C:/Users/DZG/.workbuddy/binaries/node/versions/22.22.2-2/node.exe" -e "
(async()=>{
  const fd = new FormData();
  fd.append('file', new Blob([Buffer.from('89504e470d0a1a0a','hex')],{type:'image/png'}), 't.png');
  const r = await fetch('http://127.0.0.1:7001/api/upload/file',{method:'POST',headers:{Authorization:'Bearer TOKEN'},body:fd});
  console.log(r.status, await r.text());
})()"
```

3. **Node 的 `fetch` 也走系统代理，且不吃 curl 的 `--noproxy`**。写 Node 脚本测本地接口时，
   要么在命令行前加 `NO_PROXY='*' no_proxy='*'`，要么脚本内显式绕代理。
   否则会报 `fetch failed` / `ECONNREFUSED` 这类看似服务挂了的错。

## 五、没有浏览器时怎么验证前端

**让 Vite 即时编译指定模块**——有编译错误它会返回 500 或错误文本：

```bash
# 单模块
curl -s --noproxy '*' -o /tmp/o.txt -w "%{http_code}\n" http://localhost:5173/src/views/community/Feed.vue
grep -q "Internal server error\|Transform failed\|SyntaxError" /tmp/o.txt && echo "有错"

# 批量扫整个目录
cd D:/xinguan_wudong/qianduan0/web
for f in $(find src/views -name "*.vue"); do
  echo -n "$f -> "
  curl -s --noproxy '*' -m 25 -o /tmp/c.txt -w "%{http_code}" "http://localhost:5173/$f"
  grep -q "Internal server error\|Transform failed" /tmp/c.txt && echo "  ⚠ 有错" || echo
done
```

端到端接口测试用 Node 的 `fetch`（可直接带 Token），比 curl 更省事。

## 六、核心排查法：前后端接口缺口求差集

本项目最容易出、也最耗时的故障是**前端移植自 Cool-Admin，按 `/app/noteXxx/*`、`POST` 风格调用，而后端是 RESTful `/api/xxx/*`**。

**首选：直接跑脚本**（已内置，比手搓 grep 可靠，能处理 `:id` 参数与 `${}` 模板）：

```bash
cd D:/xinguan_wudong
NODE="C:/Users/DZG/.workbuddy/binaries/node/versions/22.22.2-2/node.exe"
$NODE scripts/route-diff.mjs . qianduan0/web/src   # C 端
$NODE scripts/route-diff.mjs . admin/src           # 管理后台
```

输出「缺失 N 条」即前端调了后端不存在的接口。
⚠️ **模板字符串动态路径是误报**（如 `` `/admin/${kind}s/${row.id}/toggle` `` 会被归一成 `:p`），需人工按运行时实际取值核对。

修法优先级：
   a) 能只改 api 层做适配（路径改写 + 响应归一 + 字段别名），就别动页面
   b) 后端确实缺的能力，再补接口（比页面改 10 处风险小）
   c) 只是**命名不一致**时，优先在后端加**别名路由**兼容两边，前端零改动、老调用方也不受影响

### 比 404 更危险的：body 字段名不匹配（静默失效）

求差集只能发现**路由**缺失，发现不了**字段名**对不上。后端用 `@Body('pass')` 这种「只取一个键」的写法时，前端传 `{approve:true}` 不会报错——`pass` 就是 `undefined`，`!!undefined === false`，于是**审核操作结果永远颠倒、下架永远不生效，但接口返回 200**。排查这类问题必须**对比 body 字段名 + 回读数据库确认副作用**。

已在 `community.admin.ts` / `admin.module.ts` 踩过 4 处（2 处 404 + 2 处静默失效）：`/posts/:id/hot`、`/keywords/:id/delete`、`audit` 的 `pass`/`approve`、`handle` 的 `takeDown`/`accept`。

诊断套路：读 controller 的 `@Body('xxx')` 键名 ↔ 读前端 `-d '{...}'` 的键名，不一致就是 bug。修法是改成 `@Body() body: any` 后 `body.pass !== undefined ? body.pass : body.approve` 双兼容。

### 路由前缀：所有模块必须是 `/api/xxx`

AI 模块曾写成 `@Controller('/ai')`，看着无害，实际两处失灵：
`auth.guard` 的放行规则按 `/api/ai/*` 匹配（永远匹配不上），前端 vite 也只代理 `/api`。

新建 controller 时前缀一律带 `/api`，改完顺手确认 `auth.guard.ts` 里的规则用的是同一个串。

> ⚠️ 早期版 `scripts/route-diff.mjs` 归一化时会剥掉 `/api`，正好把这类差异掩盖成"通过"。
> 现已修正（前端路径按 baseURL 补回前缀再精确比对）。**如果某次差集结果意外地全绿，值得怀疑脚本本身**。

**判断响应形态的小抄**（同一模块内也可能不一致，必须实测）：

- 返回**裸数组**：`/api/community/topics`、`/api/community/posts/:id/comments`、`/api/upload/file`、`/api/travel/scenics`
- 返回 `{list,total,page,pageSize}`：`/api/community/posts`、`/api/community/search`
- 返回**单对象**：`/api/community/posts/:id`、`/api/community/users/:id`

**交易链路的两个易错点**（都已实测确认，C 端写法是正确的）：

- `POST /api/cart/checkout` 返回的是**订单数组**（按商家拆单），不是单个订单对象。
  C 端取 `orders[0].id` 跳支付页。别按 `{orderId}` 去解析。
- `POST /api/pay/create`、`POST /api/pay/mock-scan` 的参数走 **Query 不是 body**：
  `/pay/create?orderId=1`、`/pay/mock-scan?payNo=PAYxxx`。用 body 传会拿到 undefined。
- `GET /api/cart` 返回裸数组；`GET /api/orders` 返回 `{list,...}`。

**两套语义必须都处理**：后端 HTTP 状态码（401/403）与响应体 `code`（1001 未登录等）是两码事，前端拦截器两个都要判，否则会出现「token 过期但永远清不掉、每个页面刷 401」的死循环。

## 七、鉴权（`server/src/middleware/auth.guard.ts`）

放行规则有两层，改之前先看现状：

- **公开**：`/api/home`，`/api/ai/*`
- **公开的 GET**：衣食住行 + 社区 + 搜索（游客可浏览列表与详情）
- **例外**：`/api/travel/my-etickets` 等个人数据必须登录
- **非 GET 的 `/api/travel/*`**：仅商家 / 管理员
- **`/api/merchant/*`**：需登录，具体角色由 controller 内 `mustMerchant()` 校验
- **`/api/auth/*` 白名单**只放 login/register/sms-code/refresh；`profile`、`password` 要登录

> ⚠️ 命名陷阱：`*.admin.ts` 里 `@Controller('/api/merchant/xxx')` 的是**商家后台**（商家域），`@Controller('/api/<模块>/admin')` 才是运营域管理员接口。商家登录后台时仪表盘必须走 `/api/merchant/<模块>/stats`，走管理员域会被拦成 403、页面整片空白。

**商家仪表盘取数链路**（任一环断了就是"暂无统计数据"，已验证可用）：

```
登录 POST /api/auth/login  →  accessToken
    ↓ Login.vue 立刻用 profile 覆盖 userInfo
GET /api/auth/profile      →  { role:'merchant', merchant:{ id, shopName, moduleType } }
    ↓ store: userInfo.merchant.moduleType
GET /api/merchant/<moduleType>/stats
```

`moduleType` 取值 `clothing|food|hotel|travel`，与 `13800000002~05` 四商家一一对应。
注意登录响应**没有** `userInfo` 字段（只有 `accessToken`/`refreshToken`/`expiresIn`），
userInfo 实际来自紧随其后的 `/auth/profile`。

> 🚫 **改了代码却测不出效果时，先怀疑「测试的是旧实例」**。两种情形：
> 1. **旧进程占端口**：`netstat -ano | grep ":7001" | grep LISTEN` 找到 PID，确认是旧 node 后 `taskkill //PID <pid> //F`，再启动。
> 2. **热重载漏事件**（Windows 上偶发）：`midway dev` 监听到 A 文件改动并重启了，但同一批里的 B 文件改动被吞掉。表现是「同批改的两个文件，一个生效一个仍 404」。此时 `touch server/src/module/xxx.ts` 强制再触发一次即可（touch 瞬间连接会中断，属正常，等几秒重试）。
>
> 判定是否已重载的快速方法：**调一个本次新增的路由**，404 就是没加载。

## 七点五、验证「推送到底成功没有」

**不要**只看 `git status` 的「领先 N 个提交」或 `git log origin/main` ——
本地 `refs/remotes/origin/main` 可能与真实远程不同步（IDE 后台集成、`update-ref` 被环境拦截等都会造成），
会显示成"领先 87"这种吓人数字，而实际早已推送成功。

**以远程为准的两种权威验证**：

```bash
# ① 远程真实指向（最权威）
git ls-remote origin main

# ② 拉到 FETCH_HEAD 再看内容/文件，绕开本地 ref
git fetch origin main
git log --oneline -3 FETCH_HEAD
git cat-file -e FETCH_HEAD:scripts/smoke-order.mjs && echo "文件已在远程"
```

若确认本地 ref 陈旧，可用 `git update-ref` 修正；
**若不生效**（沙箱环境常见），直接改 `.git/packed-refs` 里对应那一行即可
（`refs/remotes/origin/main` 通常存在 packed-refs 而非 loose ref 文件）。

> 💡 推送前顺手确认一下有没有把 `.env` 传上去：
> `git ls-files | grep -E "(^|/)\.env$"`，列出真身（非 `.example`）就危险了。
> 本项目 `server/.env` 未被跟踪，安全。

## 八、修完必做的验证

```bash
# ① 后端编译
cd D:/xinguan_wudong/server && npx tsc --noEmit

# ② C 端类型 + 构建（含 vue-tsc）
cd D:/xinguan_wudong/qianduan0/web && npm run build

# ③ 管理后台类型 + 构建
cd D:/xinguan_wudong/admin && npm run build

# ④ 接口差集（改完 controller / api 层后必跑）
cd D:/xinguan_wudong && node scripts/route-diff.mjs . qianduan0/web/src && node scripts/route-diff.mjs . admin/src

# ⑤ 核心业务链路端到端冒烟（改完交易/支付相关代码后跑）
cd D:/xinguan_wudong && node scripts/smoke-order.mjs
```

`smoke-order.mjs` 会跑通 **登录 → 取商品 → 加购 → 结算下单 → 创建支付 → 模拟扫码 → 查支付状态**，
逐步打印状态码与响应，断在哪一环一目了然。默认用 `13800000001/user123`，
可用 `SMOKE_PHONE` / `SMOKE_PWD` 覆盖。
⚠️ 会真实创建订单，跑完记得把待支付订单取消掉（脚本里加购的商品会被结算清掉）。
本机跑需要绕过代理：命令行前加 `NO_PROXY='*' no_proxy='*'`（Node 的 fetch 不认 curl 的 `--noproxy`）。

> ⚠️ **`npm run build` 可能在最后一步失败，但不是代码问题**：Vite 会先 `emptyDir` 清空 `dist`，
> 本机 sandbox 的 safe-delete 走 `genie-trash` 二进制，**经常 ETIMEDOUT**。
> 报错形如 `[safe-delete] 操作失败: spawnSync ... genie-trash\win32-x64.exe ETIMEDOUT`。
> **判据**：只要日志里已经出现 `✓ N modules transformed`，说明编译没问题。
> **解法**：先把旧产物改名再构建（`mv dist dist_bak_$(date +%s)`），此时无目录可清空就不会卡。```

然后经 **5173 代理**（而不是直连 7001）再测一遍接口——代理链路本身也是常出错的一环。

---

## 八、视觉验收：不装 agent-browser 也能截图

`agent-browser` 在本机没装（要下 ~500MB Chromium，且走代理易超时）。
**本机已有 Chrome**，用无头模式直接截图，几秒出结果，是改样式后的首选验收手段：

```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
# Edge 备选："/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

"$CHROME" --headless=new --disable-gpu --no-proxy-server --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1440,2600 --virtual-time-budget=9000 \
  --screenshot="D:/xinguan_wudong/.workbuddy/shots/home.png" "http://localhost:5173/"
```

参数要点：
- **`--no-proxy-server` 必加**。本机有 `http_proxy`，不加会被代理截胡导致白屏。
- `--window-size=宽,高`：**给多高就截多高**。给 `1440,6200` 相当于整页长图（能截到页脚）。
- `--virtual-time-budget=9000`：等待异步渲染 + 动画完成。SPA 数据靠接口回来，给 8~10 秒。
- `--force-device-scale-factor=2` + 小窗口 = **放大看细节**。

> **判断"文字发灰/发虚"这类疑似 bug，必须用 2x 放大复看。**
> 1440px 的截图被缩略查看时，15px 正文的抗锯齿会让它看起来像灰蓝色，
> 很容易误判成配色 bug —— 实际是查看端缩放的假象。

**截图前先确认路由对**：本项目景区页是 `/travel`（不是 `/travel/scenics`），
路由写错会得到一张只有背景渐变的"白屏"，看着像页面崩了其实只是没匹配到路由。
完整路由表：`qianduan0/web/src/router/index.ts`。

**本机 Git Bash 没有 `/tmp`**：`curl -o /tmp/x.txt` 会静默失败（报 `No such file or directory`），
后续 `grep` 读不到文件 → 把"没报错"误判成"编译通过"。
临时文件一律写到 `D:/xinguan_wudong/.workbuddy/tmp/`。

---

## 九、设计系统与图片清晰度规范（改 UI 前必读）

### 配色：只改 theme.css，不要散落硬编码

`qianduan0/web/src/styles/theme.css` 是**唯一配色开关**，在 `main.ts` 里于 element-plus
样式之后引入。29 个文件走 `var(--wd-brand)`，改令牌值即全站生效。

| 令牌 | 用途 | 不要用错 |
|---|---|---|
| `--wd-brand` / `-400` / `-600` … | 主色（靛蓝 `#22467e`）：导航、按钮、链接、选中态 | — |
| `--wd-accent` | 强调色（苗绣红 `#b93226`）：**仅**价格、促销角标、必填星号 | 别拿它当主色 |
| `--wd-silver-*` | 银饰冷调：描边、分隔线、头像底 | — |
| `--wd-brand-rgb` | 写 `rgba(var(--wd-brand-rgb), .24)` 用 | 别再硬编码 RGB |

需要 `rgba()` 时**必须**用 `--wd-brand-rgb`（改主色时只需改一处）。
状态色不受品牌色影响、应保留：`#1e7a45`/`#34a853`（成功/支付）、`#f56c6c`（错误）、
金色系（非遗传承人、商家标识）。
图上角标用语义类：`.wd-chip-brand`=促销（暖红）、`.wd-chip-indigo`=信息（地点/路线/已选）。

### 图片：大区域必须 ≥2048px

素材分辨率跨度 703~9500px，**低清图放大区域 = 页面"塑料感"的头号来源**，且缩略图里看不出来。

- 判据：**大区域 ≥2048px**（轮播 1192px 宽 × 2x 屏需 2384px）；**卡片缩略图 ≥800px 即可**
- 代码约束在 `qianduan0/web/src/utils/media.ts`：
  - `img()` / `imgList()` → 卡片缩略图
  - **`imgLarge()` / `imgListLarge()` → 大区域**（会过滤掉 <2048 的候选）
  - `PHOTO`（小图标位）与 `PHOTO_LARGE`（保证 ≥2048）**是两张表，别放错组**
- 体检脚本（纯 stdlib，不需要 Pillow；有低清图时 exit 1，可进 CI）：
  ```bash
  python scripts/img-size.py qianduan0/web/public/images --min 2048
  ```
- 大区域位置清单：首页轮播与活动图、`AuthShell` 左屏、各详情页主图（clothing/hotel/food/route/scenic）、
  `PostDetail` 相册、`Travel/Guides` 弹窗

### SVG 两个必踩的坑

1. **XML 注释里不能出现连续两个 ASCII 短横线**（`--`）。写 `----------------` 分隔线会让整个 SVG
   解析失败，Chrome 渲染成红底 "This page contains error"。用 `====` 或中文破折号 `——` 代替。
2. **`var()` 不能用在 SVG presentation attribute 上**：`<stop stop-color="var(--x)">` 无效。
   必须在 `style` 或 CSS 类里设 `fill`/`stroke`（见 `components/BrandMark.vue` 的 `.mk-fill`/`.mk-stroke`）。

### 品牌标志

`public/logo.svg`（favicon + 复用）+ `components/BrandMark.vue`（`tone`: `brand`/`light`/`mono`）。
母题为苗族三大符号：铜鼓太阳纹 + 蝴蝶妈妈 + 银饰银角。
`tone="light"` 用于深色或图片背景（白底靛蓝标），`tone="brand"` 用于浅色页面。

---

## 十、布局层与页面动效（改导航 / 切页动效前必读）

### 头部导航在 App.vue，不在页面里

历史上 25 个视图各自 `<TopNav />`，导致切页时导航跟着一起淡出重绘、看着闪。
现已把导航提到布局层：

```
src/App.vue
  ├── <RouteProgress />          ← 顶部 2px 进度条
  ├── <TopNav v-if="showNav" />  ← showNav 由 route.meta.bare 驱动
  └── <router-view v-slot> + <transition :name="animName" mode="out-in">
```

- **新增页面不要自己引 TopNav**，否则会出现两条导航
- `meta.bare: true` 的页面（`/login`、`/register`，整屏分屏）不渲染导航
- `meta.transition` 指定动画名，缺省 `wd-page`；登录注册用 `wd-auth`（缩放而非位移）
- 导航的显隐**刻意错开 140~200ms**（App.vue 里的 `navTimer`），跟着路由立刻切会与页面淡入撞在一起

切页动画定义在 `styles/theme.css` 的「10.1 路由切换动效」：
出场 0.16s、入场 0.3~0.4s；只动 `opacity`/`transform`，**不要加 `filter: blur()`**——
祖先元素一旦有 filter/transform 会成为 `position: fixed` 后代的包含块，且大面积模糊会拖慢低端机。
已带 `@media (prefers-reduced-motion: reduce)` 降级。

### 滚动行为

`router/index.ts` 的 `scrollBehavior`：前进后退还原位置；锚点留 88px 给吸顶导航；
**只有 query 变化时返回 `false`**（筛选/翻页不该跳回顶部）；其余回顶部（不做平滑滚动，会和 out-in 的淡出叠成"甩一下"的错觉）。

### 子页面返回条：`components/PageBack.vue`

19 个子级页面（详情页、购物车/订单/收银台、个人中心、社区子页）内容容器开头都有一行 `<PageBack />`。
零配置：组件自己从 `route.path` 推断上级层级（`TRAILS`）与末级文案（`CURRENT_BY_PATH`），
`goBack()` 有历史栈就 `router.back()`，直接打开链接时退到上级页。

> ⚠️ **通配规则必须排在具名规则之后**。踩过：`CURRENT_BY_PATH` 里
> `[/^\/community\/[^/]+$/, '游记详情']` 排在 `/community/topics` 之前，
> 于是"话题广场"页的面包屑显示成"游记详情"。兜底规则改成只认纯数字 `\/community\/\d+$`。

## 十一、批量改多个 .vue 文件的正确姿势

给 20+ 个文件做同样的机械改动时，**写脚本 + 先 `--dry-run` 再 `--apply`** 是对的，
但有个必踩的坑：

> **先 search 拿到 start/end，再改动字符串，然后拿旧下标去切片 → 下标错位。**
> 实际表现：`import TopNav from '../../components/TopNav.vue';`
> 被切成 `import TopNav fimport PageBack from '../../components/PageBack.vue';`
> （因为先删掉了上一行的 `<TopNav />`，后面的偏移全变了）

正确做法：**全程用 `re.sub(re, callback, s, count=1)`，不做任何手工下标运算**；
或者严格「先改后面的、再改前面的」。
改完必须 grep 校验（如 `grep -rn "TopNav" src/` 确认只剩 App.vue 一处），再跑构建。

## 十二、给"需要登录"的页面截图

`--headless` 没法点登录，但可以借 Vite 的 `public/` 目录同源注入 localStorage：

```bash
# 1) 拿 token
T=$(curl -s --noproxy '*' -X POST http://localhost:7001/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"phone":"13800000001","password":"user123"}' | sed -E 's/.*"accessToken":"([^"]+)".*/\1/')

# 2) 临时页（放进 qianduan0/web/public/_seed.html）
#    <script>
#      var p = new URLSearchParams(location.search);
#      localStorage.setItem('token', p.get('t')||'');
#      localStorage.setItem('userInfo','null');
#      location.replace(p.get('to')||'/');
#    </script>

# 3) 截图（同源 → localStorage 生效）
"$CHROME" --headless=new --no-proxy-server --virtual-time-budget=11000 \
  --screenshot="D:/xinguan_wudong/.workbuddy/shots2/pay.png" \
  "http://localhost:5173/_seed.html?t=${T}&to=/pay/203"
```

> 🚫 **`public/_seed.html` 用完必须删**，否则会被 `npm run build` 打进 `dist` 一起发布。
> token 也别留在磁盘上（临时文件写 `.workbuddy/tmp/`，用完 `rm`）。
> 截图受保护页面若需要造数据（如待支付订单），**跑完记得把订单取消掉**，别把测试订单留在演示库里。
