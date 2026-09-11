<template>
  <div class="hotel-list-page">
    <TopNav />

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">精品民宿</h1>
        <p class="page-description">体验吊脚楼建筑，感受苗寨生活</p>
      </div>

      <!-- 搜索与筛选 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="keyword"
            placeholder="搜索民宿名称或地址"
            class="search-input"
            clearable
            @keyup.enter="load(1)"
          />
          <el-button type="primary" @click="load(1)">搜索</el-button>
        </div>
        <div class="toolbar-right">
          <div class="price-filter">
            <span class="filter-label">价格</span>
            <el-input-number
              v-model="minPrice"
              :min="0"
              :max="9999"
              :controls="false"
              placeholder="最低"
              class="price-input"
            />
            <span class="separator">-</span>
            <el-input-number
              v-model="maxPrice"
              :min="0"
              :max="9999"
              :controls="false"
              placeholder="最高"
              class="price-input"
            />
          </div>
          <el-radio-group v-model="sort" size="small" @change="load(1)">
            <el-radio-button value="rating">评分</el-radio-button>
            <el-radio-button value="price_asc">价格升序</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 民宿列表 -->
      <el-empty v-if="!loading && !list.length" description="暂无民宿" />

      <div v-else class="homestay-grid">
        <div
          v-for="h in list"
          :key="h.id"
          class="homestay-item"
          @click="$router.push(`/hotel/${h.id}`)"
        >
          <div class="homestay-image">
            <img :src="h.mainImage" />
            <div class="rating-badge">{{ h.rating || '4.8' }}</div>
          </div>
          <div class="homestay-info">
            <h3 class="homestay-name">{{ h.name }}</h3>
            <p class="homestay-address">{{ h.address }}</p>
            <div class="homestay-tags" v-if="splitTags(h.styleTags).length">
              <span
                v-for="(tag, idx) in splitTags(h.styleTags).slice(0, 3)"
                :key="idx"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            <div class="homestay-footer">
              <div class="price-box">
                <span class="price">¥{{ h.minPrice }}</span>
                <span class="unit">起/晚</span>
              </div>
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
const minPrice = ref<number | undefined>(undefined);
const maxPrice = ref<number | undefined>(undefined);
const sort = ref('rating');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

function splitTags(tags: string) {
  return tags ? tags.split(',').filter(t => t) : [];
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/hotel/homestays', {
      params: {
        keyword: keyword.value || undefined,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        sort: sort.value,
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
.hotel-list-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-input {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #e5e5e5 inset;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  color: #666;
}

.price-input {
  width: 100px;
}

.price-input :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.separator {
  color: #999;
}

:deep(.el-radio-button__inner) {
  border-radius: 0;
  border-color: #e5e5e5;
  padding: 8px 16px;
  font-size: 13px;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #8b7355;
  border-color: #8b7355;
  color: #fff;
}

/* 民宿网格 */
.homestay-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 48px;
}

.homestay-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.homestay-item:hover {
  transform: translateY(-4px);
}

.homestay-image {
  position: relative;
  width: 100%;
  padding-bottom: 66.67%;
  overflow: hidden;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 12px;
}

.homestay-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.homestay-item:hover .homestay-image img {
  transform: scale(1.05);
}

.rating-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.homestay-info {
  padding: 0 4px;
}

.homestay-name {
  font-size: 16px;
  font-weight: 400;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.homestay-address {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.homestay-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  min-height: 22px;
}

.tag {
  font-size: 12px;
  color: #666;
  padding: 2px 8px;
  background: #f9f9f9;
  border-radius: 2px;
}

.homestay-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 20px;
  font-weight: 500;
  color: #8b7355;
}

.unit {
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
@media (max-width: 1024px) {
  .homestay-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .toolbar-right {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .price-filter {
    justify-content: space-between;
  }

  .homestay-grid {
    grid-template-columns: 1fr;
  }
}
</style>
