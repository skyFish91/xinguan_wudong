// =========================================================
// 乌东文旅 - 演示 mock 数据生成器
// 追加到 sql/02-dml.sql 末尾，让 dashboard / orders / users 等页面有足够数据展示
// 生成：100 普通用户、50 订单（覆盖 5 种类型 + 8 种状态）、20 评论、10 系统消息
// =========================================================
const fs = require('fs');
const path = require('path');

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const NICKNAMES = ['山间清泉', '苗岭小妹', '梯田守望者', '银铃叮当', '枫叶红了', '云上人家', '芦笙少年', '蜡染姑娘',
  '苗寨行者', '深山老饕', '银饰匠人', '吊脚楼主', '阿娜', '阿莲', '阿莎', '苗家阿婆', '山歌嘹亮', '黑发苗女',
  '银匠传人', '稻花鱼', '酸汤妹', '鼓楼夜话', '芒山云雾', '山路弯弯', '秋千上的', '蝴蝶妈妈', '花山节',
  '苗岭飞歌', '醉美乌东', '夜郎后人', '黔山秀水', '苗寨老吴', '稻田守望', '枫香染坊', '苗家阿哥', '长桌宴客',
  '阿西里西', '苗家情歌', '芦笙悠扬', '敬酒歌', '飞歌', '蜡染坊', '银饰哥', '苗家绣娘', '竹楼夜话', '苗家小厨'];

const REGIONS = ['贵州贵阳', '贵州凯里', '贵州遵义', '贵州铜仁', '广东广州', '广东深圳', '北京', '上海',
  '重庆', '湖南长沙', '四川成都', '浙江杭州', '江苏南京', '湖北武汉', '广西南宁', '云南昆明', '福建福州', '江西南昌'];

const BIOS = [
  '热爱苗寨风光的摄影爱好者',
  '喜欢记录少数民族村寨生活',
  '非遗手工艺收藏者',
  '自驾游达人',
  '美食博主，专探各地特色',
  '苗族文化研究者',
  '亲子游家庭',
  '建筑设计爱好者，关注吊脚楼',
  '写作者，记录旅途所见',
  '手工 DIY 达人',
  '古法美食追随者',
  '徒步穿越爱好者',
  '寻找小众目的地',
  '传统文化研习者',
  '喜欢原生态乡村',
];

const ORDER_REMARKS = ['', '请帮忙打包好', '小孩一起用餐，需要儿童椅', '需要加一副碗筷', '送到时电话联系',
  '请帮忙送到景区门口', '请用苗族特色包装', '行李较多，请商家联系', '无', '希望能看到银饰锻制演示', ''];

const REVIEW_CONTENTS = [
  '服务很热情，银饰做工精细，下次还会来！',
  '苗家长桌宴味道正宗，酸汤鱼超赞。',
  '吊脚楼民宿推窗就是梯田，晨雾超美。',
  '蜡染体验很有意思，孩子很喜欢。',
  '导游讲解专业，了解了很多苗族文化。',
  '整体体验超出预期，强烈推荐。',
  '住宿条件不错，老板很热情。',
  '山路有点远，但风景确实美。',
  '民俗表演很精彩，值得一看。',
  '适合周末短途游，下次约朋友再来。',
  '银饰做工很好，发货速度快。',
  '餐厅的酸汤和腊肉是地道苗家味。',
  '民宿的清晨真的像在云端。',
  '梯田日出太美了，摄影爱好者的天堂。',
  '长桌宴仪式感满满，敬酒歌很有特色。',
];

// 已有数据：6 种子用户（id 1-6）、3 个扩展普通用户（id 7-9），最大 id = 9
// 用户从 id 10 开始
const USER_HASH = '$2b$10$XteybQj3/a6cZ7A7dTvjz.JiVCaqPr/Kb1hBDwHk6RbadIyzOuYoK'; // user123
const MERCHANT_HASH = '$2b$10$gcpzzo5BlxnVTUNGgvAWe.lHS6GFOiA/8IAmbXlMihiUN9pS9zbmW'; // merchant123

function pad(n, w) { return String(n).padStart(w, '0'); }

