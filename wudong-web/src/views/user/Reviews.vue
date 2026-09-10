<template>
  <div class="reviews-page">
    <h2 class="page-title">我的评价</h2>

    <div class="reviews-list" v-if="myReviews.length > 0">
      <div v-for="review in myReviews" :key="review.id" class="review-card">
        <div class="review-header">
          <div class="target-info">
            <img :src="review.targetImage" @error="onImageError" />
            <div class="target-text">
              <h3>{{ review.targetName }}</h3>
              <p class="review-time">{{ review.createdAt }}</p>
            </div>
          </div>
          <el-button
            type="danger"
            text
            size="small"
            @click="handleDelete(review)"
          >
            删除
          </el-button>
        </div>

        <div class="review-body">
          <el-rate v-model="review.rating" disabled size="small" />
          <p class="review-content">{{ review.content }}</p>

          <div v-if="review.tags.length > 0" class="review-tags">
            <el-tag
              v-for="tag in review.tags"
              :key="tag"
              size="small"
              effect="plain"
            >
              {{ tag }}
            </el-tag>
          </div>

          <div v-if="review.images.length > 0" class="review-images">
            <el-image
              v-for="(img, idx) in review.images"
              :key="idx"
              :src="img"
              :preview-src-list="review.images"
              :initial-index="idx"
              fit="cover"
              class="review-image"
            />
          </div>
        </div>

        <div class="review-footer">
          <span class="likes">
            <el-icon><Star /></el-icon>
            {{ review.likes }} 人觉得有用
          </span>
        </div>
      </div>
    </div>

    <el-empty v-else description="还没有发表过评价">
      <el-button type="primary" @click="$router.push('/user/orders')">
        去我的订单
      </el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Star } from '@element-plus/icons-vue'
import { useReviewStore } from '@/stores/review'
import { useUserStore } from '@/stores/user'

const reviewStore = useReviewStore()
const userStore = useUserStore()

const myReviews = computed(() => {
  if (!userStore.userInfo) return []
  return reviewStore.getReviewsByUser(userStore.userInfo.id)
})

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"%3E%3Crect fill="%23e5e7eb" width="120" height="90"/%3E%3Ctext x="60" y="55" text-anchor="middle" font-size="30"%3E🏔️%3C/text%3E%3C/svg%3E'
}

async function handleDelete(review: any) {
  try {
    await ElMessageBox.confirm(
      '删除后将无法恢复，确定要删除这条评价吗？',
      '删除评价',
      {
        type: 'warning',
        confirmButtonText: '确认删除',
        cancelButtonText: '取消'
      }
    )
    reviewStore.deleteReview(review.id)
    ElMessage.success('已删除')
  } catch {}
}
</script>

<style scoped>
.reviews-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 24px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.review-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.target-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.target-info img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.target-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.review-time {
  font-size: 13px;
  color: #909399;
}

.review-body {
  padding: 16px 0;
  border-top: 1px solid #f1f3f5;
  border-bottom: 1px solid #f1f3f5;
}

.review-content {
  font-size: 15px;
  line-height: 1.8;
  color: #4a5568;
  margin: 12px 0;
}

.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.review-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  gap: 10px;
  margin-top: 12px;
}

.review-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  cursor: pointer;
}

.review-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.likes {
  font-size: 14px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
