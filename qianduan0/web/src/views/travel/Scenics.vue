<template>
  <div>
    <TopNav />
    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">景区出行</h1>
        <p class="page-sub">苗寨、梯田与雷公山云海，选好日期即可在线购票，入园刷码通行</p>
      </header>

      <TravelTabs />

      <!-- 加载中 -->
      <div v-if="loading" class="scenic-list">
        <div v-for="i in 2" :key="`sk${i}`" class="wd-skel-card">
          <div class="wd-skeleton" style="height: 260px; border-radius: 0"></div>
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-line wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-line wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-line wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <div v-else-if="scenics.length" class="scenic-list">
        <article v-for="(s, i) in scenics" :key="s.id" class="wd-card scenic wd-rise" :style="{ animationDelay: `${i * 70}ms` }">
          <!-- 景区头部：大图 + 玻璃信息条 -->
          <div class="scenic-hero">
            <img :src="imgLarge(s.mainImage, s.name, true)" :alt="s.name" @error="imgError" />
            <div class="scenic-overlay">
              <h2 class="scenic-name">{{ s.name }}</h2>
              <div class="scenic-facts">
                <span v-if="s.address" class="wd-chip"><el-icon><Location /></el-icon> {{ s.address }}</span>
                <span v-if="s.openTime" class="wd-chip"><el-icon><Clock /></el-icon> {{ s.openTime }}</span>
              </div>
            </div>
          </div>

          <div class="scenic-body">
            <p v-if="s.intro" class="scenic-intro">{{ s.intro }}</p>

            <div class="ticket-head">
              <span class="ticket-head-title">票种</span>
              <span class="ticket-head-sub">选择使用日期后购买，凭电子票入园</span>
            </div>

            <div v-if="!s.tickets?.length" class="ticket-none">
              <el-icon><InfoFilled /></el-icon> 该景区暂未开放线上购票
            </div>

            <div v-else class="ticket-list">
              <div v-for="t in s.tickets" :key="t.id" class="ticket-row">
                <div class="ticket-info">
                  <div class="ticket-name">{{ t.name }}</div>
                  <div class="ticket-sub">{{ t.validRule }}</div>
                  <div class="ticket-price">
                    ¥{{ t.price }}
                    <small v-if="stocks[t.id] !== undefined">余票 {{ stocks[t.id] }}</small>
                  </div>
                </div>
                <div class="ticket-buy">
                  <el-date-picker
                    v-model="buyForm[t.id].useDate"
                    type="date"
                    value-format="YYYY-MM-DD"
                    placeholder="使用日期"
                    :disabled-date="disablePast"
                    class="date-picker"
                    @change="onDateChange(t.id)"
                  />
                  <el-input-number v-model="buyForm[t.id].quantity" :min="1" :max="10" />
                  <el-input v-model="buyForm[t.id].visitors" placeholder="游客姓名，逗号分隔（选填）" class="visitors" />
                  <el-button type="primary" @click="buyTicket(s, t)">
                    立即购买
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="wd-card">
        <EmptyState
          variant="default"
          title="暂无景区开放购票"
          desc="景区信息正在整理中，先去社区看看其他旅人的推荐。"
        >
          <router-link to="/community"><el-button type="primary">看看游记</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Clock, InfoFilled, Location } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import TravelTabs from '../../components/TravelTabs.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgLarge, imgError } from '../../utils/media';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();
const scenics = ref<any[]>([]);
const loading = ref(true);
const stocks = reactive<Record<number, number>>({});
const buyForm = reactive<Record<number, { useDate: string; quantity: number; visitors: string }>>({});

function disablePast(d: Date) {
  return dayjs(d).isBefore(dayjs(), 'day');
}

async function loadStocks(scenicTickets: any[]) {
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  // 先同步初始化全部票的购买表单，避免模板渲染时访问未初始化的 buyForm[t.id] 导致崩溃
  for (const t of scenicTickets) {
    if (!buyForm[t.id]) {
      buyForm[t.id] = { useDate: tomorrow, quantity: 1, visitors: '' };
    }
  }
  for (const t of scenicTickets) {
    try {
      const s: any = await request.get('/travel/tickets/stock', {
        params: { ticketTypeId: t.id, useDate: buyForm[t.id].useDate },
      });
      stocks[t.id] = s.remain;
    } catch {
      // 已提示
    }
  }
}

