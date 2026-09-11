# -*- coding: utf-8 -*-
"""
全路由渲染冒烟：逐条渲染前端路由，抽取正文文本量，判定是否白屏。

背景：本项目是 SPA，路由错误 / 组件异常只会在控制台报错，页面照样返回 HTTP 200。
      光看构建通过、或者只看几个页面截图，抓不到「某页白屏」这类结构性问题。
      这个脚本把每条路由真的跑一遍，用「渲染出的正文长度」当白屏探针。

用法（需先启动前端 dev server 与后端）：
    python scripts/smoke-routes.py

可选参数：
    --base http://localhost:5173   前端地址
    --chrome <path>                Chrome 可执行文件路径
    --token <jwt>                  指定登录态；不给则自动用测试账号登录取一个
    --min-text 150                 正文长度低于该值即判为疑似白屏

登录态：脚本会在 public/ 下临时生成 _seed.html 注入 localStorage 后跳转，
        跑完自动删除（try/finally 保证异常时也删）。无需手工准备。

退出码：0 全部正常；1 有页面疑似白屏。
"""
import argparse
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

DEFAULT_CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
DEFAULT_BASE = "http://localhost:5173"
API_BASE = "http://localhost:7001/api"
TEST_ACCOUNT = {"phone": "13800000001", "password": "user123"}

# 项目全部路由。新增页面后记得补一行，否则冒烟覆盖不到。
# 三元组形式 (名称, 路径, 阈值) 可单独放宽阈值——用于「正常但正文天然很短」的页面，
# 否则每次都会报成白屏，久了就没人看这个检查了。
ROUTES = [
    ("首页", "/"),
    ("登录", "/login"),
    ("注册", "/register"),
    # 衣 / 食 / 住 / 行
    ("非遗好物-列表", "/clothing"),
    ("非遗好物-详情", "/clothing/1"),
    ("苗乡美食", "/food"),
    ("餐厅详情", "/food/restaurant/1"),
    ("民宿列表", "/hotel"),
    ("民宿详情", "/hotel/1"),
    ("景区出行", "/travel"),
    ("精品路线", "/travel/routes"),
    ("路线详情", "/travel/routes/1"),
    ("出行攻略", "/travel/guides"),
    ("我的电子票", "/travel/my-etickets"),
    # 社区
    ("社区首页", "/community"),
    ("社区-关注流", "/community/feed"),
    ("话题详情", "/community/topic/1"),
    ("话题广场", "/community/topics"),
    ("游记详情", "/community/post/1"),
    ("发布游记", "/community/publish"),
    ("社区搜索", "/community/search"),
    ("用户主页", "/community/user/1"),
    # 交易 / 个人中心
    ("购物车", "/cart"),
    ("我的订单", "/orders"),
    # 传一个不属于该用户的订单号，正常就只渲染一句「该订单已支付」，正文必然很短
    ("收银台", "/pay/1", 80),
    ("个人中心", "/user"),
    ("商家入驻", "/user/apply-merchant"),
    # 兜底
    ("404 兜底", "/no-such-route-xyz"),
]
ROUTES = [(r[0], r[1], r[2] if len(r) > 2 else None) for r in ROUTES]

SEED_NAME = "_seed.html"
SEED_HTML = """<!doctype html>
<meta charset="utf-8" />
<title>seed</title>
<script>
  // 由 scripts/smoke-routes.py 临时生成，用于无头验收时注入登录态，跑完即删。
  var p = new URLSearchParams(location.search);
  localStorage.setItem('token', p.get('t') || '');
  localStorage.setItem('userInfo', JSON.stringify({ id: 2, nickname: 'wudong', phone: '13800000001', role: 'user' }));
  location.replace(p.get('to') || '/');
</script>
"""

STRIP = [
    (re.compile(r"<script[\s\S]*?</script>", re.I), " "),
    (re.compile(r"<style[\s\S]*?</style>", re.I), " "),
    (re.compile(r"<!--[\s\S]*?-->"), " "),
    (re.compile(r"<[^>]+>"), " "),
    (re.compile(r"&nbsp;"), " "),
]


def login(base_api: str) -> str:
    """用测试账号取一个 token；失败则返回空串（此时受保护页面会跳到登录页）。"""
    req = urllib.request.Request(
        f"{base_api}/auth/login",
        data=json.dumps(TEST_ACCOUNT).encode(),
        headers={"Content-Type": "application/json"},
    )
    # 本机走代理会导致本地请求被劫持，显式绕过
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with opener.open(req, timeout=8) as r:
            return json.loads(r.read().decode()).get("accessToken", "")
    except Exception as e:  # noqa: BLE001
        print(f"! 登录取 token 失败（{e}），受保护页面将按未登录渲染", file=sys.stderr)
        return ""


def text_of(html: str) -> str:
    for pat, rep in STRIP:
        html = pat.sub(rep, html)
    return re.sub(r"\s+", " ", html).strip()


def render(chrome: str, url: str) -> str:
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--no-proxy-server",  # 本机有 http_proxy，必须绕过
        "--hide-scrollbars",
        "--virtual-time-budget=7000",
        "--dump-dom",
        url,
    ]
    return subprocess.run(cmd, capture_output=True, timeout=60).stdout.decode("utf-8", "replace")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=DEFAULT_BASE)
    ap.add_argument("--chrome", default=DEFAULT_CHROME)
    ap.add_argument("--token", default="")
    ap.add_argument("--min-text", type=int, default=150)
    args = ap.parse_args()

    token = args.token or login(API_BASE)
    public_dir = Path(__file__).resolve().parent.parent / "qianduan0" / "web" / "public"
    seed = public_dir / SEED_NAME

    rows, bad = [], []
    try:
        if token:
            seed.write_text(SEED_HTML, encoding="utf-8")
            entry = f"{args.base}/{SEED_NAME}?t={token}&to="
        else:
            entry = f"{args.base}"
        for name, path, override in ROUTES:
            threshold = override if override is not None else args.min_text
            try:
                html = render(args.chrome, entry + path)
            except Exception as e:  # noqa: BLE001
                rows.append((name, path, -1, "渲染异常"))
                bad.append((name, path, f"渲染异常 {e}"))
                continue
            n = len(text_of(html))
            flag = "疑似白屏" if n < threshold else ""
            rows.append((name, path, n, flag))
            if flag:
                bad.append((name, path, flag))
    finally:
        seed.unlink(missing_ok=True)

    print(f"{'页面':<16}{'路径':<28}{'正文':>7}  判定")
    print("-" * 64)
    for name, path, n, flag in rows:
        print(f"{name:<16}{path:<28}{n:>7}  {flag}")

    print()
    if bad:
        print(f"❌ 异常 {len(bad)} 条：")
        for name, path, why in bad:
            print(f"   - {name} ({path}) -> {why}")
        return 1
    print(f"✅ 全部 {len(ROUTES)} 条路由渲染正常，无白屏")
    return 0


if __name__ == "__main__":
    sys.exit(main())
