<template>
  <div>
    <!-- 平台管理员 -->
    <template v-if="userStore.role === 'admin'">
      <!-- 顶部 4 张渐变数据卡 -->
      <div class="gradient-row">
        <div class="gradient-card g1">
          <div class="g-icon">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="g-num">{{ adminData.userCount ?? 0 }}</div>
          <div class="g-label">注册用户</div>
          <div class="g-trend">今日 +{{ adminData.todayUsers ?? 0 }}</div>
        </div>
        <div class="gradient-card g2">
          <div class="g-icon">
            <el-icon :size="24"><Shop /></el-icon>
          </div>
          <div class="g-num">{{ adminData.merchantCount ?? 0 }}</div>
          <div class="g-label">入驻商家</div>
          <div class="g-trend">待审核 {{ adminData.pendingApplies ?? 0 }}</div>
        </div>
        <div class="gradient-card g3">
          <div class="g-icon">
            <el-icon :size="24"><List /></el-icon>
          </div>
          <div class="g-num">{{ adminData.orderCount ?? 0 }}</div>
          <div class="g-label">订单总数</div>
          <div class="g-trend">今日 +{{ adminData.todayOrders ?? 0 }}</div>
        </div>
        <div class="gradient-card g4">
          <div class="g-icon">
            <el-icon :size="24"><Coin /></el-icon>
          </div>
          <div class="g-num">¥{{ adminData.gmv ?? 0 }}</div>
          <div class="g-label">成交总额 GMV</div>
          <div class="g-trend">UV {{ adminData.uv ?? 0 }} · PV {{ adminData.pv ?? 0 }}</div>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="chart-row">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">GMV / 订单趋势</span>
              <el-tag size="small" type="success" effect="plain">近 7 日</el-tag>
            </div>
          </template>
          <DashboardChart v-if="dashboardLoaded" :option="trendOption" />
        </el-card>
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">订单状态分布</span>
              <el-tag size="small" effect="plain">{{ statusList.length }} 种状态</el-tag>
            </div>
          </template>
          <EmptyState v-if="statusList.length === 0" type="data" description="暂无订单数据" />
          <DashboardChart v-else-if="dashboardLoaded" :option="statusOption" />
        </el-card>
      </div>

      <!-- 详细状态列表 -->
      <el-card class="mt-16">
        <template #header>
          <div class="card-header">
            <span class="card-title">订单状态明细</span>
          </div>
        </template>
        <div class="status-grid">
          <div v-for="s in statusList" :key="s.status" class="status-cell">
            <el-tag :type="statusTagType(s.status)" size="large" effect="dark">{{ statusText(s.status) }}</el-tag>
            <div class="status-count">{{ s.count }}</div>
          </div>
        </div>
      </el-card>
    </template>

    <!-- 商家 -->
    <template v-else>
      <el-empty v-if="!Object.keys(merchantStats).length" description="暂无统计数据" />
      <div v-else class="gradient-row">
        <div v-for="(v, k) in merchantStats" :key="k" class="gradient-card g1">
          <div class="g-num">{{ v }}</div>
          <div class="g-label">{{ k }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import request from '../api/request';
import { useUserStore } from '../stores/user';
import DashboardChart from '../components/DashboardChart.vue';
import EmptyState from '../components/EmptyState.vue';

const userStore = useUserStore();
const adminData = ref<any>({});
const merchantStats = ref<Record<string, any>>({});

const dashboardLoaded = computed(() => !!adminData.value.userCount);

// 监听深色模式，图表文字/网格颜色随主题变化
const isDark = ref(false);
function syncTheme() {
  isDark.value = document.documentElement.classList.contains('dark');
}
let observer: MutationObserver | null = null;
onMounted(() => {
  syncTheme();
  observer = new MutationObserver((muts) => {
    if (muts.some(m => m.attributeName === 'class')) syncTheme();
  });
  observer.observe(document.documentElement, { attributes: true });
});
onUnmounted(() => {
  observer?.disconnect();
});

const chartText = computed(() => (isDark.value ? '#e2e8f0' : '#4a5566'));
const chartAxis = computed(() => (isDark.value ? '#94a3b8' : '#7c8da6'));
const chartGrid = computed(() => (isDark.value ? 'rgba(148,163,184,0.15)' : '#ede7d7'));
const chartTooltipBg = computed(() => (isDark.value ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)'));
const chartTooltipText = computed(() => (isDark.value ? '#e2e8f0' : '#1f2a3a'));

const statusTexts: Record<number, string> = {
  0: '待支付', 1: '已支付', 2: '已确认', 3: '进行中', 4: '已完成', 5: '已取消', 6: '退款中', 7: '已退款',
};
const statusTagTypes: Record<number, 'warning' | 'primary' | 'success' | 'info' | 'danger'> = {
  0: 'warning', 1: 'primary', 2: 'primary', 3: 'info', 4: 'success', 5: 'info', 6: 'danger', 7: 'danger',
};

function statusText(s: number) {
  return statusTexts[s] ?? `状态${s}`;
}
function statusTagType(s: number) {
  return statusTagTypes[s] ?? 'info';
}

const statusList = computed(() => adminData.value.byStatus || []);

const trendOption = computed(() => {
  const trend = adminData.value.trend || [];
  return {
    tooltip: { trigger: 'axis', backgroundColor: chartTooltipBg.value, textStyle: { color: chartTooltipText.value } },
    legend: { top: 0, right: 0, icon: 'roundRect', textStyle: { color: chartText.value } },
    grid: { left: 50, right: 50, top: 40, bottom: 30 },
    xAxis: {
      type: 'category',
      data: trend.map((t: any) => t.date),
      axisLine: { lineStyle: { color: chartAxis.value } },
      axisLabel: { color: chartAxis.value },
    },
    yAxis: [
      { type: 'value', name: '订单数', axisLine: { show: false }, axisLabel: { color: chartAxis.value }, splitLine: { lineStyle: { color: chartGrid.value } } },
      { type: 'value', name: 'GMV(元)', axisLine: { show: false }, axisLabel: { color: chartAxis.value }, splitLine: { show: false } },
    ],
    series: [
      {
        name: '订单数',
        type: 'bar',
        data: trend.map((t: any) => t.count),
        itemStyle: { color: '#0e8c7e', borderRadius: [4, 4, 0, 0] },
        barWidth: '32%',
      },
      {
        name: 'GMV (元)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: trend.map((t: any) => Number(t.amount)),
        itemStyle: { color: '#c08a3e' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(192,138,62,0.25)' },
              { offset: 1, color: 'rgba(192,138,62,0)' },
            ],
          },
        },
      },
    ],
  };
});

