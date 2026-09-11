<template>
  <div class="admin-scenics">
    <div class="page-header">
      <h1 class="page-title">景区管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="审核状态">
          <el-select v-model="filters.status" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属商家">
          <el-select v-model="filters.merchant_id" placeholder="全部商家" @change="handleFilter" clearable>
            <el-option
              v-for="merchant in merchantList"
              :key="merchant.id"
              :label="merchant.name"
              :value="merchant.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索景区名称"
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
        <div class="stat-label">总景区数</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ pendingCount }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">已上线</div>
        <div class="stat-value">{{ approvedCount }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">已下架</div>
        <div class="stat-value">{{ rejectedCount }}</div>
      </div>
    </div>

    <!-- 景区列表 -->
    <div class="scenic-list">
      <el-table :data="scenicList" v-loading="loading">
        <el-table-column label="景区信息" width="300">
          <template #default="{ row }">
            <div class="scenic-cell">
              <img :src="row.main_image" class="scenic-image" />
              <div class="scenic-info">
                <div class="scenic-name">{{ row.name }}</div>
                <div class="scenic-address">{{ row.address }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="merchantName" label="所属商家" width="150" />
        <el-table-column prop="open_time" label="开放时间" width="150" />
        <el-table-column label="票种数量" width="100">
          <template #default="{ row }">
            <el-link type="primary">{{ row.ticketCount }} 种</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" width="180" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="success"
              size="small"
              text
              @click="handleApprove(row)"
            >
              通过
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="danger"
              size="small"
              text
              @click="handleReject(row)"
            >
              拒绝
            </el-button>
            <el-button type="primary" size="small" text @click="handleView(row)">
              查看详情
            </el-button>
            <el-button type="warning" size="small" text @click="handleEdit(row)">
              编辑
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
  merchant_id: null,
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数据
const totalCount = ref(156)
const pendingCount = ref(5)
const approvedCount = ref(148)
const rejectedCount = ref(3)

const merchantList = ref([
  { id: 1, name: '西江千户苗寨管理处' },
  { id: 2, name: '镇远古城旅游公司' },
  { id: 3, name: '荔波小七孔景区' }
])

const scenicList = ref([
  {
    id: 1,
    name: '西江千户苗寨',
    address: '贵州省黔东南州雷山县西江镇',
    main_image: '/images/travel/1.jpg',
    merchantName: '西江千户苗寨管理处',
    open_time: '08:00-22:00',
    ticketCount: 4,
    status: 'approved',
    createdAt: '2026-01-20 10:30:00'
  },
  {
    id: 2,
    name: '镇远古城',
    address: '贵州省黔东南州镇远县',
    main_image: '/images/travel/2.jpg',
    merchantName: '镇远古城旅游公司',
    open_time: '全天开放',
    ticketCount: 2,
    status: 'pending',
    createdAt: '2026-09-08 15:20:00'
  },
  {
    id: 3,
    name: '荔波小七孔',
    address: '贵州省黔南州荔波县',
    main_image: '/images/travel/3.jpg',
    merchantName: '荔波小七孔景区',
    open_time: '07:30-18:00',
    ticketCount: 3,
    status: 'approved',
    createdAt: '2026-02-15 09:15:00'
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已上线',
    rejected: '已下架'
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
  ElMessage.info(`查看景区详情：${row.name}`)
}

function handleEdit(row: any) {
  ElMessage.info(`编辑景区：${row.name}`)
}

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm('确认通过该景区的审核吗？', '审核确认', {
      type: 'success'
    })

    row.status = 'approved'
    pendingCount.value--
    approvedCount.value++

    ElMessage.success('审核通过')
  } catch {}
}

async function handleReject(row: any) {
  try {
    await ElMessageBox.prompt('请输入拒绝原因', '拒绝审核', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })

    row.status = 'rejected'
    pendingCount.value--
    rejectedCount.value++

    ElMessage.success('已拒绝')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = scenicList.value.length
})
</script>

<style scoped>
.admin-scenics {
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

.stat-card.warning {
  border-left-color: #f59e0b;
}

.stat-card.success {
  border-left-color: #10b981;
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

.scenic-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.scenic-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}

.scenic-image {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.scenic-info {
  flex: 1;
}

.scenic-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.scenic-address {
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
