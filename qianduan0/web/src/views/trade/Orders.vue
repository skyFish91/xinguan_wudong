<template>
  <div class="orders-page">
    <TopNav />

    <div class="wd-container wd-page">
      <!-- 页头 -->
      <header class="page-head">
        <h1 class="page-title">我的订单</h1>
        <p class="page-sub">全部行程与好物，按状态一目了然</p>
      </header>

      <!-- 状态筛选：液态玻璃吸顶 -->
      <div class="status-bar glass-strong">
        <div class="status-tabs">
          <div
            v-for="t in tabs"
            :key="t.value"
            :class="['status-tab', { active: statusTab === t.value }]"
            @click="switchStatus(t.value)"
          >
            {{ t.label }}
          </div>
        </div>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading && !list.length" class="order-list">
        <div v-for="i in 3" :key="`s${i}`" class="wd-skel-card order-skel">
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-title"></div>
            <div class="order-skel-row">
              <div class="wd-skeleton skel-thumb"></div>
              <div class="skel-lines">
                <div class="wd-skeleton wd-skel-line"></div>
                <div class="wd-skeleton wd-skel-line wd-skel-short"></div>
              </div>
            </div>
            <div class="wd-skeleton wd-skel-line skel-foot"></div>
          </div>
        </div>
      </div>

      <!-- 订单列表 -->
      <div v-else-if="list.length" class="order-list">
        <article
          v-for="(o, i) in list"
          :key="o.id"
          class="wd-card order-card wd-rise"
          :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
        >
          <!-- 卡头 -->
          <div class="order-head">
            <div class="head-left">
              <span class="order-no">{{ o.orderNo }}</span>
              <span class="order-time">{{ formatTime(o.createdAt) }}</span>
            </div>
            <span class="status-pill" :class="`st-${statusClass(o.status)}`">{{ statusText(o.status) }}</span>
          </div>

          <p class="order-remark" v-if="o.remark">{{ o.remark }}</p>

          <!-- 商品行 -->
          <div class="order-items">
            <div v-for="it in o.items" :key="it.id" class="order-item">
              <div class="item-thumb">
                <img :src="img(it.image, it.title)" :alt="it.title" @error="imgError" />
              </div>
              <div class="item-main">
                <div class="item-title clamp-2">{{ it.title }}</div>
                <div class="item-spec" v-if="it.specName">{{ it.specName }}</div>
              </div>
              <div class="item-side">
                <div class="item-price">¥{{ it.price }}</div>
                <div class="item-qty">× {{ it.quantity }}</div>
              </div>
            </div>
          </div>

          <!-- 扩展信息 -->
          <div class="ext-group">
            <div class="ext" v-if="o.mealBooking">
              <span class="ext-key">餐位</span>
              {{ o.mealBooking.bookingDate }} · {{ o.mealBooking.guestCount }} 人 · 联系人 {{ o.mealBooking.contactName }} {{ o.mealBooking.contactPhone }}
            </div>
            <div class="ext" v-if="o.hotelBooking">
              <span class="ext-key">住宿</span>
              {{ o.hotelBooking.checkInDate }} 至 {{ o.hotelBooking.checkOutDate }}（{{ o.hotelBooking.nights }} 晚）· 入住人 {{ o.hotelBooking.guestName }}
              <span v-if="o.status === 1 || o.status === 2" class="code-wrap">
                · 入住核销码 <b class="code">{{ o.hotelBooking.checkinCode }}</b>
              </span>
            </div>
            <div class="ext" v-if="o.ticketOrder">
              <span class="ext-key">票务</span>
              {{ o.ticketOrder.bizType === 'route' ? '路线' : '门票' }} · 使用日期 {{ o.ticketOrder.useDate }} · {{ o.ticketOrder.quantity }} 份
            </div>
            <div class="ext" v-if="o.refund">
              <span class="ext-key">退款</span>
              {{ o.refund.refundNo }} ·
              <span class="refund-state" :class="`rf-${o.refund.status}`">
                {{ o.refund.status === 0 ? '审核中' : o.refund.status === 1 ? '已退款' : '已驳回' }}
              </span>
              <span v-if="o.refund.handleNote" class="refund-note">（{{ o.refund.handleNote }}）</span>
            </div>
          </div>

          <!-- 卡尾 -->
          <div class="order-foot">
            <div class="total">
              <span class="total-label">合计</span>
              <span class="total-price">¥{{ o.totalAmount }}</span>
            </div>
            <div class="ops">
              <el-button v-if="o.status === 0" size="default" @click="cancelOrder(o)">取消订单</el-button>
              <el-button v-if="o.status === 0" size="default" type="primary" @click="$router.push(`/pay/${o.id}`)">
                去支付
              </el-button>
              <el-button v-if="[1, 2, 3].includes(o.status)" size="default" @click="applyRefund(o)">申请退款</el-button>
              <el-button
                v-if="o.status === 3 && o.orderType === 'goods'"
                size="default"
                type="primary"
                @click="confirmReceive(o)"
              >
                确认收货
              </el-button>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          variant="order"
          :title="statusTab === 'all' ? '还没有订单' : '这个状态下没有订单'"
          :desc="statusTab === 'all'
            ? '去逛逛苗乡好物与山水行程，心动的都能一键下单。'
            : '换个状态看看，或去首页发现更多。'"
        >
          <router-link to="/clothing"><el-button type="primary">去逛逛</el-button></router-link>
          <el-button v-if="statusTab !== 'all'" @click="switchStatus('all')">查看全部订单</el-button>
        </EmptyState>
      </div>

      <div class="pager-wrap" v-if="total > pageSize">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="load"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import EmptyState from '../../components/EmptyState.vue';
