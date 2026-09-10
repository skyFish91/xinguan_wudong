<template>
  <div class="admin-users">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="用户状态">
          <el-select v-model="filters.status" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item label="注册时间">
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
            placeholder="搜索用户名/手机号/邮箱"
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
        <div class="stat-label">总用户数</div>
        <div class="stat-value">{{ totalUsers.toLocaleString() }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">今日新增</div>
        <div class="stat-value">{{ todayNew }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">本月新增</div>
        <div class="stat-value">{{ monthNew }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">已禁用</div>
        <div class="stat-value">{{ disabledUsers }}</div>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <el-table :data="userList" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户" width="250">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="40" :src="row.avatar">
                {{ row.username.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ row.username }}</div>
                <div class="user-id">ID: {{ row.id }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column label="订单数" width="100">
          <template #default="{ row }">
            <el-link type="primary">{{ row.orderCount }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="消费金额" width="120">
          <template #default="{ row }">
            <span style="color: #f59e0b; font-weight: 600">
              ¥{{ row.totalSpent.toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleView(row)">
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'active'"
              type="danger"
              size="small"
              text
              @click="handleDisable(row)"
            >
              禁用
            </el-button>
            <el-button
              v-else
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="用户详情" width="700px">
      <div v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">
            {{ currentUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentUser.status === 'active' ? 'success' : 'danger'">
              {{ currentUser.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentUser.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="邮箱">
            {{ currentUser.email }}
          </el-descriptions-item>
          <el-descriptions-item label="订单总数">
            {{ currentUser.orderCount }}
          </el-descriptions-item>
          <el-descriptions-item label="消费金额">
            ¥{{ currentUser.totalSpent.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="收藏景区">
            {{ currentUser.favoriteCount }}
          </el-descriptions-item>
          <el-descriptions-item label="评价数">
            {{ currentUser.reviewCount }}
          </el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">
            {{ currentUser.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">
            {{ currentUser.lastLoginAt }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const loading = ref(false)
const showDetailDialog = ref(false)
const currentUser = ref<any>(null)

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
const totalUsers = ref(12580)
const todayNew = ref(85)
const monthNew = ref(856)
const disabledUsers = ref(12)

const userList = ref([
  {
    id: 10001,
    username: '张三',
    phone: '138****8888',
    email: 'zhangsan@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    orderCount: 15,
    totalSpent: 2580,
    favoriteCount: 5,
    reviewCount: 8,
    status: 'active',
    createdAt: '2025-06-15 10:30:00',
    lastLoginAt: '2026-09-09 14:25:32'
  },
  {
    id: 10002,
    username: '李四',
    phone: '139****6666',
    email: 'lisi@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    orderCount: 8,
    totalSpent: 1250,
    favoriteCount: 3,
    reviewCount: 5,
    status: 'active',
    createdAt: '2025-08-20 15:20:00',
    lastLoginAt: '2026-09-08 18:45:12'
  },
  {
    id: 10003,
    username: '王五',
    phone: '136****9999',
    email: 'wangwu@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    orderCount: 3,
    totalSpent: 580,
    favoriteCount: 2,
    reviewCount: 1,
    status: 'disabled',
    createdAt: '2026-01-10 09:15:00',
    lastLoginAt: '2026-08-30 11:20:00'
  }
])

function handleFilter() {
  loading.value = true
  // TODO: 调用后端接口筛选
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleView(row: any) {
  currentUser.value = row
  showDetailDialog.value = true
}

async function handleDisable(row: any) {
  try {
    await ElMessageBox.confirm('确认禁用该用户吗？禁用后用户将无法登录。', '禁用确认', {
      type: 'warning'
    })

    // TODO: 调用后端接口
    row.status = 'disabled'
    disabledUsers.value++

    ElMessage.success('已禁用')
  } catch {}
}

async function handleEnable(row: any) {
  try {
    await ElMessageBox.confirm('确认启用该用户吗？', '启用确认', {
      type: 'success'
    })

    // TODO: 调用后端接口
    row.status = 'active'
    disabledUsers.value--

    ElMessage.success('已启用')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = userList.value.length
})
</script>

<style scoped>
.admin-users {
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

.user-list {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
