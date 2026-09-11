/**
 * 核心业务流程端到端冒烟：登录 -> 加购 -> 结算下单 -> 支付 -> 查订单
 * 用法: node scripts/smoke-order.mjs
 * 只读探测 + 少量写操作（加购/下单），会打印每步结果，便于定位断在哪一环。
 */
const BASE = 'http://127.0.0.1:7001';
const PHONE = process.env.SMOKE_PHONE || '13800000001';
const PWD = process.env.SMOKE_PWD || 'user123';

let token = '';
const log = (...a) => console.log(...a);
const step = (n, t) => log(`\n[${n}] ${t}`);

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: res.status, json };
}

const ok = (s) => s >= 200 && s < 300;

(async () => {
  step(1, `登录 ${PHONE}`);
  let r = await call('POST', '/api/auth/login', { phone: PHONE, password: PWD });
  if (!ok(r.status) || !r.json?.accessToken) { log('  ✗ 登录失败', r.status, JSON.stringify(r.json).slice(0, 200)); return; }
  token = r.json.accessToken;
  log('  ✓ 登录成功，role=' + (JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).role));

  step(2, '取服饰商品列表，找一个可购 SKU');
  r = await call('GET', '/api/clothing/products?page=1&pageSize=3');
  if (!ok(r.status)) { log('  ✗ 商品列表失败', r.status, JSON.stringify(r.json).slice(0, 200)); return; }
  const list = r.json.list || r.json;
  log(`  ✓ 商品 ${list.length} 条：${list.map(p => p.id + ':' + (p.title || '').slice(0, 12)).join(' | ')}`);

  // 找 sku：优先详情里的 skus，其次试 skuId=商品首个
  let skuId = null;
  const pid = list[0]?.id;
  if (pid) {
    r = await call('GET', `/api/clothing/products/${pid}`);
    const d = r.json;
    if (ok(r.status)) {
      if (Array.isArray(d?.skus) && d.skus.length) skuId = d.skus[0].id;
      else if (Array.isArray(d?.skuList) && d.skuList.length) skuId = d.skuList[0].id;
      log('  商品详情字段:', Object.keys(d || {}).join(','));
      if (skuId) log('  ✓ 找到 skuId=' + skuId);
    }
  }
  if (skuId == null) {
    log('  ! 详情未给出 sku，尝试用首个 sku id 探测…');
    for (const guess of [1, 2, 3]) {
      const t = await call('POST', '/api/cart/add', { skuId: guess, quantity: 1 });
      if (ok(t.status)) { skuId = guess; log('  ✓ skuId=' + guess + ' 可加购'); break; }
    }
  }
  if (skuId == null) { log('  ✗ 无法确定可购 skuId，终止'); return; }

  step(3, `加入购物车 skuId=${skuId}`);
  r = await call('POST', '/api/cart/add', { skuId, quantity: 1 });
  if (!ok(r.status)) { log('  ✗ 加购失败', r.status, JSON.stringify(r.json).slice(0, 200)); return; }
  log('  ✓ 加购成功');

  step(4, '读取购物车');
  r = await call('GET', '/api/cart');
  if (!ok(r.status)) { log('  ✗ 读购物车失败', r.status, JSON.stringify(r.json).slice(0, 200)); return; }
  const items = Array.isArray(r.json) ? r.json : (r.json.list || []);
  log(`  ✓ 购物车 ${items.length} 项：${items.map(i => `#${i.id}(sku${i.skuId ?? '?'} x${i.quantity})`).join(' | ')}`);
  if (!items.length) { log('  ✗ 购物车为空，终止'); return; }
  const cartIds = items.map(i => i.id);

  step(5, '结算下单');
  r = await call('POST', '/api/cart/checkout', { cartIds });
  if (!ok(r.status)) { log('  ✗ 下单失败', r.status, JSON.stringify(r.json).slice(0, 300)); return; }
  const ord = r.json;
  log('  ✓ 下单返回:', JSON.stringify(ord).slice(0, 300));
  const orderId = ord?.orderId ?? ord?.id ?? ord?.data?.orderId;

  step(6, '订单列表');
  r = await call('GET', '/api/orders?page=1&pageSize=5');
  if (!ok(r.status)) { log('  ✗ 订单列表失败', r.status, JSON.stringify(r.json).slice(0, 200)); return; }
  const ol = r.json.list || r.json;
  log(`  ✓ 订单 ${ol.length} 条，最新:`, JSON.stringify(ol[0] || {}).slice(0, 220));

  // 注意：checkout 返回的是订单数组（按商家拆单），C 端期望数组并按 orders[0].id 跳支付页
  const ids = Array.isArray(ord) ? ord.map(o => o.id) : [];
  if (ids.length) {
    const oid = ids[0];
    step(7, `订单详情 #${oid}`);
    r = await call('GET', `/api/orders/${oid}`);
    log('  ' + (ok(r.status) ? '✓' : '✗'), r.status, JSON.stringify(r.json).slice(0, 240));

    // pay/create 与 mock-scan 的参数走 Query，不是 body
    step(8, '发起支付 (orderId 走 query)');
    r = await call('POST', `/api/pay/create?orderId=${oid}`);
    log('  ' + (ok(r.status) ? '✓' : '✗'), r.status, JSON.stringify(r.json).slice(0, 240));
    const payNo = r.json?.payNo;

    if (payNo) {
      step(9, '模拟扫码支付 (payNo 走 query)');
      r = await call('POST', `/api/pay/mock-scan?payNo=${payNo}`);
      log('  ' + (ok(r.status) ? '✓' : '✗'), r.status, JSON.stringify(r.json).slice(0, 240));

      step(10, '查询支付状态');
      r = await call('GET', `/api/pay/status?orderId=${oid}`);
      log('  ' + (ok(r.status) ? '✓' : '✗'), r.status, JSON.stringify(r.json).slice(0, 240));
    } else {
      log('  ! 未拿到 payNo，跳过扫码');
    }
  } else {
    log('\n! 下单响应未给出订单 id，跳过支付环节');
  }

  log('\n===== 冒烟结束 =====');
})().catch(e => { console.error('脚本异常:', e.message); process.exit(1); });
