<template>
  <div class="admin-dashboard">
    <h1 class="page-title">平台数据概览</h1>

    <!-- 核心数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">平台总营收</div>
          <div class="stat-value">¥{{ totalRevenue.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较上月 +18.5%
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><Shop /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">入驻商家</div>
          <div class="stat-value">{{ totalMerchants }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            本月新增 {{ newMerchants }} 家
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">注册用户</div>
          <div class="stat-value">{{ totalUsers.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            本月新增 {{ newUsers }} 人
          </div>
        </div>
      </div>

      <div class="stat-card info">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">订单总量</div>
          <div class="stat-value">{{ totalOrders.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            今日 {{ todayOrders }} 单
          </div>
        </div>
      </div>
    </div>

    <!-- 待处理事项 -->
    <div class="todo-section">
      <h2 class="section-title">待处理事项</h2>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="todo-card" @click="$router.push('/admin/merchants?status=pending')">
            <div class="todo-icon">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ pendingMerchants }}</div>
              <div class="todo-label">待审核商家</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="todo-card" @click="$router.push('/admin/scenics?status=pending')">
            <div class="todo-icon warning">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ pendingScenics }}</div>
              <div class="todo-label">待审核景区</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="todo-card" @click="$router.push('/admin/reviews?status=reported')">
            <div class="todo-icon danger">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ reportedReviews }}</div>
              <div class="todo-label">举报评价</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>

        <el-col :span="6">
          <div class="todo-card" @click="$router.push('/admin/orders?status=refund')">
            <div class="todo-icon info">
              <el-icon><RefreshLeft /></el-icon>
            </div>
            <div class="todo-content">
              <div class="todo-count">{{ refundOrders }}</div>
              <div class="todo-label">待处理退款</div>
            </div>
            <el-icon class="arrow"><ArrowRight /></el-icon>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据趋势 -->
    <el-row :gutter="20" style="margin-top: 30px">
      <el-col :span="16">
        <div class="chart-card">
          <div class="card-header">
            <h3>平台营收趋势</h3>
          </div>
          <div class="chart-placeholder">
            <el-icon :size="80" color="#e5e7eb"><TrendCharts /></el-icon>
            <p>图表功能需要安装 ECharts</p>
          </div>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="chart-card">
          <div class="card-header">
            <h3>订单状态分布</h3>
          </div>
          <div class="status-list">
            <div class="status-item" v-for="item in orderStatus" :key="item.status">
              <div class="status-bar" :style="{ width: item.percent + '%', background: item.color }"></div>
              <div class="status-label">
                <span class="name">{{ item.status }}</span>
                <span class="value">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 最新动态 -->
    <div class="activity-section">
      <h2 class="section-title">最新动态</h2>
      <el-timeline>
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.time"
          placement="top"
        >
          <div class="activity-item">
            <span class="activity-type" :class="activity.type">{{ activity.typeText }}</span>
            <span class="activity-content">{{ activity.content }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Money,
  Shop,
  User,
  Document,
  CaretTop,
  Bell,
  Warning,
  ChatDotRound,
  RefreshLeft,
  ArrowRight,
  TrendCharts
} from '@element-plus/icons-vue'

// 核心数据
const totalRevenue = ref(1250000)
const totalMerchants = ref(48)
const newMerchants = ref(5)
const totalUsers = ref(12580)
const newUsers = ref(856)
const totalOrders = ref(28560)
const todayOrders = ref(356)

// 待处理事项
const pendingMerchants = ref(8)
const pendingScenics = ref(5)
const reportedReviews = ref(12)
const refundOrders = ref(6)

// 订单状态
const orderStatus = ref([
  { status: '已完成', count: 18520, percent: 65, color: '#10b981' },
  { status: '进行中', count: 6850, percent: 24, color: '#667eea' },
  { status: '已取消', count: 2140, percent: 7.5, color: '#ef4444' },
  { status: '退款中', count: 1050, percent: 3.5, color: '#f59e0b' }
])

// 最新动态
const activities = ref([
  {
    id: 1,
    type: 'merchant',
    typeText: '商家',
    content: '新商家"镇远古城管理处"提交入驻申请',
    time: '2026-09-09 15:30'
  },
  {
    id: 2,
    type: 'order',
    typeText: '订单',
    content: '订单 WD202609091256 申请退款',
    time: '2026-09-09 14:58'
  },
  {
    id: 3,
    type: 'user',
    typeText: '用户',
    content: '今日新注册用户 85 人',
    time: '2026-09-09 12:00'
  },
  {
    id: 4,
    type: 'review',
    typeText: '评价',
    content: '评价 #12580 被举报，待审核',
    time: '2026-09-09 10:25'
  }
])
</script>

<style scoped>
.admin-dashboard {
  max-width: 1800px;
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
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
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

.todo-icon.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.todo-icon.info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
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

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.card-header {
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.chart-placeholder {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
}

.status-list {
  padding: 20px 0;
}

.status-item {
  margin-bottom: 20px;
}

.status-bar {
  height: 30px;
  border-radius: 6px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.status-bar:hover {
  opacity: 0.8;
}

.status-label {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #4a5568;
}

.status-label .name {
  font-weight: 500;
}

.status-label .value {
  font-weight: 600;
}

.activity-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-top: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.activity-item {
  display: flex;
  gap: 12px;
}

.activity-type {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.activity-type.merchant {
  background: #dbeafe;
  color: #1e40af;
}

.activity-type.order {
  background: #fef3c7;
  color: #92400e;
}

.activity-type.user {
  background: #d1fae5;
  color: #065f46;
}

.activity-type.review {
  background: #fce7f3;
  color: #9f1239;
}

.activity-content {
  font-size: 14px;
  color: #4a5568;
}
</style>
