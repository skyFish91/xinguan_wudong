<template>
  <div class="admin-orders">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="待支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已使用" value="used" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="退款中" value="refunding" />
            <el-option label="已退款" value="refunded" />
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
            placeholder="搜索订单号/联系人"
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

    <!-- 统计卡片 -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-label">订单总数</div>
        <div class="stat-value">{{ totalOrders.toLocaleString() }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">今日订单</div>
        <div class="stat-value">{{ todayOrders }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待处理</div>
        <div class="stat-value">{{ pendingOrders }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">退款中</div>
        <div class="stat-value">{{ refundingOrders }}</div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-table :data="orderList" v-loading="loading">
        <el-table-column prop="orderNo" label="订单号" width="180" fixed />
        <el-table-column label="景区/票种" width="200">
          <template #default="{ row }">
            <div>{{ row.scenicName }}</div>
            <div style="font-size: 12px; color: #909399">{{ row.ticketName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="购票信息" width="120">
          <template #default="{ row }">
            <div>{{ row.quantity }} 张</div>
            <div style="color: #f59e0b; font-weight: 600">
              ¥{{ (row.totalPrice / 100).toFixed(2) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系人" width="120">
          <template #default="{ row }">
            <div>{{ row.contactName }}</div>
            <div style="font-size: 12px; color: #909399">
              {{ row.contactPhone }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="所属商家" width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="下单时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'refunding'"
              type="success"
              size="small"
              text
              @click="handleApproveRefund(row)"
            >
              同意退款
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)

const filters = reactive({
  status: '',
  dateRange: [],
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数据
const totalOrders = ref(28560)
const todayOrders = ref(356)
const pendingOrders = ref(42)
const refundingOrders = ref(6)

const orderList = ref([
  {
    id: 1,
    orderNo: 'WD202609091001',
    scenicName: '西江千户苗寨',
    ticketName: '成人票',
    quantity: 2,
    totalPrice: 18000,
    contactName: '张三',
    contactPhone: '138****8888',
    merchantName: '西江千户苗寨管理处',
    status: 'paid',
    createdAt: '2026-09-09 14:23:15'
  },
  {
    id: 2,
    orderNo: 'WD202609091002',
    scenicName: '西江千户苗寨',
    ticketName: '学生票',
    quantity: 1,
    totalPrice: 4500,
    contactName: '李四',
    contactPhone: '139****6666',
    merchantName: '西江千户苗寨管理处',
    status: 'used',
    createdAt: '2026-09-09 14:18:32'
  },
  {
    id: 3,
    orderNo: 'WD202609091003',
    scenicName: '荔波小七孔',
    ticketName: '成人票',
    quantity: 3,
    totalPrice: 27000,
    contactName: '王五',
    contactPhone: '136****9999',
    merchantName: '荔波小七孔景区',
    status: 'refunding',
    createdAt: '2026-09-08 10:30:00'
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    unpaid: 'info',
    paid: 'success',
    used: '',
    cancelled: 'danger',
    refunding: 'warning',
    refunded: 'info'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    unpaid: '待支付',
    paid: '已支付',
    used: '已使用',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }
  return map[status]
}

function handleFilter() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleView(row: any) {
  ElMessage.info(`查看订单详情：${row.orderNo}`)
}

async function handleApproveRefund(row: any) {
  try {
    await ElMessageBox.confirm('确认同意该订单的退款申请吗？', '退款确认', {
      type: 'warning'
    })

    row.status = 'refunded'
    refundingOrders.value--

    ElMessage.success('退款已处理')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = orderList.value.length
})
</script>

<style scoped>
.admin-orders {
  max-width: 1800px;
}

.page-header {
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
}

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
  border-left: 4px solid #667eea;
}

.stat-card.success {
  border-left-color: #10b981;
}

.stat-card.warning {
  border-left-color: #f59e0b;
}

.stat-card.danger {
  border-left-color: #ef4444;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #2d3748;
}

.order-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
