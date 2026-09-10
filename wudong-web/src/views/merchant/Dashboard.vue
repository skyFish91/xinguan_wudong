<template>
  <div class="dashboard">
    <h1 class="page-title">数据概览</h1>

    <!-- 核心数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日营收</div>
          <div class="stat-value">¥{{ todayRevenue.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较昨日 +12.5%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日订单</div>
          <div class="stat-value">{{ todayOrders }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较昨日 +8.3%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%)">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">今日游客</div>
          <div class="stat-value">{{ todayVisitors }}</div>
          <div class="stat-trend down">
            <el-icon><CaretBottom /></el-icon>
            较昨日 -3.2%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%)">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">本月营收</div>
          <div class="stat-value">¥{{ monthRevenue.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较上月 +25.8%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 30px">
      <el-col :span="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>营收趋势</h3>
            <el-radio-group v-model="chartPeriod" size="small">
              <el-radio-button value="week">近7天</el-radio-button>
              <el-radio-button value="month">近30天</el-radio-button>
              <el-radio-button value="year">近12月</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-content">
            <div id="revenueChart" style="height: 350px"></div>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>票种销售占比</h3>
          </div>
          <div class="chart-content">
            <div id="ticketPieChart" style="height: 350px"></div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 待处理事项 -->
    <div class="todo-section">
      <h2 class="section-title">待处理事项</h2>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="todo-card" @click="$router.push('/merchant/orders')">
            <div class="todo-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ pendingOrders }}</div>
              <div class="todo-label">待处理订单</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="todo-card" @click="$router.push('/merchant/tickets')">
            <div class="todo-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ lowStockCount }}</div>
              <div class="todo-label">库存不足预警</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>

        <el-col :span="8">
          <div class="todo-card">
            <div class="todo-icon success">
              <el-icon><Star /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ newReviews }}</div>
              <div class="todo-label">新评价待回复</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders">
      <div class="card-header">
        <h3>最近订单</h3>
        <el-button text @click="$router.push('/merchant/orders')">
          查看全部 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-table :data="recentOrdersList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="180" />
        <el-table-column prop="scenicName" label="景区" width="150" />
        <el-table-column prop="ticketName" label="票种" width="120" />
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 600">
              ¥{{ (row.amount / 100).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" text>
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Money,
  Document,
  User,
  TrendCharts,
  CaretTop,
  CaretBottom,
  Bell,
  Warning,
  Star,
  ArrowRight
} from '@element-plus/icons-vue'

// 核心数据
const todayRevenue = ref(12580)
const todayOrders = ref(86)
const todayVisitors = ref(234)
const monthRevenue = ref(385200)

// 待处理事项
const pendingOrders = ref(12)
const lowStockCount = ref(3)
const newReviews = ref(8)

// 图表周期
const chartPeriod = ref('week')

// 最近订单
const recentOrdersList = ref([
  {
    orderNo: 'WD202609091001',
    scenicName: '西江千户苗寨',
    ticketName: '成人票',
    quantity: 2,
    amount: 18000,
    status: 'paid',
    createdAt: '2026-09-09 14:23:15'
  },
  {
    orderNo: 'WD202609091002',
    scenicName: '西江千户苗寨',
    ticketName: '学生票',
    quantity: 1,
    amount: 9000,
    status: 'paid',
    createdAt: '2026-09-09 14:18:32'
  },
  {
    orderNo: 'WD202609091003',
    scenicName: '西江千户苗寨',
    ticketName: '儿童票',
    quantity: 3,
    amount: 13500,
    status: 'used',
    createdAt: '2026-09-09 13:45:10'
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    paid: 'success',
    used: 'info',
    cancelled: 'danger'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    paid: '已支付',
    used: '已使用',
    cancelled: '已取消'
  }
  return map[status]
}

onMounted(() => {
  // TODO: 初始化图表
  console.log('Dashboard mounted')
})
</script>

<style scoped>
.dashboard {
  max-width: 1600px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 30px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
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
  font-size: 28px;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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

.todo-section {
  margin: 40px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.todo-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s;
}

.todo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.todo-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.todo-icon.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.todo-icon.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.todo-content {
  flex: 1;
}

.todo-count {
  font-size: 32px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 4px;
}

.todo-label {
  font-size: 14px;
  color: #718096;
}

.arrow {
  font-size: 20px;
  color: #cbd5e0;
}

.recent-orders {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}
</style>
