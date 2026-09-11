<template>
  <div class="clothing-list-page">
    <TopNav />

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">非遗好物</h1>
        <p class="page-description">传承千年技艺的苗族手工艺品</p>
      </div>

      <!-- 搜索与筛选 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="keyword"
            placeholder="搜索商品"
            class="search-input"
            clearable
            @keyup.enter="load(1)"
          />
          <el-button type="primary" @click="load(1)">搜索</el-button>
        </div>
        <div class="toolbar-right">
          <el-radio-group v-model="sort" size="small" @change="load(1)">
            <el-radio-button value="default">默认</el-radio-button>
            <el-radio-button value="sales">销量</el-radio-button>
            <el-radio-button value="price_asc">价格升序</el-radio-button>
            <el-radio-button value="price_desc">价格降序</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="content-wrapper">
        <!-- 左侧分类 -->
        <aside class="sidebar">
          <div class="category-section">
            <h3 class="section-title">分类</h3>
            <div class="category-list">
              <div
                v-for="c in categories"
                :key="c.id"
                class="category-item"
                :class="{ active: topCatId === c.id }"
                @click="onTopCat(c)"
              >
                {{ c.name }}
              </div>
            </div>
          </div>

          <!-- 子分类 -->
          <div v-if="subCats.length" class="subcategory-section">
            <div
              v-for="s in subCats"
              :key="s.id"
              class="subcategory-item"
              :class="{ active: categoryId === s.id }"
              @click="onSubCat(s)"
            >
              {{ s.name }}
            </div>
          </div>
        </aside>

        <!-- 商品列表 -->
        <main class="main-content">
          <el-empty v-if="!loading && !list.length" description="暂无商品" />

          <div v-else class="product-grid">
            <div
              v-for="p in list"
              :key="p.id"
              class="product-item"
              @click="$router.push(`/clothing/${p.id}`)"
            >
              <div class="product-image">
                <img :src="p.mainImage" />
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ p.title }}</h3>
                <p class="product-subtitle">{{ p.subtitle }}</p>
                <div class="product-footer">
                  <span class="product-price">¥{{ p.price }}</span>
                  <span class="product-sales">{{ p.sales }} 已售</span>
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
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const categories = ref<any[]>([]);
const topCatId = ref<number>(0);
const subCats = ref<any[]>([]);
const categoryId = ref<number | undefined>(undefined);
const keyword = ref('');
const sort = ref('default');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/clothing/products', {
      params: {
        categoryId: categoryId.value,
        keyword: keyword.value || undefined,
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

function onTopCat(c: any) {
  topCatId.value = c.id;
  subCats.value = c.children || [];
  categoryId.value = undefined;
  load(1);
}

function onSubCat(s: any) {
  categoryId.value = categoryId.value === s.id ? undefined : s.id;
  load(1);
}

onMounted(async () => {
  try {
    categories.value = await request.get('/clothing/categories');
  } catch {
    // 已提示
  }
  load(1);
});
</script>

<style scoped>
.clothing-list-page {
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

.search-input {
  width: 280px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 4px;
  box-shadow: 0 0 0 1px #e5e5e5 inset;
}

.search-input :deep(.el-input__wrapper:focus) {
  box-shadow: 0 0 0 1px #8b7355 inset;
}

:deep(.el-button--primary) {
  background: #8b7355;
  border-color: #8b7355;
  border-radius: 4px;
}

:deep(.el-button--primary:hover) {
  background: #6d5a42;
  border-color: #6d5a42;
}

.toolbar-right :deep(.el-radio-button__inner) {
  border-radius: 0;
  border-color: #e5e5e5;
  padding: 8px 16px;
  font-size: 13px;
}

.toolbar-right :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 4px 0 0 4px;
}

.toolbar-right :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 4px 4px 0;
}

.toolbar-right :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #8b7355;
  border-color: #8b7355;
  color: #fff;
}

/* 内容布局 */
.content-wrapper {
  display: flex;
  gap: 32px;
}

/* 侧边栏 */
.sidebar {
  width: 180px;
  flex-shrink: 0;
}

.category-section,
.subcategory-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e5e5;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item,
.subcategory-item {
  padding: 8px 12px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.category-item:hover,
.subcategory-item:hover {
  background: #f9f9f9;
  color: #333;
}

.category-item.active,
.subcategory-item.active {
  background: #8b7355;
  color: #fff;
}

/* 主内容区 */
.main-content {
  flex: 1;
  min-width: 0;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.product-item {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.product-item:hover {
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  overflow: hidden;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 12px;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-item:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 0 4px;
}

.product-name {
  font-size: 14px;
  font-weight: 400;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.product-price {
  font-size: 16px;
  font-weight: 500;
  color: #8b7355;
}

.product-sales {
  font-size: 12px;
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
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .toolbar-left {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