import { img, imgError } from '../../utils/media';
import request from '../../api/request';

const route = useRoute();
const statusTab = ref(String(route.query.status ?? 'all'));
const list = ref<any[]>([]);
const loading = ref(true);
const total = ref(0);
const page = ref(1);
const pageSize = 10;

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待支付', value: '0' },
  { label: '已支付', value: '1' },
  { label: '已确认', value: '2' },
  { label: '进行中', value: '3' },
  { label: '已完成', value: '4' },
  { label: '退款相关', value: 'refund' },
];

const statusTexts: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '已确认', 3: '进行中', 4: '已完成', 5: '已取消', 6: '退款中', 7: '已退款',
};

function statusText(s: number) {
  return statusTexts[s] ?? '未知';
}

/** 状态样式类：待办=警示、完成=成功、取消/退款=中性、进行中=品牌色 */
function statusClass(s: number) {
  if (s === 0) return 'warn';
  if (s === 4) return 'done';
  if (s === 5 || s === 6 || s === 7) return 'muted';
  return 'active';
}

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

function switchStatus(v: string) {
  if (statusTab.value === v) return;
  statusTab.value = v;
  load(1);
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  const params: any = { page: page.value, pageSize };
  if (statusTab.value === 'refund') {
    params.status = undefined;
  } else if (statusTab.value !== 'all') {
    params.status = Number(statusTab.value);
  }
  try {
    const data: any = await request.get('/orders/', { params });
    let items = data.list || [];
    if (statusTab.value === 'refund') {
      items = items.filter((o: any) => [6, 7].includes(o.status));
    }
    list.value = items;
    total.value = statusTab.value === 'refund' ? items.length : data.total || 0;
  } catch {
    // 拦截器已提示
  } finally {
    loading.value = false;
  }
}

async function cancelOrder(o: any) {
  try {
    await ElMessageBox.confirm('确定取消该订单？库存将释放。', '提示', { type: 'warning' });
    await request.post(`/orders/${o.id}/cancel`, null, { params: { reason: '用户主动取消' } });
    ElMessage.success('订单已取消');
    load(page.value);
  } catch (e: any) {
    // 取消操作或已提示
  }
}

