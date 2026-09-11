<template>
  <div class="scenic-list-page">
    <!-- 顶部横幅 -->
    <div class="page-header">
      <div class="header-bg"></div>
      <div class="header-content">
        <h1 class="page-title">🏞️ 探索热门景区</h1>
        <p class="page-subtitle">发现黔东南的美丽风光</p>
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
            :key="tag"
            :class="['filter-tag', { active: selectedTag === tag }]"
            @click="selectedTag = selectedTag === tag ? '' : tag"
          >
            {{ tag }}
          </button>
        </div>
        <div class="view-controls">
          <span class="result-count">共 {{ list.length }} 个景区</span>
        </div>
      </div>

      <!-- 景区网格 -->
      <div class="scenic-grid" v-loading="loading">
        <div
          v-for="item in list"
          :key="item.id"
          class="scenic-card"
          @click="$router.push(`/scenic/${item.id}`)"
        >
          <div class="card-image-wrapper">
            <img :src="item.main_image || getDefaultScenicImage(item.name)" :alt="item.name" class="card-image" />
            <div class="card-badge">热门</div>
            <div class="card-overlay"></div>
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.name }}</h3>
            <div class="card-address">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ item.address }}
            </div>
            <p class="card-intro">{{ item.intro }}</p>
            <div class="card-footer">
              <div class="card-tags">
                <span class="tag">⏰ {{ item.open_time || '全天开放' }}</span>
              </div>
              <div class="card-action">
                <span class="action-text">查看详情</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && list.length === 0" class="empty-state">
        <div class="empty-icon">🏔️</div>
        <h3>暂无景区</h3>
        <p>敬请期待更多精彩景区</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { scenicApi } from '@/api'
import { scenicImageMap } from '@/config/images'

const loading = ref(false)
const allScenics = ref<any[]>([])
const selectedTag = ref('')
const filterTags = ['全部', '自然风光', '民族文化', '古镇古村', '亲子游', '摄影胜地']

// 根据选中的标签筛选景区
const list = computed(() => {
  if (!selectedTag.value || selectedTag.value === '全部') {
    return allScenics.value
  }

  // 根据标签进行关键词匹配
  const tagKeywords: Record<string, string[]> = {
    '自然风光': ['山', '水', '瀑布', '峡谷', '森林', '七小孔', '梵净山', '黄果树', '万峰林', '赤水', '马岭河', '天河潭'],
    '民族文化': ['苗寨', '侗寨', '古镇', '古城', '民族', '西江', '肇兴', '镇远', '青岩'],
    '古镇古村': ['古镇', '古城', '古村', '镇远', '青岩'],
    '亲子游': ['公园', '乐园', '黔灵山', '天河潭'],
    '摄影胜地': ['苗寨', '梵净山', '荔波', '万峰林', '黄果树', '镇远', '赤水']
  }

  const keywords = tagKeywords[selectedTag.value] || []
  return allScenics.value.filter(scenic => {
    return keywords.some(keyword => scenic.name?.includes(keyword))
  })
})

function getDefaultScenicImage(name: string) {
  // 根据景区名称匹配图片
  for (const [key, imagePath] of Object.entries(scenicImageMap)) {
    if (name.includes(key)) {
      return imagePath
    }
  }
  // 如果没有匹配到，返回默认图片
  return '/images/scenic/千户苗寨.jpg'
}

async function loadList() {
  loading.value = true
  try {
    const res = await scenicApi.list({ size: 100 })
    allScenics.value = res.data.data.list
  } finally {
    loading.value = false
  }
}

onMounted(() => loadList())
</script>

<style scoped>
.scenic-list-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  position: relative;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)),
              url('/images/background/景区背景图.jpg') center/cover no-repeat;
  padding: 80px 20px 100px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="15" fill="white" opacity="0.1"/><circle cx="60" cy="30" r="20" fill="white" opacity="0.08"/><circle cx="80" cy="70" r="25" fill="white" opacity="0.05"/></svg>') repeat;
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-20px) translateY(-20px); }
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

/* 景区网格 */
.scenic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 30px;
}

.scenic-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.scenic-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-image-wrapper {
  position: relative;
  overflow: hidden;
  height: 240px;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.scenic-card:hover .card-image {
  transform: scale(1.1);
}

.card-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 87, 34, 0.4);
  z-index: 2;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}

.card-body {
  padding: 25px;
}

.card-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-address {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-address svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.card-intro {
  color: #4a5568;
  font-size: 14px;
  line-height: 1.7;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.card-tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.scenic-card:hover .card-action {
  transform: translateX(5px);
}

.card-action svg {
  width: 18px;
  height: 18px;
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

  .scenic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
