<template>
  <div class="admin-merchants">
    <div class="page-header">
      <h1 class="page-title">商家管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加商家
      </el-button>
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
            <el-option label="已禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索商家名称/联系人"
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
        <div class="stat-label">总商家数</div>
        <div class="stat-value">{{ totalCount }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待审核</div>
        <div class="stat-value">{{ pendingCount }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">已通过</div>
        <div class="stat-value">{{ approvedCount }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">已禁用</div>
        <div class="stat-value">{{ disabledCount }}</div>
      </div>
    </div>

    <!-- 商家列表 -->
    <div class="merchant-list">
      <el-table :data="merchantList" v-loading="loading">
        <el-table-column prop="name" label="商家名称" width="200" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="景区数量" width="100">
          <template #default="{ row }">
            <el-link type="primary" @click="handleViewScenics(row)">
              {{ row.scenicCount }} 个
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="申请时间" width="180" />
        <el-table-column label="操作" width="300" fixed="right">
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
            <el-button
              v-if="row.status === 'approved'"
              type="warning"
              size="small"
              text
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
              v-if="row.status === 'disabled'"
              type="success"
              size="small"
              text
              @click="handleEnable(row)"
            >
              启用
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

    <!-- 商家详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="商家详情" width="700px">
      <div v-if="currentMerchant">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商家名称">
            {{ currentMerchant.name }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentMerchant.status)">
              {{ getStatusText(currentMerchant.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="联系人">
            {{ currentMerchant.contactName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ currentMerchant.contactPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">
            {{ currentMerchant.email }}
          </el-descriptions-item>
          <el-descriptions-item label="地址" :span="2">
            {{ currentMerchant.address }}
          </el-descriptions-item>
          <el-descriptions-item label="营业执照">
            {{ currentMerchant.businessLicense }}
          </el-descriptions-item>
          <el-descriptions-item label="景区数量">
            {{ currentMerchant.scenicCount }} 个
          </el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">
            {{ currentMerchant.createdAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'

const loading = ref(false)
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const currentMerchant = ref<any>(null)

const filters = reactive({
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数据
const totalCount = ref(48)
const pendingCount = ref(8)
const approvedCount = ref(36)
const disabledCount = ref(4)

const merchantList = ref([
  {
    id: 1,
    name: '西江千户苗寨管理处',
    contactName: '张经理',
    contactPhone: '138****8888',
    email: 'xijiang@example.com',
    address: '贵州省黔东南州雷山县西江镇',
    businessLicense: '520000123456789',
    scenicCount: 1,
    status: 'approved',
    createdAt: '2026-01-15 10:30:00'
  },
  {
    id: 2,
    name: '镇远古城旅游公司',
    contactName: '李总',
    contactPhone: '139****6666',
    email: 'zhenyuan@example.com',
    address: '贵州省黔东南州镇远县',
    businessLicense: '520000987654321',
    scenicCount: 2,
    status: 'pending',
    createdAt: '2026-09-08 14:20:00'
  },
  {
    id: 3,
    name: '荔波小七孔景区',
    contactName: '王主任',
    contactPhone: '136****9999',
    email: 'libo@example.com',
    address: '贵州省黔南州荔波县',
    businessLicense: '520000456789123',
    scenicCount: 1,
    status: 'approved',
    createdAt: '2026-02-20 09:15:00'
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    disabled: 'info'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    disabled: '已禁用'
  }
  return map[status]
}

function handleFilter() {
  loading.value = true
  // TODO: 调用后端接口筛选
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleView(row: any) {
  currentMerchant.value = row
  showDetailDialog.value = true
}

function handleViewScenics(row: any) {
  ElMessage.info(`查看商家 ${row.name} 的景区列表`)
  // TODO: 跳转到景区管理，筛选该商家的景区
}

async function handleApprove(row: any) {
  try {
    await ElMessageBox.confirm('确认通过该商家的入驻申请吗？', '审核确认', {
      type: 'success'
    })

    // TODO: 调用后端接口
    row.status = 'approved'
    pendingCount.value--
    approvedCount.value++

    ElMessage.success('审核通过')
  } catch {}
}

async function handleReject(row: any) {
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝申请', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入拒绝原因'
    })

    // TODO: 调用后端接口
    row.status = 'rejected'
    pendingCount.value--

    ElMessage.success('已拒绝申请')
  } catch {}
}

async function handleDisable(row: any) {
  try {
    await ElMessageBox.confirm('确认禁用该商家吗？禁用后商家将无法登录。', '禁用确认', {
      type: 'warning'
    })

    // TODO: 调用后端接口
    row.status = 'disabled'
    approvedCount.value--
    disabledCount.value++

    ElMessage.success('已禁用')
  } catch {}
}

async function handleEnable(row: any) {
  try {
    await ElMessageBox.confirm('确认启用该商家吗？', '启用确认', {
      type: 'success'
    })

    // TODO: 调用后端接口
    row.status = 'approved'
    disabledCount.value--
    approvedCount.value++

    ElMessage.success('已启用')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = merchantList.value.length
})
</script>

<style scoped>
.admin-merchants {
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

.merchant-list {
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
