<template>
  <div class="product-detail-page">
    <TopNav />

    <div class="page-container" v-if="product.id">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <span @click="$router.push('/clothing')">非遗好物</span>
        <span class="separator">/</span>
        <span class="current">{{ product.title }}</span>
      </div>

      <!-- 主要内容 -->
      <div class="product-main">
        <!-- 左侧图片 -->
        <div class="product-gallery">
          <div class="main-image">
            <img :src="product.mainImage" />
          </div>
        </div>

        <!-- 右侧信息 -->
        <div class="product-info">
          <h1 class="product-title">{{ product.title }}</h1>
          <p class="product-subtitle">{{ product.subtitle }}</p>

          <!-- 价格 -->
          <div class="price-section">
            <div class="price-row">
              <span class="price-label">价格</span>
              <span class="price-value">¥{{ currentSku ? currentSku.price : product.price }}</span>
            </div>
            <div class="market-price">市场价 ¥{{ product.marketPrice }}</div>
          </div>

          <!-- 统计信息 -->
          <div class="stats-row">
            <span class="stat-item">销量 {{ product.sales }}</span>
            <span class="stat-item">评分 {{ product.rating }}</span>
          </div>

          <!-- 工艺介绍 -->
          <div class="craft-intro" v-if="product.craftIntro">
            <p>{{ product.craftIntro }}</p>
          </div>

          <!-- 规格选择 -->
          <div class="spec-section" v-if="product.skus?.length">
            <div class="spec-label">选择规格</div>
            <div class="spec-options">
              <div
                v-for="s in product.skus"
                :key="s.id"
                class="spec-item"
                :class="{ active: currentSku?.id === s.id, disabled: s.stock === 0 }"
                @click="s.stock > 0 && (currentSku = s)"
              >
                <span class="spec-name">{{ s.specName }}</span>
                <span class="spec-stock">库存 {{ s.stock }}</span>
              </div>
            </div>
          </div>

          <!-- 数量 -->
          <div class="quantity-section">
            <span class="quantity-label">数量</span>
            <el-input-number v-model="quantity" :min="1" :max="99" />
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" size="large" class="btn-cart" @click="addCart">
              加入购物车
            </el-button>
            <el-button size="large" class="btn-favorite" @click="toggleFav">
              {{ favorited ? '已收藏' : '收藏' }}
            </el-button>
          </div>

          <!-- 传承人信息 -->
          <div class="inheritor-section" v-if="product.inheritor">
            <div class="inheritor-header">非遗传承人</div>
            <div class="inheritor-content">
              <h4 class="inheritor-name">{{ product.inheritor.name }}</h4>
              <p class="inheritor-title">{{ product.inheritor.title }}</p>
              <p class="inheritor-story">{{ product.inheritor.story }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 详情与评价 -->
      <div class="detail-tabs">
        <div class="tab-header">
          <div class="tab-item active">商品详情</div>
          <div class="tab-item">用户评价 ({{ reviewTotal }})</div>
        </div>

        <!-- 商品详情 -->
        <div class="detail-content">
          <div class="detail-html" v-html="product.detail"></div>
        </div>

        <!-- 评价列表 -->
        <div class="reviews-section">
          <h3 class="section-title">用户评价</h3>

          <!-- 评价表单 -->
          <div class="review-form" v-if="userStore.isLogin">
            <el-rate v-model="reviewForm.rating" />
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="3"
              placeholder="分享你的使用体验"
              maxlength="500"
            />
            <el-button type="primary" @click="submitReview">发表评价</el-button>
          </div>
          <div v-else class="login-tip">
            登录后可发表评价
          </div>

          <!-- 评价列表 -->
          <div class="reviews-list">
            <div v-for="r in reviews" :key="r.id" class="review-item">
              <div class="review-header">
                <div class="review-user">
                  <span class="user-name">{{ r.userNickname || `用户${r.userId}` }}</span>
                  <el-rate :model-value="r.rating" disabled size="small" />
                </div>
                <span class="review-time">{{ formatTime(r.createdAt) }}</span>
              </div>
              <div class="review-content">{{ r.content }}</div>
              <div v-if="r.followUp" class="review-followup">追评：{{ r.followUp }}</div>
            </div>
          </div>

          <el-empty v-if="!reviews.length" description="暂无评价" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const product = ref<any>({});
const currentSku = ref<any>(null);
const quantity = ref(1);
const favorited = ref(false);
const reviews = ref<any[]>([]);
const reviewTotal = ref(0);
const reviewForm = reactive({ rating: 5, content: '' });

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

async function load() {
  try {
    product.value = await request.get(`/clothing/products/${route.params.id}`);
    if (product.value.skus?.length) {
      currentSku.value = product.value.skus[0];
    }
    const r: any = await request.get('/clothing/reviews', {
      params: { bizType: 'product', bizId: product.value.id, page: 1, pageSize: 50 },
    });
    reviews.value = r.list || [];
    reviewTotal.value = r.total || 0;
    if (userStore.isLogin) {
      const s: any = await request.get('/clothing/favorite/status', {
        params: { bizType: 'product', bizId: product.value.id },
      });
      favorited.value = !!s;
    }
  } catch {
    // 已提示
  }
}

function needLogin() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return true;
  }
  return false;
}

