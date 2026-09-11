<template>
  <div class="route-list-page">
    <!-- 顶部横幅 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">🗺️ 精选旅游路线</h1>
        <p class="page-subtitle">专业策划 · 轻松出游 · 深度体验</p>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path fill="#f8f9fa" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </div>

    <div class="container">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-tags">
          <button
            v-for="tag in filterTags"
            :key="tag.label"
            :class="['filter-tag', { active: selectedDays === tag.days }]"
            @click="selectedDays = selectedDays === tag.days ? null : tag.days"
          >
            {{ tag.label }}
          </button>
        </div>
        <div class="view-controls">
          <span class="result-count">共 {{ list.length }} 条路线</span>
        </div>
      </div>

      <!-- 路线网格 -->
      <div class="route-grid" v-loading="loading">
        <div
          v-for="(item, index) in list"
          :key="item.id"
          class="route-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="$router.push(`/route/${item.id}`)"
        >
          <div class="card-number">{{ index + 1 }}</div>
          <div class="card-image-wrapper">
            <img :src="item.main_image || getDefaultRouteImage(item.title)" :alt="item.title" class="card-image" />
            <div class="card-badges">
              <span class="badge-days">{{ item.days }}日游</span>
              <span class="badge-theme">{{ item.theme || '深度游' }}</span>
            </div>
            <div class="card-overlay"></div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <div class="card-route">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ item.departure || '贵阳' }} → {{ item.destination || '黔东南' }}</span>
            </div>
            <div class="card-features">
              <div class="feature-item">
                <span class="feature-icon">🏨</span>
                <span class="feature-text">住宿</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🚗</span>
                <span class="feature-text">交通</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🍜</span>
                <span class="feature-text">餐饮</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎫</span>
                <span class="feature-text">门票</span>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-price">
                <span class="price-label">起价</span>
                <span class="price-value">¥{{ (item.price / 100).toFixed(0) }}</span>
                <span class="price-unit">/人</span>
              </div>
              <button class="btn-book">立即预订 →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">🗺️</div>
        <h3>暂无路线</h3>
        <p>敬请期待更多精彩路线</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { routeApi } from '@/api'
import { routeImageMap } from '@/config/images'

const loading = ref(false)
const allRoutes = ref<any[]>([])
const selectedDays = ref<number | null>(null)
const filterTags = [
  { label: '全部路线', days: null },
  { label: '1-2日游', days: 2 },
  { label: '3-4日游', days: 4 },
  { label: '5日游+', days: 5 }
]

// 根据选中的天数筛选路线
const list = computed(() => {
  if (selectedDays.value === null) {
    return allRoutes.value
  }
  return allRoutes.value.filter(route => {
    if (selectedDays.value === 2) {
      return route.days <= 2
    } else if (selectedDays.value === 4) {
      return route.days >= 3 && route.days <= 4
    } else if (selectedDays.value === 5) {
      return route.days >= 5
    }
    return true
  })
})

function getDefaultRouteImage(title: string) {
  // 根据路线标题匹配图片
  for (const [key, imagePath] of Object.entries(routeImageMap)) {
    if (title.includes(key)) {
      return imagePath
    }
  }
  // 如果没有匹配到，返回默认图片
  return '/images/route/苗岭徒步一日游.jpg'
}

async function loadList() {
  loading.value = true
  try {
    const res = await routeApi.list({ size: 100 })
    allRoutes.value = res.data.data.list
  } finally {
    loading.value = false
  }
}

onMounted(() => loadList())
</script>

<style scoped>
.route-list-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  position: relative;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)),
              url('/images/background/路线背景图.jpg') center/cover no-repeat;
  padding: 80px 20px 100px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10,50 Q30,30 50,50 T90,50" fill="none" stroke="white" stroke-width="0.5" opacity="0.2"/><path d="M20,60 Q40,40 60,60 T100,60" fill="none" stroke="white" stroke-width="0.5" opacity="0.15"/></svg>') repeat;
  opacity: 0.3;
  animation: float 25s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-30px) translateY(-20px); }
}

.header-content {
  position: relative;
  text-align: center;
  color: white;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.page-subtitle {
  font-size: 20px;
  opacity: 0.95;
}

.header-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.header-wave svg {
  display: block;
  width: 100%;
  height: auto;
}

/* 容器 */
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px 30px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 20px;
}

.filter-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 10px 24px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

.filter-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.result-count {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

/* 路线网格 */
.route-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 35px;
}

.route-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s;
  position: relative;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.route-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-number {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: #667eea;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.card-image-wrapper {
  position: relative;
  height: 260px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.route-card:hover .card-image {
  transform: scale(1.1);
}

.card-badges {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  z-index: 2;
}

.badge-days {
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
}

.badge-theme {
  background: rgba(255, 255, 255, 0.95);
  color: #2d3748;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
}

.card-body {
  padding: 25px;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-route {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 20px;
}

.card-route svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.card-features {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.feature-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.feature-text {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.price-label {
  font-size: 14px;
  color: #718096;
}

.price-value {
  font-size: 32px;
  font-weight: 800;
  color: #e53e3e;
}

.price-unit {
  font-size: 14px;
  color: #718096;
}

.btn-book {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-book:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 24px;
  color: #2d3748;
  margin-bottom: 10px;
}

.empty-state p {
  font-size: 16px;
  color: #718096;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .filter-bar {
    padding: 15px 20px;
  }

  .route-grid {
    grid-template-columns: 1fr;
  }

  .card-features {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
