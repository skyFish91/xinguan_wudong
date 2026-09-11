<template>
  <div class="admin-finance">
    <div class="page-header">
      <h1 class="page-title">财务管理</h1>
      <el-button type="primary" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出报表
      </el-button>
    </div>

    <!-- 核心数据卡片 -->
    <div class="stats-grid">
      <div class="stat-card primary">
        <div class="stat-icon">
          <el-icon><Money /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">平台总收入</div>
          <div class="stat-value">¥{{ totalRevenue.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较上月 +15.8%
          </div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">
          <el-icon><Wallet /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">平台佣金</div>
          <div class="stat-value">¥{{ platformCommission.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较上月 +18.2%
          </div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">
          <el-icon><CreditCard /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">商家分成</div>
          <div class="stat-value">¥{{ merchantShare.toLocaleString() }}</div>
          <div class="stat-trend up">
            <el-icon><CaretTop /></el-icon>
            较上月 +14.5%
          </div>
        </div>
      </div>

      <div class="stat-card danger">
        <div class="stat-icon">
          <el-icon><RefreshLeft /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">退款总额</div>
          <div class="stat-value">¥{{ refundAmount.toLocaleString() }}</div>
          <div class="stat-trend down">
            <el-icon><CaretBottom /></el-icon>
            较上月 -5.2%
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="交易类型">
          <el-select v-model="filters.type" placeholder="全部类型" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="订单收入" value="income" />
            <el-option label="退款支出" value="refund" />
            <el-option label="商家结算" value="settlement" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="handleFilter"
          />
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索订单号/商家"
            clearable
            @clear="handleFilter"
          >
            <template #append>
              <el-button @click="handleFilter">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <!-- 财务流水 -->
    <div class="transaction-list">
      <h2 class="section-title">财务流水</h2>
      <el-table :data="transactionList" v-loading="loading">
        <el-table-column prop="transactionNo" label="流水号" width="200" />
        <el-table-column label="交易类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeText(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderNo" label="关联订单" width="180" />
        <el-table-column prop="merchantName" label="商家" width="150" />
        <el-table-column label="交易金额" width="150">
          <template #default="{ row }">
            <span :class="row.type === 'refund' ? 'amount-out' : 'amount-in'">
              {{ row.type === 'refund' ? '-' : '+' }}¥{{ (row.amount / 100).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="平台收益" width="120">
          <template #default="{ row }">
            <span class="commission">
              ¥{{ (row.commission / 100).toFixed(2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="交易时间" width="180" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status === 'completed' ? '已完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleFilter"
          @current-change="handleFilter"
        />
      </div>
    </div>

    <!-- 商家结算 -->
    <div class="settlement-section">
      <h2 class="section-title">商家结算管理</h2>
      <el-table :data="settlementList">
        <el-table-column prop="merchantName" label="商家名称" width="200" />
        <el-table-column label="待结算金额" width="150">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 600">
              ¥{{ row.pendingAmount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="已结算金额" width="150">
          <template #default="{ row }">
            <span style="color: #10b981">
              ¥{{ row.settledAmount.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastSettlementAt" label="上次结算时间" width="180" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :disabled="row.pendingAmount === 0"
              @click="handleSettle(row)"
            >
              立即结算
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Money,
  Wallet,
  CreditCard,
  RefreshLeft,
  CaretTop,
  CaretBottom,
  Download,
  Search
} from '@element-plus/icons-vue'

const loading = ref(false)

const filters = reactive({
  type: '',
  dateRange: [],
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 核心数据
const totalRevenue = ref(1250000)
const platformCommission = ref(187500)
const merchantShare = ref(1062500)
const refundAmount = ref(28500)

const transactionList = ref([
  {
    id: 1,
    transactionNo: 'TXN202609091001',
    type: 'income',
    orderNo: 'WD202609091001',
    merchantName: '西江千户苗寨管理处',
    amount: 18000,
    commission: 2700,
    status: 'completed',
    createdAt: '2026-09-09 14:25:32'
  },
  {
    id: 2,
    transactionNo: 'TXN202609091002',
    type: 'income',
    orderNo: 'WD202609091002',
    merchantName: '西江千户苗寨管理处',
    amount: 4500,
    commission: 675,
    status: 'completed',
    createdAt: '2026-09-09 14:20:15'
  },
  {
    id: 3,
    transactionNo: 'TXN202609091003',
    type: 'refund',
    orderNo: 'WD202609081256',
    merchantName: '荔波小七孔景区',
    amount: 9000,
    commission: -1350,
    status: 'completed',
    createdAt: '2026-09-09 10:30:00'
  },
  {
    id: 4,
    transactionNo: 'TXN202609081001',
    type: 'settlement',
    orderNo: '-',
    merchantName: '西江千户苗寨管理处',
    amount: 85000,
    commission: 0,
    status: 'completed',
    createdAt: '2026-09-08 16:00:00'
  }
])

const settlementList = ref([
  {
    id: 1,
    merchantName: '西江千户苗寨管理处',
    pendingAmount: 45000,
    settledAmount: 385000,
    lastSettlementAt: '2026-09-08 16:00:00'
  },
  {
    id: 2,
    merchantName: '荔波小七孔景区',
    pendingAmount: 28000,
    settledAmount: 256000,
    lastSettlementAt: '2026-09-05 16:00:00'
  },
  {
    id: 3,
    merchantName: '镇远古城旅游公司',
    pendingAmount: 0,
    settledAmount: 182000,
    lastSettlementAt: '2026-09-09 10:00:00'
  }
])

function getTypeTag(type: string) {
  const map: Record<string, any> = {
    income: 'success',
    refund: 'danger',
    settlement: 'warning'
  }
  return map[type]
}

function getTypeText(type: string) {
  const map: Record<string, string> = {
    income: '订单收入',
    refund: '退款支出',
    settlement: '商家结算'
  }
  return map[type]
}

function handleFilter() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleViewDetail(row: any) {
  ElMessage.info(`查看流水详情：${row.transactionNo}`)
}

function handleExport() {
  ElMessage.success('导出成功（演示）')
}

async function handleSettle(row: any) {
  try {
    await ElMessageBox.confirm(
      `确认为商家 ${row.merchantName} 结算 ¥${row.pendingAmount.toLocaleString()} 吗？`,
      '结算确认',
      { type: 'warning' }
    )

    row.settledAmount += row.pendingAmount
    row.pendingAmount = 0
    row.lastSettlementAt = new Date().toLocaleString('zh-CN')

    ElMessage.success('结算成功')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = transactionList.value.length
})
</script>

<style scoped>
.admin-finance {
  max-width: 1800px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
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

.stat-card.danger .stat-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.transaction-list,
.settlement-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.amount-in {
  color: #10b981;
  font-weight: 600;
  font-size: 16px;
}

.amount-out {
  color: #ef4444;
  font-weight: 600;
  font-size: 16px;
}

.commission {
  color: #667eea;
  font-weight: 600;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
