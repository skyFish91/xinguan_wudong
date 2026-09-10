<template>
  <div class="food-page">
    <TopNav />

    <!-- 页面头部 -->
    <section class="page-header">
      <div class="header-bg">
        <img src="https://picsum.photos/seed/miao-food/1920/400" alt="苗乡美食" />
        <div class="header-overlay"></div>
      </div>
      <div class="header-content">
        <h1 class="page-title">苗乡美食</h1>
        <p class="page-subtitle">品味酸汤鱼 · 体验长桌宴 · 尝鲜特色农产</p>
      </div>
    </section>

    <div class="page-container">
      <!-- Tab 切换 -->
      <div class="tab-switcher">
        <div
          class="tab-item"
          :class="{ active: tab === 'restaurants' }"
          @click="tab = 'restaurants'"
        >
          <i class="el-icon-house"></i>
          <div class="tab-content">
            <span class="tab-title">苗乡餐厅</span>
            <span class="tab-subtitle">餐位预订</span>
          </div>
        </div>
        <div
          class="tab-item"
          :class="{ active: tab === 'farm' }"
          @click="tab = 'farm'"
        >
          <i class="el-icon-shopping-bag"></i>
          <div class="tab-content">
            <span class="tab-title">苗乡特产</span>
            <span class="tab-subtitle">农产品</span>
          </div>
        </div>
      </div>

      <!-- 餐厅列表 -->
      <div v-show="tab === 'restaurants'" class="restaurants-section">
        <div class="toolbar">
          <div class="search-box">
            <el-input
              v-model="restKeyword"
              placeholder="搜索餐厅名称、特色菜..."
              class="search-input"
              clearable
              @keyup.enter="loadRest(1)"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
            <el-button type="primary" class="search-btn" @click="loadRest(1)">搜索</el-button>
          </div>

          <div class="sort-box">
            <span class="sort-label">排序：</span>
            <el-radio-group v-model="restSort" class="sort-group" @change="loadRest(1)">
              <el-radio-button value="rating">评分优先</el-radio-button>
              <el-radio-button value="capacity">容纳人数</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <div class="restaurants-grid">
          <div
            v-for="r in restaurants"
            :key="r.id"
            class="restaurant-card"
            @click="$router.push(`/food/restaurant/${r.id}`)"
          >
            <div class="restaurant-image-wrapper">
              <img :src="r.mainImage" class="restaurant-image" />
              <div class="image-overlay"></div>
              <div class="rating-badge">
                <i class="el-icon-star-on"></i>
                <span>{{ r.rating || '4.8' }}</span>
              </div>
            </div>

            <div class="restaurant-content">
              <h3 class="restaurant-name">{{ r.name }}</h3>
              <p class="restaurant-intro">{{ r.intro }}</p>
              <div class="restaurant-footer">
                <div class="capacity-info">
                  <i class="el-icon-user"></i>
                  <span>可容纳 {{ r.capacity }} 人</span>
                </div>
                <el-button type="primary" size="small" class="reserve-btn">
                  预订餐位
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="restTotal > 10" class="pagination-wrapper">
          <el-pagination
            layout="prev, pager, next, jumper, total"
            :total="restTotal"
            :page-size="10"
            :current-page="restPage"
            @current-change="loadRest"
          />
        </div>
      </div>

      <!-- 农产品列表 -->
      <div v-show="tab === 'farm'" class="farm-section">
        <div class="toolbar">
          <div class="filter-box">
            <el-select
              v-model="farmCatId"
              placeholder="全部分类"
              clearable
              class="category-select"
              @change="loadFarm(1)"
            >
              <el-option v-for="c in farmCats" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </div>

          <div class="search-box">
            <el-input
              v-model="farmKeyword"
              placeholder="搜索特产名称..."
              class="search-input"
              clearable
              @keyup.enter="loadFarm(1)"
            >
              <template #prefix>
                <i class="el-icon-search"></i>
              </template>
            </el-input>
            <el-button type="primary" class="search-btn" @click="loadFarm(1)">搜索</el-button>
          </div>
        </div>

        <div class="farm-grid">
          <div
            v-for="f in farmList"
            :key="f.id"
            class="farm-card"
            @click="showFarm(f)"
          >
            <div class="farm-image-wrapper">
              <img :src="f.mainImage" class="farm-image" />
              <div class="farm-badge">新鲜直供</div>
            </div>

            <div class="farm-content">
              <h3 class="farm-name">{{ f.name }}</h3>
              <p class="farm-spec">{{ f.spec }}</p>
              <div class="farm-footer">
                <div class="price-box">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ f.price }}</span>
                </div>
                <el-button
                  type="danger"
                  size="small"
                  class="add-cart-btn"
                  @click.stop="addFarmCart(f)"
                >
                  <i class="el-icon-shopping-cart-2"></i>
                  加购
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="farmTotal > 12" class="pagination-wrapper">
          <el-pagination
            layout="prev, pager, next, jumper, total"
            :total="farmTotal"
            :page-size="12"
            :current-page="farmPage"
            @current-change="loadFarm"
          />
        </div>
      </div>

      <!-- 农产品详情弹窗 -->
      <el-dialog v-model="farmDialog" :title="currentFarm?.name" width="600px" class="farm-dialog">
        <div class="dialog-content">
          <img :src="currentFarm?.mainImage" class="dialog-image" />
          <div class="dialog-info">
            <div class="info-item" v-if="currentFarm?.origin">
              <i class="el-icon-location"></i>
              <span class="info-label">产地溯源：</span>
              <span class="info-value">{{ currentFarm.origin }}</span>
            </div>
            <div class="info-item" v-if="currentFarm?.shelfLife">
              <i class="el-icon-time"></i>
              <span class="info-label">保质期：</span>
              <span class="info-value">{{ currentFarm.shelfLife }}</span>
            </div>
            <div class="info-item description" v-if="currentFarm?.description">
              <i class="el-icon-document"></i>
              <span class="info-label">商品描述：</span>
              <p class="info-value">{{ currentFarm.description }}</p>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <div class="quantity-selector">
              <span class="quantity-label">数量：</span>
              <el-input-number v-model="farmQty" :min="1" :max="99" />
            </div>
            <el-button type="danger" size="large" class="confirm-btn" @click="addFarmCart(currentFarm, true)">
              <i class="el-icon-shopping-cart-2"></i>
              加入购物车
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const tab = ref('restaurants');

