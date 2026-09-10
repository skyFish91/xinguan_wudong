<template>
  <div class="routes-page">
    <TopNav />

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">旅行路线</h1>
        <p class="page-description">专业向导带你深度探索苗寨文化</p>
      </div>

      <!-- 搜索与筛选 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="keyword"
            placeholder="搜索路线"
            class="search-input"
            clearable
            @keyup.enter="load(1)"
          />
          <el-select v-model="days" placeholder="全部天数" clearable class="days-select" @change="load(1)">
            <el-option label="1 日游" :value="1" />
            <el-option label="2 日游" :value="2" />
            <el-option label="3 日游" :value="3" />
            <el-option label="4 日游" :value="4" />
            <el-option label="5+ 日游" :value="5" />
          </el-select>
          <el-button type="primary" @click="load(1)">搜索</el-button>
        </div>
      </div>

      <!-- 路线列表 -->
      <el-empty v-if="!loading && !list.length" description="暂无路线" />

      <div v-else class="routes-list">
        <div
          v-for="r in list"
          :key="r.id"
          class="route-item"
          @click="$router.push(`/travel/routes/${r.id}`)"
        >
          <div class="route-image">
            <img :src="r.mainImage" />
            <div class="days-badge">{{ r.days }} 天</div>
          </div>
          <div class="route-info">
            <h3 class="route-title">{{ r.title }}</h3>
            <p class="route-detail">
              <span>{{ r.departFrom || '贵阳' }} 出发</span>
              <span class="separator">·</span>
              <span>{{ r.dest || '乌东苗寨' }}</span>
            </p>
            <div class="route-tags" v-if="splitTags(r.themes).length">
              <span
                v-for="(tag, idx) in splitTags(r.themes).slice(0, 3)"
                :key="idx"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="route-footer">
              <div class="price-box">
                <span class="price">¥{{ r.price }}</span>
                <span class="unit">/人</span>
              </div>
              <span class="participants">{{ r.sales || 0 }} 人已报名</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="load"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const keyword = ref('');
const days = ref<number | undefined>(undefined);
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 8;
const loading = ref(false);

function splitTags(tags: string) {
  return tags ? tags.split(',').filter(t => t) : [];
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/travel/routes', {
      params: {
        days: days.value,
        keyword: keyword.value || undefined,
        page: page.value,
        pageSize,
      },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

onMounted(() => load());
</script>

<style scoped>
.routes-page {
  background: #ffffff;
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 400;
  color: #333;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.page-description {
  font-size: 14px;
  color: #999;
  font-weight: 300;
}

/* 工具栏 */
.toolbar {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #e5e5e5 inset;
}

.days-select {
  width: 140px;
}

.days-select :deep(.el-input__wrapper) {
  border-radius: 4px;
}

/* 路线列表 */
.routes-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.route-item {
  display: flex;
  gap: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 16px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.route-item:hover {
  transform: translateY(-2px);
  border-color: #e5e5e5;
  background: #fafafa;
}

.route-image {
  position: relative;
  width: 320px;
  height: 240px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f9f9f9;
  border-radius: 4px;
}

.route-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.route-item:hover .route-image img {
  transform: scale(1.05);
}

.days-badge {
  position: absolute;
  bottom: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  color: #fff;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
}

.route-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.route-title {
  font-size: 20px;
  font-weight: 400;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

.route-detail {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.separator {
  margin: 0 8px;
  color: #ddd;
}

.route-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: auto;
  padding-bottom: 16px;
}

.tag {
  font-size: 12px;
  color: #666;
  padding: 4px 12px;
  background: #f9f9f9;
  border-radius: 2px;
}

.route-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 24px;
  font-weight: 500;
  color: #8b7355;
}

.unit {
  font-size: 13px;
  color: #999;
}

.participants {
  font-size: 13px;
  color: #999;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  margin: 0 4px;
  min-width: 32px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #8b7355;
  color: #fff;
}

:deep(.el-pagination button) {
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar-left {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .route-item {
    flex-direction: column;
    gap: 16px;
  }

  .route-image {
    width: 100%;
    height: 200px;
  }
}
</style>