async function onDateChange(ticketTypeId: number) {
  try {
    const s: any = await request.get('/travel/tickets/stock', {
      params: { ticketTypeId, useDate: buyForm[ticketTypeId].useDate },
    });
    stocks[ticketTypeId] = s.remain;
  } catch {
    // 已提示
  }
}

async function buyTicket(scenic: any, ticket: any) {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  const f = buyForm[ticket.id];
  if (!f.useDate) {
    ElMessage.warning('请选择使用日期');
    return;
  }
  if (stocks[ticket.id] !== undefined && stocks[ticket.id] < f.quantity) {
    ElMessage.warning('当日余票不足');
    return;
  }
  const names = f.visitors
    ? f.visitors.split(/[,，]/).map((s) => s.trim()).filter((s) => s)
    : [];
  try {
    const order: any = await request.post('/travel/tickets/buy', {
      ticketTypeId: ticket.id,
      useDate: f.useDate,
      quantity: f.quantity,
      visitors: JSON.stringify(names),
    });
    router.push(`/pay/${order.id}`);
  } catch {
    // 已提示
  }
}

onMounted(async () => {
  try {
    scenics.value = await request.get('/travel/scenics');
    for (const s of scenics.value) {
      await loadStocks(s.tickets || []);
    }
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-head {
  margin-bottom: var(--wd-s4);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.scenic-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s7);
}

/* 景区头部大图 */
.scenic-hero {
  position: relative;
  height: 280px;
  overflow: hidden;
}
.scenic-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.scenic-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 28px 32px;
  background: linear-gradient(to top, rgba(16, 18, 24, 0.72), transparent);
}
.scenic-name {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.35);
}
.scenic-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.scenic-body {
  padding: var(--wd-s6) var(--wd-s7) var(--wd-s7);
}
.scenic-intro {
  font-size: 14px;
  line-height: 1.9;
  color: var(--wd-text-2);
}

/* 票种区 */
.ticket-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: var(--wd-s6) 0 var(--wd-s4);
  padding-bottom: 12px;
  border-bottom: 1px solid var(--wd-border);
}
.ticket-head-title {
  position: relative;
  padding-left: 13px;
  font-size: 16px;
  font-weight: 700;
}
.ticket-head-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 15px;
  border-radius: var(--wd-r-pill);
  background: var(--wd-brand);
}
.ticket-head-sub {
  font-size: 12.5px;
  color: var(--wd-text-4);
}

.ticket-none {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-radius: var(--wd-r-sm);
  font-size: 13.5px;
  color: var(--wd-text-4);
  background: #f7f8fb;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ticket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s5);
  padding: 18px 20px;
  border-radius: var(--wd-r-md);
  background: #f9fafc;
  border: 1px solid var(--wd-border);
  transition: all 0.28s var(--wd-ease);
}
.ticket-row:hover {
  background: #fff;
  border-color: rgba(var(--wd-brand-rgb), 0.22);
  box-shadow: var(--wd-sh-2);
  transform: translateY(-2px);
}
.ticket-info {
  min-width: 190px;
}
.ticket-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.ticket-sub {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.ticket-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
  font-size: 20px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.ticket-price small {
  font-size: 12px;
  font-weight: 500;
  color: var(--wd-text-4);
}

.ticket-buy {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.date-picker {
  width: 150px;
}
.visitors {
  width: 200px;
}

@media (max-width: 1000px) {
  .ticket-row {
    flex-direction: column;
    align-items: stretch;
  }
  .ticket-buy {
    justify-content: flex-start;
  }
  .date-picker,
  .visitors {
    width: 100%;
  }
  .scenic-hero {
    height: 220px;
  }
  .scenic-name {
    font-size: 20px;
  }
}
</style>