const restaurants = ref<any[]>([]);
const restKeyword = ref('');
const restSort = ref('rating');
const restPage = ref(1);
const restTotal = ref(0);

const farmCats = ref<any[]>([]);
const farmCatId = ref<number | undefined>(undefined);
const farmKeyword = ref('');
const farmList = ref<any[]>([]);
const farmPage = ref(1);
const farmTotal = ref(0);
const farmDialog = ref(false);
const currentFarm = ref<any>(null);
const farmQty = ref(1);

async function loadRest(p = 1) {
  restPage.value = p;
  const data: any = await request.get('/food/restaurants', {
    params: { sort: restSort.value, keyword: restKeyword.value || undefined, page: restPage.value, pageSize: 10 },
  });
  restaurants.value = data.list || [];
  restTotal.value = data.total || 0;
}

async function loadFarm(p = 1) {
  farmPage.value = p;
  const data: any = await request.get('/food/farm/products', {
    params: {
      categoryId: farmCatId.value,
      keyword: farmKeyword.value || undefined,
      sort: 'default',
      page: farmPage.value,
      pageSize: 12,
    },
  });
  farmList.value = data.list || [];
  farmTotal.value = data.total || 0;
}

async function showFarm(f: any) {
  try {
    currentFarm.value = await request.get(`/food/farm/products/${f.id}`);
    farmQty.value = 1;
    farmDialog.value = true;
  } catch {
    // 已提示
  }
}