const statusOption = computed(() => {
  const list = statusList.value;
  const palette: Record<number, string> = {
    0: '#e0a44b', 1: '#4a6ba8', 2: '#5b8cc7', 3: '#7da9c9',
    4: '#4ea76b', 5: '#aab5c5', 6: '#c0514c', 7: '#8c3d3a',
  };
  const data = list.map((s: any) => ({
    name: statusText(s.status),
    value: s.count,
    itemStyle: { color: palette[s.status] ?? '#0e8c7e' },
  }));
  return {
    tooltip: { trigger: 'item', backgroundColor: chartTooltipBg.value, textStyle: { color: chartTooltipText.value } },
    legend: {
      orient: 'horizontal',
      bottom: 8,
      left: 'center',
      textStyle: { color: chartText.value, fontSize: 12 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 14,
      icon: 'roundRect',
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: ['38%', '62%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 6, borderColor: isDark.value ? '#1a2738' : '#fff', borderWidth: 2 },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{c}',
          fontSize: 12,
          color: chartText.value,
          lineHeight: 16,
        },
        labelLine: { show: true, length: 8, length2: 8, lineStyle: { color: chartAxis.value } },
        data: data.length ? data : [{ name: '暂无', value: 1, itemStyle: { color: '#ede7d7' } }],
      },
    ],
  };
});

onMounted(async () => {
  if (userStore.role === 'admin') {
    try {
      adminData.value = await request.get('/admin/dashboard');
    } catch {
      // 已提示
    }
  } else {
    // 商家看自己的经营数据，必须走商家域 /api/merchant/<模块>/*
    // （原来的 /<模块>/admin/stats 属运营域管理员接口，商家访问会被鉴权拦成 403）
    const apiMap: Record<string, string> = {
      clothing: '/merchant/clothing/stats',
      food: '/merchant/food/stats',
      hotel: '/merchant/hotel/stats',
      travel: '/merchant/travel/stats',
    };
    try {
      const path = apiMap[userStore.moduleType];
      if (path) {
        merchantStats.value = await request.get(path);
      }
    } catch {
      // 已提示
    }
  }
});
</script>

<style scoped>
.gradient-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.gradient-card {
  border-radius: var(--radius-lg);
  padding: 22px;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-base);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.gradient-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.gradient-card.g1 {
  background: linear-gradient(135deg, #0e8c7e 0%, #14a89a 100%);
}
.gradient-card.g2 {
  background: linear-gradient(135deg, #2d4a7c 0%, #4a6ba8 100%);
}
.gradient-card.g3 {
  background: linear-gradient(135deg, #c08a3e 0%, #d4a262 100%);
}
.gradient-card.g4 {
  background: linear-gradient(135deg, #c0514c 0%, #d97872 100%);
}
.g-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.g-num {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.2;
}
.g-label {
  font-size: 14px;
  opacity: 0.92;
  margin-top: 4px;
}
.g-trend {
  font-size: 12px;
  opacity: 0.75;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.18);
}

/* 图表区 */
.chart-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-top: 16px;
}
.chart-card {
  height: 420px;
}
.chart-card :deep(.el-card__body) {
  height: calc(100% - 56px);
  padding: 12px 16px 8px;
  display: flex;
  flex-direction: column;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-weight: 600;
  font-size: 15px;
}

/* 状态明细 */
.status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.status-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 8px;
  background: var(--bg-page);
  border-radius: var(--radius-base);
}
.status-count {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>