async function addCart() {
  if (needLogin()) return;
  if (!currentSku.value) {
    ElMessage.warning('该商品暂无可选规格');
    return;
  }
  try {
    await request.post('/cart/add', { skuId: currentSku.value.id, quantity: quantity.value });
    ElMessage.success('已加入购物车');
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 已提示
  }
}

async function toggleFav() {
  if (needLogin()) return;
  try {
    await request.post('/clothing/favorite/toggle', null, {
      params: { bizType: 'product', bizId: product.value.id },
    });
    favorited.value = !favorited.value;
    ElMessage.success(favorited.value ? '已收藏' : '已取消收藏');
  } catch {
    // 已提示
  }
}

async function submitReview() {
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请输入评价内容');
    return;
  }
  try {
    await request.post('/clothing/reviews', {
      bizType: 'product',
      bizId: product.value.id,
      rating: reviewForm.rating,
      content: reviewForm.content,
    });
    ElMessage.success('评价成功');
    reviewForm.content = '';
    load();
  } catch {
    // 已提示
  }
}

onMounted(load);
</script>

<style scoped>
.product-detail-page {
  background: #ffffff;
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* 面包屑 */
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 32px;
}

.breadcrumb span {
  cursor: pointer;
}

.breadcrumb span:hover {
  color: #333;
}

.separator {
  margin: 0 8px;
  cursor: default;
}

.current {
  color: #333;
  cursor: default;
}

/* 主要内容 */
.product-main {
  display: flex;
  gap: 48px;
  margin-bottom: 64px;
}

/* 图片展示 */
.product-gallery {
  flex: 1;
}

.main-image {
  width: 100%;
  padding-bottom: 100%;
  position: relative;
  background: #f9f9f9;
  border-radius: 4px;
  overflow: hidden;
}

.main-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.product-info {
  flex: 1;
}

.product-title {
  font-size: 24px;
  font-weight: 400;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-subtitle {
  font-size: 14px;
  color: #999;
  margin-bottom: 24px;
}

/* 价格 */
.price-section {
  padding: 20px 0;
  border-top: 1px solid #e5e5e5;
  border-bottom: 1px solid #e5e5e5;
  margin-bottom: 16px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 8px;
}

.price-label {
  font-size: 13px;
  color: #999;
}

.price-value {
  font-size: 32px;
  font-weight: 500;
  color: #8b7355;
}

.market-price {
  font-size: 13px;
  color: #999;
  text-decoration: line-through;
}

/* 统计 */
.stats-row {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.stat-item {
  font-size: 13px;
  color: #666;
}

/* 工艺介绍 */
.craft-intro {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 24px;
}

.craft-intro p {
  font-size: 13px;
  line-height: 1.8;
  color: #666;
}

/* 规格选择 */
.spec-section {
  margin-bottom: 24px;
}

.spec-label,
.quantity-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  display: block;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  padding: 10px 16px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.spec-item:hover {
  border-color: #8b7355;
}

.spec-item.active {
  border-color: #8b7355;
  background: rgba(139, 115, 85, 0.05);
}

.spec-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spec-name {
  font-size: 13px;
  color: #333;
}

.spec-stock {
  font-size: 12px;
  color: #999;
}

/* 数量 */
.quantity-section {
  margin-bottom: 32px;
}

/* 按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.btn-cart,
.btn-favorite {
  flex: 1;
  border-radius: 4px;
}

.btn-cart {
  background: #8b7355;
  border-color: #8b7355;
}

.btn-cart:hover {
  background: #6d5a42;
  border-color: #6d5a42;
}

.btn-favorite {
  border-color: #e5e5e5;
}

/* 传承人 */
.inheritor-section {
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
}

.inheritor-header {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 12px;
}

.inheritor-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.inheritor-title {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.inheritor-story {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

/* 详情标签页 */
.detail-tabs {
  border-top: 1px solid #e5e5e5;
  padding-top: 48px;
}

.tab-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  border-bottom: 1px solid #e5e5e5;
}

.tab-item {
  padding: 12px 0;
  font-size: 14px;
  color: #999;
  cursor: pointer;
  position: relative;
}

.tab-item.active {
  color: #333;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: #8b7355;
}

/* 详情内容 */
.detail-content {
  margin-bottom: 64px;
}

.detail-html {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

/* 评价区域 */
.reviews-section {
  margin-bottom: 64px;
}

.section-title {
  font-size: 18px;
  font-weight: 400;
  color: #333;
  margin-bottom: 24px;
}

/* 评价表单 */
.review-form {
  margin-bottom: 32px;
  padding: 24px;
  background: #f9f9f9;
  border-radius: 4px;
}

.review-form :deep(.el-rate) {
  margin-bottom: 16px;
}

.review-form :deep(.el-textarea) {
  margin-bottom: 16px;
}

.login-tip {
  padding: 24px;
  background: #f9f9f9;
  border-radius: 4px;
  text-align: center;
  color: #999;
  margin-bottom: 32px;
}

/* 评价列表 */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.review-time {
  font-size: 12px;
  color: #999;
}

.review-content {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
  margin-bottom: 8px;
}

.review-followup {
  font-size: 13px;
  color: #8b7355;
  line-height: 1.6;
}

/* 响应式 */
@media (max-width: 768px) {
  .product-main {
    flex-direction: column;
    gap: 24px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