// ---- 生成 100 个普通用户 (id 10-109) ----
const userRows = [];
for (let i = 10; i < 110; i++) {
  const phone = '137' + pad(rand(10000000, 99999999), 8);
  const nickname = pick(NICKNAMES) + (rand(0, 1) ? rand(2, 99) : '');
  const gender = rand(0, 2);
  const region = pick(REGIONS);
  const bio = pick(BIOS);
  userRows.push(`(${i}, '${phone}', '${USER_HASH}', '${nickname}', 'user', ${gender}, '${region}', '${bio}', 1)`);
}

// ---- 生成 100 条订单 ----
// 覆盖 orderType: goods/meal/hotel/ticket/route
// status: 0-待支付 1-已支付 2-已确认 3-进行中 4-已完成 5-已取消 6-退款中 7-已退款
const orderTypeMap = { goods: 1, meal: 2, hotel: 3, ticket: 4, route: 5 };
const merchantIds = [3, 4, 5, 6]; // 4 个真实商家
const userIds = Array.from({ length: 100 }, (_, k) => 10 + k); // 用户 id 10-109
const orderRows = [];
const orderItemRows = [];
const payRows = [];
const financeRows = [];
const visitLogRows = [];

let orderId = 100; // 从 100 开始（已有 1-2 订单）
for (let i = 0; i < 100; i++) {
  orderId++;
  const userId = pick(userIds);
  const merchantId = pick(merchantIds);
  const orderType = pick(['goods', 'meal', 'hotel', 'ticket', 'route']);
  const status = pick([1, 1, 1, 2, 2, 3, 4, 4, 4, 5, 6, 7]); // 已支付/已确认/已完成居多
  const amount = rand(50, 1500) + 0.99;
  const offset = rand(0, 30);
  const hour = rand(8, 22);
  const minute = rand(0, 59);
  const payTime = `DATE_SUB(NOW(), INTERVAL ${offset} DAY) + INTERVAL ${hour} HOUR + INTERVAL ${minute} MINUTE`;
  const orderNo = `WD${new Date().getFullYear()}${pad(new Date().getMonth() + 1, 2)}${pad(new Date().getDate(), 2)}${pad(orderId, 6)}`;
  const remark = pick(ORDER_REMARKS);
  orderRows.push(`(${orderId}, '${orderNo}', ${userId}, ${merchantId}, '${orderType}', ${status}, ${amount.toFixed(2)}, ${amount.toFixed(2)}, ${payTime}, '', '${remark}', ${payTime})`);

  // 订单项（goods 类型有 sku_id，其它类型没有）
  if (orderType === 'goods') {
    const skuId = rand(1, 9);
    const price = amount;
    orderItemRows.push(`(${orderId}, ${skuId}, '苗家特色商品', '标准规格', '/uploads/seeds/product-silver-1.svg', ${price.toFixed(2)}, 1, ${status >= 4 ? 1 : 0})`);
  }

  // 支付记录
  if (status >= 1 && status <= 4) {
    payRows.push(`('PAY${pad(orderId, 10)}', ${orderId}, ${userId}, ${amount.toFixed(2)}, 'mock_wxpay', 1, ${payTime})`);
  }

  // 财务记录（已支付/已确认/已完成进财务）
  if (status >= 1 && status <= 4) {
    const rate = orderType === 'goods' ? 0.05 : 0.10;
    const commission = +(amount * rate).toFixed(2);
    const merchantIncome = +(amount - commission).toFixed(2);
    financeRows.push(`(${orderId}, ${merchantId}, ${amount.toFixed(2)}, ${rate.toFixed(2)}, ${commission}, ${merchantIncome}, 0, NOW())`);
  }

  // 访问日志（每个订单关联一条）
  if (rand(0, 1)) {
    visitLogRows.push(`(${userId}, '/order/confirm', 'order', 'order', ${payTime})`);
  }
}

// ---- 生成 20 条评论（关联游记/商品/民宿） ----
const reviewRows = [];
for (let i = 0; i < 30; i++) {
  const userId = pick(userIds);
  const target = pick(['product', 'homestay', 'scenic']);
  const targetId = rand(1, 6);
  const rating = rand(4, 5);
  const content = pick(REVIEW_CONTENTS);
  reviewRows.push(`(${i + 100}, NULL, ${userId}, '${target}', ${targetId}, ${rating}, '${content}', NULL, '', '', 0, NOW(), NOW())`);
}

