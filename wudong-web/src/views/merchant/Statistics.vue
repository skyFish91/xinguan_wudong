<template>
  <div class="merchant-statistics">
    <div class="page-header">
      <h1 class="page-title">营收统计</h1>
      <el-radio-group v-model="timePeriod" @change="handlePeriodChange">
        <el-radio-button value="today">今日</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
        <el-radio-button value="year">本年</el-radio-button>
        <el-radio-button value="custom">自定义</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 自定义日期选择 -->
    <div v-if="timePeriod === 'custom'" class="custom-date">
      <el-date-picker
        v-model="customDateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="handleCustomDateChange"
      />
    </div>

    <!-- 核心数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">总营收</div>
          <div class="stat-value">¥{{ totalRevenue.toLocaleString() }}</div>
          <div class="stat-trend" :class="revenueChange >= 0 ? 'up' : 'down'">
            <el-icon v-if="revenueChange >= 0"><CaretTop /></el-icon>
            <el-icon v-else><CaretBottom /></el-icon>
            {{ Math.abs(revenueChange) }}% 较上期
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">订单数量</div>
          <div class="stat-value">{{ totalOrders }}</div>
          <div class="stat-trend" :class="ordersChange >= 0 ? 'up' : 'down'">
            <el-icon v-if="ordersChange >= 0"><CaretTop /></el-icon>
            <el-icon v-else><CaretBottom /></el-icon>
            {{ Math.abs(ordersChange) }}% 较上期
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><Ticket /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">售出门票</div>
          <div class="stat-value">{{ totalTickets }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            {{ ticketsChange }}% 较上期
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">游客数量</div>
          <div class="stat-value">{{ totalVisitors }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            {{ visitorsChange }}% 较上期
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 30px">
      <!-- 营收趋势图 -->
      <el-col :span="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>营收趋势</h3>
            <el-button-group size="small">
              <el-button :type="chartType === 'revenue' ? 'primary' : ''" @click="chartType = 'revenue'">
                营收
              </el-button>
              <el-button :type="chartType === 'orders' ? 'primary' : ''" @click="chartType = 'orders'">
                订单
              </el-button>
              <el-button :type="chartType === 'tickets' ? 'primary' : ''" @click="chartType = 'tickets'">
                门票
              </el-button>
            </el-button-group>
          </div>
          <div class="chart-wrapper">
            <div class="chart-placeholder">
              <el-icon :size="80" color="#e5e7eb"><TrendCharts /></el-icon>
              <p>图表功能需要安装 ECharts</p>
              <p style="font-size: 14px; color: #909399">请运行：npm install echarts</p>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 票种销售占比 -->
      <el-col :span="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>票种销售占比</h3>
          </div>
          <div class="chart-wrapper">
            <div class="ticket-pie-simple">
              <div class="pie-item" v-for="item in pieData" :key="item.name">
                <div class="pie-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
                <div class="pie-label">
                  <span class="name">{{ item.name }}</span>
                  <span class="value">{{ item.value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 景区营收排行 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <div class="chart-card">
          <div class="card-header">
            <h3>景区营收排行</h3>
          </div>
          <div class="ranking-list">
            <div
              v-for="(item, idx) in scenicRanking"
              :key="item.id"
              class="ranking-item"
            >
              <div class="rank" :class="{ top: idx < 3 }">{{ idx + 1 }}</div>
              <div class="scenic-name">{{ item.name }}</div>
              <div class="revenue">¥{{ item.revenue.toLocaleString() }}</div>
              <el-progress
                :percentage="(item.revenue / scenicRanking[0].revenue) * 100"
                :show-text="false"
                :color="idx < 3 ? '#f59e0b' : '#667eea'"
              />
            </div>
          </div>
        </div>
      </el-col>

      <!-- 时段分析 -->
      <el-col :span="12">
        <div class="chart-card">
          <div class="card-header">
            <h3>时段订单分布</h3>
          </div>
          <div class="chart-wrapper">
            <div class="bar-simple">
              <div class="bar-item" v-for="item in timeData" :key="item.time">
                <div class="bar-column" :style="{ height: (item.value / 156 * 100) + '%' }"></div>
                <div class="bar-label">{{ item.time }}</div>
                <div class="bar-value">{{ item.value }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细数据表格 -->
    <div class="data-table">
      <div class="card-header">
        <h3>每日明细</h3>
        <el-button type="primary" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
      <el-table :data="dailyData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column label="营收" width="150">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 600">
              ¥{{ row.revenue.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="orders" label="订单数" width="100" />
        <el-table-column prop="tickets" label="售票数" width="100" />
        <el-table-column prop="visitors" label="游客数" width="100" />
        <el-table-column label="客单价" width="120">
          <template #default="{ row }">
            ¥{{ (row.revenue / row.orders).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="环比增长" width="120">
          <template #default="{ row }">
            <span :class="row.growth >= 0 ? 'growth-up' : 'growth-down'">
              {{ row.growth >= 0 ? '+' : '' }}{{ row.growth }}%
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Money,
  Document,
  Ticket,
  User,
  CaretTop,
  CaretBottom,
  Download,
  TrendCharts
} from '@element-plus/icons-vue'

const timePeriod = ref('month')
const chartType = ref('revenue')
const customDateRange = ref([])

// 核心数据
const totalRevenue = ref(385200)
const revenueChange = ref(12.5)
const totalOrders = ref(1286)
const ordersChange = ref(8.3)
const totalTickets = ref(3542)
const ticketsChange = ref(15.8)
const totalVisitors = ref(2856)
const visitorsChange = ref(10.2)

// 景区排行
const scenicRanking = ref([
  { id: 1, name: '西江千户苗寨', revenue: 385200 },
  { id: 2, name: '荔波小七孔', revenue: 256800 },
  { id: 3, name: '镇远古城', revenue: 182400 },
  { id: 4, name: '梵净山', revenue: 156900 }
])

// 每日数据
const dailyData = ref([
  { date: '2026-09-09', revenue: 15420, orders: 86, tickets: 234, visitors: 234, growth: 12.5, remark: '' },
  { date: '2026-09-08', revenue: 18650, orders: 102, tickets: 289, visitors: 289, growth: 8.3, remark: '周末' },
  { date: '2026-09-07', revenue: 19200, orders: 108, tickets: 305, visitors: 305, growth: 15.2, remark: '周末' },
  { date: '2026-09-06', revenue: 12800, orders: 72, tickets: 198, visitors: 198, growth: -5.6, remark: '' },
  { date: '2026-09-05', revenue: 13500, orders: 76, tickets: 210, visitors: 210, growth: 3.8, remark: '' },
  { date: '2026-09-04', revenue: 14200, orders: 80, tickets: 225, visitors: 225, growth: 6.2, remark: '' },
  { date: '2026-09-03', revenue: 13900, orders: 78, tickets: 218, visitors: 218, growth: 4.5, remark: '' }
])

const pieData = ref([
  { name: '成人票', value: 1548, percent: 43, color: '#667eea' },
  { name: '学生票', value: 856, percent: 24, color: '#f59e0b' },
  { name: '儿童票', value: 642, percent: 18, color: '#10b981' },
  { name: '老年票', value: 496, percent: 15, color: '#ef4444' }
])

const timeData = ref([
  { time: '8-10', value: 48 },
  { time: '10-12', value: 125 },
  { time: '12-14', value: 86 },
  { time: '14-16', value: 156 },
  { time: '16-18', value: 98 },
  { time: '18-20', value: 42 }
])

function handlePeriodChange() {
  ElMessage.info(`切换到${timePeriod.value}视图`)
  // TODO: 重新加载数据
}

function handleCustomDateChange() {
  ElMessage.info('自定义日期范围')
  // TODO: 根据日期范围加载数据
}

function handleExport() {
  ElMessage.success('导出成功（演示）')
  // TODO: 导出 Excel
}

onMounted(() => {
  // TODO: 加载统计数据
  ElMessage.info('图表功能需要安装 ECharts，请运行：npm install echarts')
})
</script>

<style scoped>
.merchant-statistics {
  max-width: 1800px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
}

.custom-date {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.info .stat-icon {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 8px;
}

.stat-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #10b981;
}

.stat-trend.down {
  color: #ef4444;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.chart-wrapper {
  min-height: 350px;
}

.chart-placeholder {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.ticket-pie-simple {
  padding: 20px 0;
}

.pie-item {
  margin-bottom: 20px;
}

.pie-bar {
  height: 30px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.pie-bar:hover {
  opacity: 0.8;
}

.pie-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #4a5568;
}

.pie-label .name {
  font-weight: 500;
}

.pie-label .value {
  font-weight: 600;
}

.bar-simple {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250px;
  padding: 20px 0;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.bar-column {
  width: 50px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s;
  margin-bottom: 10px;
}

.bar-column:hover {
  opacity: 0.8;
  transform: scaleY(1.05);
}

.bar-label {
  font-size: 13px;
  color: #718096;
  margin-bottom: 5px;
}

.bar-value {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.ranking-list {
  padding: 10px 0;
}

.ranking-item {
  display: grid;
  grid-template-columns: 40px 1fr 120px;
  gap: 15px;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.rank {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.rank.top {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.scenic-name {
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
}

.revenue {
  font-size: 16px;
  font-weight: 600;
  color: #f59e0b;
  text-align: right;
}

.data-table {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.growth-up {
  color: #10b981;
  font-weight: 600;
}

.growth-down {
  color: #ef4444;
  font-weight: 600;
}
</style>