async function addFarmCart(f: any, fromDialog = false) {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    await request.post('/cart/add', { farmProductId: f.id, quantity: fromDialog ? farmQty.value : 1 });
    ElMessage.success('已加入购物车');
    farmDialog.value = false;
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 已提示
  }
}

onMounted(async () => {
  loadRest();
  loadFarm();
  try {
    farmCats.value = await request.get('/food/farm/categories');
  } catch {
    // 已提示
  }
});
</script>

<style scoped>
.food-page {
  background: #fafafa;
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%);
}

.header-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #fff;
  z-index: 10;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.page-subtitle {
  font-size: 18px;
  opacity: 0.95;
  text-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* 页面容器 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px;
}

/* Tab 切换器 */
.tab-switcher {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.tab-item {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 3px solid transparent;
}

.tab-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212,87,78,0.15);
}

.tab-item.active {
  border-color: #d4574e;
  background: linear-gradient(135deg, rgba(212,87,78,0.05) 0%, rgba(244,164,96,0.05) 100%);
}

.tab-item i {
  font-size: 48px;
  color: #d4574e;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tab-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c2c2c;
}

.tab-subtitle {
  font-size: 14px;
  color: #999;
}

/* 工具栏 */
.toolbar {
  background: #fff;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-box {
  display: flex;
  gap: 12px;
  flex: 1;
}

.filter-box {
  display: flex;
  gap: 12px;
}

.category-select {
  width: 160px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  box-shadow: 0 0 0 1px #e8e8e8 inset;
}

.search-btn {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  border: none;
  border-radius: 12px;
  padding: 0 32px;
  font-weight: 600;
}

.sort-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.sort-group :deep(.el-radio-button__inner) {
  border-radius: 8px;
  border: 1px solid #e8e8e8;
  padding: 8px 20px;
}

.sort-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px 0 0 8px;
}

.sort-group :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 8px 8px 0;
}

.sort-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  border-color: #d4574e;
  color: #fff;
}

/* 餐厅网格 */
.restaurants-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.restaurant-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.restaurant-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(212,87,78,0.2);
}

.restaurant-image-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.restaurant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.restaurant-card:hover .restaurant-image {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.rating-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  font-size: 15px;
  font-weight: 600;
  color: #ffa500;
}

.restaurant-content {
  padding: 20px;
}

.restaurant-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 8px;
}

.restaurant-intro {
  font-size: 13px;
  color: #999;
  line-height: 1.6;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.restaurant-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.capacity-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
}

.capacity-info i {
  color: #d4574e;
}

.reserve-btn {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  border: none;
  border-radius: 20px;
  font-weight: 600;
}

/* 农产品网格 */
.farm-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.farm-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.farm-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(212,87,78,0.15);
}

.farm-image-wrapper {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.farm-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.farm-card:hover .farm-image {
  transform: scale(1.1);
}

.farm-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
}

.farm-content {
  padding: 16px;
}

.farm-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.farm-spec {
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.farm-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #d4574e;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #d4574e;
}

.add-cart-btn {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  border: none;
  border-radius: 16px;
  font-weight: 600;
}

/* 弹窗样式 */
.farm-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 24px;
}

.farm-dialog :deep(.el-dialog__body) {
  padding: 24px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dialog-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
}

.dialog-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f8f8f8;
  border-radius: 8px;
}

.info-item i {
  font-size: 18px;
  color: #d4574e;
  margin-top: 2px;
  flex-shrink: 0;
}

.info-label {
  font-weight: 600;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  color: #2c2c2c;
  line-height: 1.6;
}

.info-item.description {
  flex-direction: column;
  align-items: flex-start;
}

.info-item.description .info-value {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-label {
  font-size: 15px;
  font-weight: 600;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  border: none;
  font-weight: 600;
  padding: 0 32px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: linear-gradient(135deg, #d4574e 0%, #f4a460 100%);
  color: #fff;
}

/* 响应式 */
@media (max-width: 1024px) {
  .restaurants-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .farm-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .tab-switcher {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: 100%;
  }

  .restaurants-grid,
  .farm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
