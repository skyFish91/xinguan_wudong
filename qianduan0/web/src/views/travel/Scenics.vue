<template>
  <div>
    <TopNav />
    <div class="page">
      <el-card v-for="s in scenics" :key="s.id" class="scenic" shadow="hover">
        <div class="scenic-top">
          <img :src="s.mainImage" class="scenic-img" />
          <div class="scenic-info">
            <h3>{{ s.name }}</h3>
            <div class="line">{{ s.address }}</div>
            <div class="line">开放时间：{{ s.openTime }}</div>
            <div class="line intro">{{ s.intro }}</div>
          </div>
        </div>
        <el-divider content-position="left">票种</el-divider>
        <div v-for="t in s.tickets" :key="t.id" class="ticket-row">
          <div class="ticket-info">
            <div class="ticket-name">{{ t.name }}</div>
            <div class="ticket-sub">{{ t.validRule }}</div>
            <div class="ticket-price">¥{{ t.price }}</div>
          </div>
          <div class="ticket-buy">
            <el-date-picker
              v-model="buyForm[t.id].useDate"
              type="date"
              value-format="YYYY-MM-DD"
              :disabled-date="disablePast"
              class="date-picker"
              @change="onDateChange(t.id)"
            />
            <el-input-number v-model="buyForm[t.id].quantity" :min="1" :max="10" />
            <el-input v-model="buyForm[t.id].visitors" placeholder="游客姓名，逗号分隔（选填）" class="visitors" />
            <el-button type="primary" @click="buyTicket(s, t)">
              购买
              <span v-if="stocks[t.id] !== undefined">（余 {{ stocks[t.id] }}）</span>
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();
const scenics = ref<any[]>([]);
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
    ? f.visitors.split(/[,，]/).map(s => s.trim()).filter(s => s)
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
  }
});
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.scenic {
  margin-bottom: 20px;
}
.scenic-top {
  display: flex;
  gap: 20px;
}
.scenic-img {
  width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
.scenic-info {
  flex: 1;
}
.line {
  margin-top: 8px;
  color: #555;
}
.intro {
  line-height: 1.7;
}
.ticket-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}
.ticket-name {
  font-weight: 600;
}
.ticket-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
.ticket-price {
  color: #c0392b;
  font-weight: bold;
  margin-top: 4px;
}
.ticket-buy {
  display: flex;
  align-items: center;
  gap: 10px;
}
.date-picker {
  width: 160px;
}
.visitors {
  width: 220px;
}
</style>