// ---- 生成 30 条站内消息 ----
const msgRows = [];
const msgTypes = [
  ['order', '订单支付成功', '您的订单已支付成功，商家将尽快处理。'],
  ['order', '订单已发货', '您的订单已由商家发货，请注意查收物流。'],
  ['system', '欢迎来到乌东文旅', '平台汇聚苗寨衣食住行一站式服务，祝您玩得开心！'],
  ['activity', '苗年节活动开启', '11 月苗年节即将开启，活动期间下单可享 9 折优惠。'],
  ['merchant', '商家审核通过', '您的入驻申请已通过，欢迎加入乌东文旅平台。'],
];
for (let i = 0; i < 30; i++) {
  const userId = pick(userIds);
  const [type, title, content] = pick(msgTypes);
  msgRows.push(`(${i + 100}, ${userId}, '${type}', '${title}', '${content}', ${rand(0, 1)}, NOW())`);
}

// ---- 生成访问日志（增加 PV/UV）----
const pvRows = [];
for (let i = 0; i < 200; i++) {
  const userId = pick(userIds);
  const path = pick(['/home', '/clothing', '/food', '/hotel', '/travel', '/community', '/order/confirm']);
  const offset = rand(0, 30);
  pvRows.push(`(${userId}, '${path}', '${path.startsWith('/clothing') ? 'clothing' : path.startsWith('/food') ? 'food' : path.startsWith('/hotel') ? 'hotel' : path.startsWith('/travel') ? 'travel' : path.startsWith('/community') ? 'community' : ''}', 'view', DATE_SUB(NOW(), INTERVAL ${offset} DAY))`);
}

// 输出 SQL
const sql = `

-- =========================================================
-- 演示 mock 数据（生成时间：${new Date().toISOString().slice(0, 19)}）
-- 100 用户 / 100 订单 / 30 评论 / 30 消息 / 200 访问日志
-- 仅用于 dashboard / users / orders / messages 等页面演示
-- =========================================================

-- 用户（id 10-109）
INSERT INTO t_user (id, phone, password, nickname, role, gender, region, bio, status) VALUES
${userRows.join(',\n')};

-- 订单（id 100-199）
INSERT INTO t_order (id, order_no, user_id, merchant_id, order_type, status, total_amount, pay_amount, pay_time, cancel_reason, remark, created_at) VALUES
${orderRows.join(',\n')};

-- 订单项（仅 goods 类型）
INSERT INTO t_order_item (order_id, sku_id, title, spec_name, image, price, quantity, shipping_status) VALUES
${orderItemRows.join(',\n')};

-- 支付记录
INSERT INTO t_pay_record (pay_no, order_id, user_id, amount, channel, status, paid_at) VALUES
${payRows.join(',\n')};

-- 财务记录（未结算）
INSERT INTO t_finance_record (order_id, merchant_id, order_amount, commission_rate, commission, merchant_income, settle_status, created_at) VALUES
${financeRows.join(',\n')};

-- 评论（关联产品/民宿/景区）
INSERT INTO t_review (id, order_id, user_id, biz_type, biz_id, rating, content, images, follow_up, merchant_reply, is_hidden, created_at, updated_at) VALUES
${reviewRows.join(',\n')};

-- 站内消息
INSERT INTO t_message (id, user_id, msg_type, title, content, is_read, created_at) VALUES
${msgRows.join(',\n')};

-- 访问日志
INSERT INTO t_visit_log (user_id, page, module, action, created_at) VALUES
${pvRows.join(',\n')};
`;

// 追加到 02-dml.sql
const sqlPath = path.join(__dirname, '02-dml.sql');
const existing = fs.readFileSync(sqlPath, 'utf8');
fs.writeFileSync(sqlPath, existing + sql);
console.log('✓ 追加到 sql/02-dml.sql：');
console.log('  - 用户：' + userRows.length);
console.log('  - 订单：' + orderRows.length);
console.log('  - 订单项：' + orderItemRows.length);
console.log('  - 支付记录：' + payRows.length);
console.log('  - 财务记录：' + financeRows.length);
console.log('  - 评论：' + reviewRows.length);
console.log('  - 消息：' + msgRows.length);
console.log('  - 访问日志：' + pvRows.length);