async function applyRefund(o: any) {
  try {
    const { value } = await ElMessageBox.prompt('请填写退款原因', '申请退款', {
      inputValue: '行程有变',
    });
    await request.post(`/orders/${o.id}/refund`, null, { params: { reason: value || '' } });
    ElMessage.success('退款申请已提交，等待平台审核');
    load(page.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

async function confirmReceive(o: any) {
  try {
    await ElMessageBox.confirm('确认已收到全部商品？', '提示', { type: 'warning' });
    await request.post(`/orders/${o.id}/receive`);
    ElMessage.success('已确认收货，订单完成');
    load(page.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

onMounted(() => load(1));
</script>

<style scoped>
.orders-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* 页头 */
.page-head {
  padding-bottom: var(--wd-s5);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

/* 状态筛选栏 */
.status-bar {
  position: sticky;
  top: 80px;
  z-index: 60;
  margin-bottom: var(--wd-s6);
  padding: 8px 12px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.status-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.status-tabs::-webkit-scrollbar {
  display: none;
}
.status-tab {
  flex-shrink: 0;
  padding: 8px 18px;
  border-radius: var(--wd-r-pill);
  font-size: 14.5px;
  color: var(--wd-text-2);
  cursor: pointer;
  transition: all 0.26s var(--wd-ease);
}
.status-tab:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.status-tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s5);
}
.order-card {
  padding: var(--wd-s5) var(--wd-s6) var(--wd-s5);
}

/* 卡头 */
.order-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
}
.head-left {
  display: flex;
  align-items: baseline;
  gap: var(--wd-s3);
  min-width: 0;
}
.order-no {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--wd-text-1);
  font-variant-numeric: tabular-nums;
}
.order-time {
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.status-pill {
  flex-shrink: 0;
  padding: 4px 14px;
  border-radius: var(--wd-r-pill);
  font-size: 12.5px;
  font-weight: 600;
}
.st-warn {
  color: #b26b00;
  background: #fdf4e3;
}
.st-done {
  color: #1e7a45;
  background: #e8f5ed;
}
.st-muted {
  color: var(--wd-text-3);
  background: #f1f3f7;
}
.st-active {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}

.order-remark {
  margin-top: var(--wd-s3);
  padding: 8px 12px;
  border-radius: var(--wd-r-xs);
  font-size: 13px;
  color: var(--wd-text-2);
  background: #f7f9fc;
}

/* 商品行 */
.order-items {
  margin-top: var(--wd-s4);
  border-top: 1px solid var(--wd-border);
}
.order-item {
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  padding: var(--wd-s4) 0;
  border-bottom: 1px dashed var(--wd-border);
}
.order-item:last-child {
  border-bottom: none;
}
.item-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 72px;
  border-radius: var(--wd-r-sm);
  overflow: hidden;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.item-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-size: 14.5px;
  font-weight: 500;
  color: var(--wd-text-1);
}
.item-spec {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.item-side {
  flex-shrink: 0;
  text-align: right;
}
.item-price {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--wd-text-1);
  font-variant-numeric: tabular-nums;
}
.item-qty {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 扩展信息 */
.ext-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: var(--wd-s4);
}
.ext {
  padding: 10px 14px;
  border-radius: var(--wd-r-xs);
  font-size: 13px;
  line-height: 1.7;
  color: var(--wd-text-2);
  background: #f7f9fc;
}
.ext-key {
  display: inline-block;
  margin-right: 8px;
  padding: 1px 9px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--wd-indigo);
  background: #eef2f9;
}
.code {
  color: var(--wd-brand);
  letter-spacing: 0.06em;
}
.refund-state {
  font-weight: 600;
}
.rf-0 {
  color: #b26b00;
}
.rf-1 {
  color: #1e7a45;
}
.rf-2 {
  color: var(--wd-text-3);
}
.refund-note {
  color: var(--wd-text-3);
}

/* 卡尾 */
.order-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  margin-top: var(--wd-s5);
  padding-top: var(--wd-s4);
  border-top: 1px solid var(--wd-border);
}
.total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.total-label {
  font-size: 13px;
  color: var(--wd-text-3);
}
.total-price {
  font-size: 22px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.ops {
  display: flex;
  gap: 10px;
}

.pager-wrap {
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 0;
}

/* 骨架 */
.order-skel + .order-skel {
  margin-top: var(--wd-s5);
}
.order-skel-row {
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  margin-top: var(--wd-s5);
}
.skel-thumb {
  width: 72px;
  height: 72px;
  border-radius: var(--wd-r-sm);
  flex-shrink: 0;
}
.skel-lines {
  flex: 1;
}
.skel-foot {
  margin-top: var(--wd-s5);
  width: 40%;
}

@media (max-width: 640px) {
  .order-card {
    padding: var(--wd-s4);
  }
  .order-foot {
    flex-direction: column;
    align-items: stretch;
    gap: var(--wd-s3);
  }
  .ops {
    justify-content: flex-end;
  }
  .head-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
  }
}
</style>
