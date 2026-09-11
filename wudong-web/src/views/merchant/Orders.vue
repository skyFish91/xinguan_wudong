<template>
  <div class="merchant-orders">
    <div class="page-header">
      <h1 class="page-title">订单管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部订单" value="" />
            <el-option label="待支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已使用" value="used" />
            <el-option label="已取消" value="cancelled" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>

        <el-form-item label="景区">
          <el-select v-model="filters.scenic_id" placeholder="全部景区" @change="handleFilter">
            <el-option label="全部景区" :value="0" />
            <el-option
              v-for="scenic in scenicList"
              :key="scenic.id"
              :label="scenic.name"
              :value="scenic.id"
            />
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
        <div class="stat-label">今日订单</div>
        <div class="stat-value">{{ todayOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待处理</div>
        <div class="stat-value warning">{{ pendingOrders }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">今日营收</div>
        <div class="stat-value success">¥{{ todayRevenue.toLocaleString() }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">退款订单</div>
        <div class="stat-value danger">{{ refundOrders }}</div>
      </div>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <el-table
        :data="orderList"
        v-loading="loading"
        style="width: 100%"
        :row-class-name="getRowClassName"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" fixed />

        <el-table-column label="景区信息" width="200">
          <template #default="{ row }">
            <div class="scenic-info">
              <div class="scenic-name">{{ row.scenicName }}</div>
              <div class="ticket-name">{{ row.ticketName }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="购票信息" width="150">
          <template #default="{ row }">
            <div>数量：{{ row.quantity }} 张</div>
            <div style="color: #f59e0b; font-weight: 600">
              ¥{{ (row.totalPrice / 100).toFixed(2) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="游玩日期" width="120">
          <template #default="{ row }">
            {{ row.travelDate }}
          </template>
        </el-table-column>

        <el-table-column label="联系人" width="150">
          <template #default="{ row }">
            <div>{{ row.contactName }}</div>
            <div style="font-size: 12px; color: #909399">
              {{ row.contactPhone }}
            </div>
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

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleViewDetail(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="success"
              size="small"
              text
              @click="handleVerify(row)"
            >
              核销
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="danger"
              size="small"
              text
              @click="handleRefund(row)"
            >
              退款
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

    <!-- 订单详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="订单详情" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="景区名称">
            {{ currentOrder.scenicName }}
          </el-descriptions-item>
          <el-descriptions-item label="票种">
            {{ currentOrder.ticketName }}
          </el-descriptions-item>
          <el-descriptions-item label="购买数量">
            {{ currentOrder.quantity }} 张
          </el-descriptions-item>
          <el-descriptions-item label="单价">
            ¥{{ (currentOrder.totalPrice / currentOrder.quantity / 100).toFixed(2) }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">
            <span style="color: #f59e0b; font-weight: 600; font-size: 18px">
              ¥{{ (currentOrder.totalPrice / 100).toFixed(2) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="游玩日期">
            {{ currentOrder.travelDate }}
          </el-descriptions-item>
          <el-descriptions-item label="联系人">
            {{ currentOrder.contactName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentOrder.contactPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">
            {{ currentOrder.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ currentOrder.paidAt || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentOrder.status === 'used'" class="verify-info">
          <el-alert type="success" :closable="false">
            <template #title>
              <div style="display: flex; align-items: center; gap: 10px">
                <el-icon><CircleCheck /></el-icon>
                <span>该订单已核销</span>
              </div>
            </template>
            <div>核销时间：{{ currentOrder.verifyAt || '-' }}</div>
          </el-alert>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button
          v-if="currentOrder?.status === 'paid'"
          type="success"
          @click="handleVerify(currentOrder)"
        >
          立即核销
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, CircleCheck } from '@element-plus/icons-vue'

const loading = ref(false)
const showDetailDialog = ref(false)
const currentOrder = ref<any>(null)

const filters = reactive({
  status: '',
  scenic_id: 0,
  dateRange: [],
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数据
const todayOrders = ref(86)
const pendingOrders = ref(12)
const todayRevenue = ref(15420)
const refundOrders = ref(2)

const scenicList = ref([
  { id: 1, name: '西江千户苗寨' }
])

const orderList = ref([
  {
    id: 1,
    orderNo: 'WD202609091001',
    scenicName: '西江千户苗寨',
    ticketName: '成人票',
    quantity: 2,
    totalPrice: 18000,
    travelDate: '2026-09-15',
    contactName: '张三',
    contactPhone: '138****8888',
    status: 'paid',
    createdAt: '2026-09-09 14:23:15',
    paidAt: '2026-09-09 14:25:32'
  },
  {
    id: 2,
    orderNo: 'WD202609091002',
    scenicName: '西江千户苗寨',
    ticketName: '学生票',
    quantity: 1,
    totalPrice: 4500,
    travelDate: '2026-09-15',
    contactName: '李四',
    contactPhone: '139****6666',
    status: 'paid',
    createdAt: '2026-09-09 14:18:32',
    paidAt: '2026-09-09 14:20:15'
  },
  {
    id: 3,
    orderNo: 'WD202609091003',
    scenicName: '西江千户苗寨',
    ticketName: '儿童票',
    quantity: 2,
    totalPrice: 9000,
    travelDate: '2026-09-10',
    contactName: '王五',
    contactPhone: '136****9999',
    status: 'used',
    createdAt: '2026-09-08 15:30:10',
    paidAt: '2026-09-08 15:32:45',
    verifyAt: '2026-09-10 10:15:32'
  },
  {
    id: 4,
    orderNo: 'WD202609091004',
    scenicName: '西江千户苗寨',
    ticketName: '成人票',
    quantity: 3,
    totalPrice: 27000,
    travelDate: '2026-09-16',
    contactName: '赵六',
    contactPhone: '137****7777',
    status: 'unpaid',
    createdAt: '2026-09-09 16:45:20',
    paidAt: null
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    unpaid: 'warning',
    paid: 'success',
    used: 'info',
    cancelled: 'danger',
    refunded: 'danger'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    unpaid: '待支付',
    paid: '已支付',
    used: '已使用',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return map[status]
}

function getRowClassName({ row }: any) {
  if (row.status === 'unpaid') return 'warning-row'
  if (row.status === 'refunded') return 'danger-row'
  return ''
}

function handleFilter() {
  loading.value = true
  // TODO: 调用后端接口筛选
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleViewDetail(row: any) {
  currentOrder.value = row
  showDetailDialog.value = true
}

async function handleVerify(row: any) {
  try {
    await ElMessageBox.confirm('确认核销该订单吗？核销后不可撤销。', '核销确认', {
      type: 'warning'
    })

    // TODO: 调用后端核销接口
    row.status = 'used'
    row.verifyAt = new Date().toLocaleString('zh-CN')

    ElMessage.success('核销成功！')
    showDetailDialog.value = false
  } catch {}
}

async function handleRefund(row: any) {
  try {
    await ElMessageBox.prompt('请输入退款原因', '申请退款', {
      confirmButtonText: '确认退款',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入退款原因'
    })

    // TODO: 调用后端退款接口
    row.status = 'refunded'

    ElMessage.success('退款申请已提交')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = orderList.value.length
})
</script>

<style scoped>
.merchant-orders {
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
}

.stat-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
}

.stat-value.warning {
  color: #f59e0b;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.danger {
  color: #ef4444;
}

.order-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.scenic-info .scenic-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.scenic-info .ticket-name {
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.warning-row) {
  background-color: #fef3c7;
}

:deep(.danger-row) {
  background-color: #fee2e2;
}

.order-detail {
  padding: 20px 0;
}

.verify-info {
  margin-top: 20px;
}
</style>
