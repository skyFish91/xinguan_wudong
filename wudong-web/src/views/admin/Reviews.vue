<template>
  <div class="admin-reviews">
    <div class="page-header">
      <h1 class="page-title">评价管理</h1>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="评价状态">
          <el-select v-model="filters.status" placeholder="全部状态" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="已举报" value="reported" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
        </el-form-item>

        <el-form-item label="评分">
          <el-select v-model="filters.rating" placeholder="全部评分" @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="5星" :value="5" />
            <el-option label="4星" :value="4" />
            <el-option label="3星" :value="3" />
            <el-option label="2星" :value="2" />
            <el-option label="1星" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="filters.keyword"
            placeholder="搜索景区/用户"
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
        <div class="stat-label">评价总数</div>
        <div class="stat-value">{{ totalReviews.toLocaleString() }}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">平均评分</div>
        <div class="stat-value">{{ avgRating }}</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-label">待处理举报</div>
        <div class="stat-value">{{ reportedReviews }}</div>
      </div>
      <div class="stat-card danger">
        <div class="stat-label">已隐藏</div>
        <div class="stat-value">{{ hiddenReviews }}</div>
      </div>
    </div>

    <!-- 评价列表 -->
    <div class="review-list">
      <div
        v-for="review in reviewList"
        :key="review.id"
        class="review-item"
        :class="{ reported: review.status === 'reported' }"
      >
        <div class="review-header">
          <div class="user-info">
            <el-avatar :src="review.userAvatar">
              {{ review.username.charAt(0) }}
            </el-avatar>
            <div class="user-detail">
              <div class="username">{{ review.username }}</div>
              <el-rate v-model="review.rating" disabled size="small" />
            </div>
          </div>
          <div class="review-meta">
            <el-tag :type="getStatusType(review.status)">
              {{ getStatusText(review.status) }}
            </el-tag>
            <span class="review-time">{{ review.createdAt }}</span>
          </div>
        </div>

        <div class="review-content">
          <div class="scenic-name">
            <el-icon><MapLocation /></el-icon>
            {{ review.scenicName }}
          </div>
          <p class="review-text">{{ review.content }}</p>
          <div v-if="review.images && review.images.length > 0" class="review-images">
            <img v-for="(img, idx) in review.images" :key="idx" :src="img" />
          </div>
        </div>

        <div v-if="review.reportReason" class="report-info">
          <el-alert type="warning" :closable="false">
            <template #title>
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon><Warning /></el-icon>
                <span>举报原因：{{ review.reportReason }}</span>
              </div>
            </template>
          </el-alert>
        </div>

        <div class="review-actions">
          <el-button
            v-if="review.status === 'reported'"
            type="success"
            size="small"
            @click="handleApprove(review)"
          >
            通过审核
          </el-button>
          <el-button
            v-if="review.status === 'normal' || review.status === 'reported'"
            type="danger"
            size="small"
            @click="handleHide(review)"
          >
            隐藏评价
          </el-button>
          <el-button
            v-if="review.status === 'hidden'"
            type="primary"
            size="small"
            @click="handleShow(review)"
          >
            恢复显示
          </el-button>
          <el-button size="small" @click="handleViewDetail(review)">
            查看详情
          </el-button>
        </div>
      </div>

      <el-empty v-if="reviewList.length === 0" description="暂无评价数据" />

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
import { Search, MapLocation, Warning } from '@element-plus/icons-vue'

const loading = ref(false)

const filters = reactive({
  status: '',
  rating: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数据
const totalReviews = ref(8526)
const avgRating = ref(4.6)
const reportedReviews = ref(12)
const hiddenReviews = ref(38)

const reviewList = ref([
  {
    id: 1,
    username: '旅行达人小李',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1',
    scenicName: '西江千户苗寨',
    rating: 5,
    content: '夜景太美了！万家灯火点亮山谷，仿佛置身仙境。苗族的文化体验也很棒，推荐大家一定要住一晚。',
    images: [],
    status: 'normal',
    reportReason: null,
    createdAt: '2026-09-09 10:30:00'
  },
  {
    id: 2,
    username: '摄影师老王',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
    scenicName: '西江千户苗寨',
    rating: 5,
    content: '作为摄影师，这里是我拍过最美的古寨之一。清晨的薄雾、傍晚的霞光、夜晚的灯火，每个时刻都值得记录。',
    images: [],
    status: 'normal',
    reportReason: null,
    createdAt: '2026-09-08 15:20:00'
  },
  {
    id: 3,
    username: '匿名用户',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
    scenicName: '荔波小七孔',
    rating: 1,
    content: '完全是虚假宣传，景色一般，人超级多，体验极差！',
    images: [],
    status: 'reported',
    reportReason: '恶意差评',
    createdAt: '2026-09-07 18:45:00'
  },
  {
    id: 4,
    username: '违规用户',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4',
    scenicName: '镇远古城',
    rating: 1,
    content: '这条评价包含不当内容已被隐藏',
    images: [],
    status: 'hidden',
    reportReason: null,
    createdAt: '2026-09-06 12:30:00'
  }
])

function getStatusType(status: string) {
  const map: Record<string, any> = {
    normal: 'success',
    reported: 'warning',
    hidden: 'danger'
  }
  return map[status]
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    normal: '正常',
    reported: '已举报',
    hidden: '已隐藏'
  }
  return map[status]
}

function handleFilter() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

function handleViewDetail(review: any) {
  ElMessage.info(`查看评价详情：${review.id}`)
}

async function handleApprove(review: any) {
  try {
    await ElMessageBox.confirm('确认该评价正常，通过审核吗？', '审核确认', {
      type: 'success'
    })

    review.status = 'normal'
    review.reportReason = null
    reportedReviews.value--

    ElMessage.success('审核通过')
  } catch {}
}

async function handleHide(review: any) {
  try {
    await ElMessageBox.prompt('请输入隐藏原因', '隐藏评价', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '请输入隐藏原因'
    })

    review.status = 'hidden'
    if (review.reportReason) reportedReviews.value--
    hiddenReviews.value++

    ElMessage.success('已隐藏该评价')
  } catch {}
}

async function handleShow(review: any) {
  try {
    await ElMessageBox.confirm('确认恢复显示该评价吗？', '恢复确认', {
      type: 'warning'
    })

    review.status = 'normal'
    hiddenReviews.value--

    ElMessage.success('已恢复显示')
  } catch {}
}

onMounted(() => {
  handleFilter()
  pagination.total = reviewList.value.length
})
</script>

<style scoped>
.admin-reviews {
  max-width: 1600px;
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

.review-list {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.review-item {
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.review-item:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.review-item.reported {
  border-color: #f59e0b;
  background: #fffbeb;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.user-detail {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.review-time {
  font-size: 13px;
  color: #a0aec0;
}

.review-content {
  margin-bottom: 15px;
}

.scenic-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #667eea;
  margin-bottom: 10px;
}

.review-text {
  font-size: 15px;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  gap: 10px;
}

.review-images img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.report-info {
  margin-bottom: 15px;
}

.review-actions {
  display: flex;
  gap: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
