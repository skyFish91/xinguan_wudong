<template>
  <div class="product-detail">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 骨架屏 -->
      <div v-if="loading" class="hero-grid">
        <div class="wd-skeleton skel-img"></div>
        <div class="info-col">
          <div class="wd-skel-card">
            <div class="wd-skel-body">
              <div class="wd-skeleton wd-skel-title"></div>
              <div class="wd-skeleton wd-skel-text"></div>
              <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
              <div class="wd-skeleton wd-skel-line skel-price"></div>
              <div class="wd-skeleton wd-skel-line skel-btn"></div>
            </div>
          </div>
        </div>
      </div>

      <template v-else-if="product.id">
        <!-- 主信息区 -->
        <div class="hero-grid">
          <div class="media-col">
            <div class="wd-card main-media">
              <img
                :src="gallery[activeImage] || imgLarge(product.mainImage, product.title)"
                :alt="product.title"
                @error="imgError"
              />
            </div>
            <div class="thumbs" v-if="gallery.length > 1">
              <div
                v-for="(g, i) in gallery"
                :key="i"
                :class="['thumb', { active: activeImage === i }]"
                @click="activeImage = i"
              >
                <img :src="g" :alt="`${product.title} ${i + 1}`" @error="imgError" />
              </div>
            </div>
          </div>

          <div class="info-col">
            <div class="wd-card info-card">
              <h1 class="title">{{ product.title }}</h1>
              <p class="sub" v-if="product.subtitle">{{ product.subtitle }}</p>

              <!-- 价格条 -->
              <div class="price-bar">
                <div class="price-main">
                  <span class="symbol">¥</span>
                  <span class="amount">{{ currentSku ? currentSku.price : product.price }}</span>
                  <span class="market" v-if="product.marketPrice">市场价 ¥{{ product.marketPrice }}</span>
                </div>
                <div class="sales">
                  <span>已售 {{ product.sales || 0 }}</span>
                  <span class="dot"></span>
                  <span>评分 {{ product.rating || '—' }}</span>
                </div>
              </div>

              <p class="craft" v-if="product.craftIntro">{{ product.craftIntro }}</p>

              <!-- SKU -->
              <div class="field" v-if="product.skus?.length">
                <div class="field-label">规格</div>
                <div class="sku-list">
                  <button
                    v-for="s in product.skus"
                    :key="s.id"
                    :class="['sku-item', { active: currentSku?.id === s.id, disabled: s.stock <= 0 }]"
                    :disabled="s.stock <= 0"
                    @click="currentSku = s"
                  >
                    <span class="sku-name">{{ s.specName }}</span>
                    <span class="sku-stock">库存 {{ s.stock }}</span>
                  </button>
                </div>
              </div>

              <!-- 数量 -->
              <div class="field">
                <div class="field-label">数量</div>
                <el-input-number v-model="quantity" :min="1" :max="99" />
              </div>

              <div class="actions">
                <el-button type="primary" size="large" class="btn-cart" @click="addCart">
                  加入购物车
                </el-button>
                <el-button size="large" @click="toggleFav">
                  <el-icon v-if="favorited"><StarFilled /></el-icon>
                  <el-icon v-else><Star /></el-icon>
                  {{ favorited ? '已收藏' : '收藏' }}
                </el-button>
              </div>
            </div>

            <!-- 传承人 -->
            <div class="wd-card inheritor" v-if="product.inheritor">
              <div class="inheritor-badge">非遗传承人</div>
              <div class="inheritor-name">
                {{ product.inheritor.name }}
                <span class="inheritor-title">{{ product.inheritor.title }}</span>
              </div>
              <p class="inheritor-story">{{ product.inheritor.story }}</p>
            </div>
          </div>
        </div>

        <!-- 图文详情 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">商品详情</h2>
          </div>
          <div class="wd-card detail-card">
            <div v-if="product.detail" class="detail-html" v-html="product.detail" />
            <EmptyState v-else title="暂无详细介绍" desc="这件好物的故事还在整理中。" />
          </div>
        </section>

        <!-- 评价 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">用户评价</h2>
            <span class="wd-section-more">{{ reviewTotal }} 条</span>
          </div>

          <div class="wd-card review-form" v-if="userStore.isLogin">
            <div class="rate-row">
              <span class="field-label">评分</span>
              <el-rate v-model="reviewForm.rating" />
            </div>
            <el-input
              v-model="reviewForm.content"
              type="textarea"
              :rows="3"
              placeholder="分享你的使用体验…"
              maxlength="500"
              show-word-limit
            />
            <div class="form-actions">
              <el-button type="primary" @click="submitReview">发表评价</el-button>
            </div>
          </div>
          <div class="wd-card login-tip" v-else>
            <router-link :to="{ path: '/login', query: { redirect: route.fullPath } }">
              <el-button type="primary">登录后发表评价</el-button>
            </router-link>
          </div>

          <div class="review-list" v-if="reviews.length">
            <article v-for="r in reviews" :key="r.id" class="wd-card review-item">
              <div class="review-head">
                <el-avatar :size="36">{{ (r.userNickname || '用').slice(0, 1) }}</el-avatar>
                <div class="review-who">
                  <div class="review-user">{{ r.userNickname || `用户${r.userId}` }}</div>
                  <el-rate :model-value="r.rating" disabled size="small" />
                </div>
                <span class="review-time">{{ formatTime(r.createdAt) }}</span>
              </div>
              <p class="review-content">{{ r.content }}</p>
              <p v-if="r.followUp" class="review-follow">追评：{{ r.followUp }}</p>
            </article>
          </div>

          <div class="wd-card" v-else>
            <EmptyState
              title="还没有评价"
              desc="成为第一个分享使用体验的人吧。"
            />
          </div>
        </section>
      </template>

      <!-- 商品不存在 -->
      <div class="wd-card" v-else>
        <EmptyState
          variant="network"
          title="没有找到这件好物"
          desc="它可能已下架，或链接有误。"
        >
          <router-link to="/clothing"><el-button type="primary">回到非遗好物</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star, StarFilled } from '@element-plus/icons-vue';
import PageBack from '../../components/PageBack.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgLarge, imgError, imgList, imgListLarge } from '../../utils/media';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const product = ref<any>({});
const currentSku = ref<any>(null);
const quantity = ref(1);
const favorited = ref(false);
const reviews = ref<any[]>([]);
const reviewTotal = ref(0);
const loading = ref(true);
const activeImage = ref(0);
const reviewForm = reactive({ rating: 5, content: '' });

/** 图集：主图 + images 字段（可能是 JSON 串），统一走占位图映射 */
const gallery = computed(() => {
  const extra = imgListLarge(product.value.images, product.value.title);
  const main = product.value.mainImage ? [imgLarge(product.value.mainImage, product.value.title)] : [];
  const all = [...main, ...extra];
  return all.filter((v, i) => all.indexOf(v) === i);
});

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

async function load() {
  loading.value = true;
  try {
    product.value = await request.get(`/clothing/products/${route.params.id}`);
    if (product.value.skus?.length) {
      currentSku.value = product.value.skus.find((s: any) => s.stock > 0) || product.value.skus[0];
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
  } finally {
    loading.value = false;
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
.product-detail {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* 主信息区 */
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 440px) minmax(0, 1fr);
  gap: var(--wd-s8);
  align-items: start;
}

.main-media {
  aspect-ratio: 1 / 1;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.main-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--wd-s3);
  margin-top: var(--wd-s4);
}
.thumb {
  aspect-ratio: 1 / 1;
  border-radius: var(--wd-r-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.24s var(--wd-ease);
}
.thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb:hover {
  transform: translateY(-3px);
  box-shadow: var(--wd-sh-2);
}
.thumb.active {
  border-color: var(--wd-brand);
}

/* 信息卡 */
.info-card {
  padding: var(--wd-s6);
}
.title {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.sub {
  margin-top: 10px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.price-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  flex-wrap: wrap;
  margin-top: var(--wd-s5);
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  background: linear-gradient(120deg, #eef3fb, #f7fafe);
}
.price-main {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.symbol {
  font-size: 18px;
  font-weight: 700;
  color: var(--wd-brand);
}
.amount {
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.market {
  font-size: 12.5px;
  color: var(--wd-text-4);
  text-decoration: line-through;
}
.sales {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.sales .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wd-border-strong);
}

.craft {
  margin-top: var(--wd-s4);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--wd-text-2);
}

.field {
  display: flex;
  gap: var(--wd-s4);
  margin-top: var(--wd-s5);
}
.field-label {
  flex-shrink: 0;
  width: 52px;
  padding-top: 9px;
  font-size: 13px;
  color: var(--wd-text-3);
}
.sku-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.sku-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 16px;
  border-radius: var(--wd-r-sm);
  border: 1px solid var(--wd-border-strong);
  background: #fff;
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.sku-item:hover:not(.disabled) {
  border-color: rgba(var(--wd-brand-rgb), 0.4);
  transform: translateY(-2px);
}
.sku-item.active {
  border-color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.sku-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.sku-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--wd-text-1);
}
.sku-item.active .sku-name {
  color: var(--wd-brand);
  font-weight: 600;
}
.sku-stock {
  font-size: 11.5px;
  color: var(--wd-text-4);
}

.actions {
  display: flex;
  gap: var(--wd-s3);
  margin-top: var(--wd-s6);
}
.btn-cart {
  flex: 1;
}

/* 传承人 */
.inheritor {
  margin-top: var(--wd-s5);
  padding: var(--wd-s5);
  background: linear-gradient(135deg, #fbfaf7, #f6f4ee);
  border-color: #ece7db;
}
.inheritor-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #8a6d1f;
  background: #fdf3d7;
}
.inheritor-name {
  margin-top: 10px;
  font-size: 16px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.inheritor-title {
  margin-left: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--wd-text-3);
}
.inheritor-story {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--wd-text-2);
}

/* 详情与评价 */
.detail-card {
  padding: var(--wd-s7);
}
.detail-html {
  font-size: 15px;
  line-height: 1.9;
  color: var(--wd-text-2);
}
.detail-html :deep(img) {
  max-width: 100%;
  border-radius: var(--wd-r-sm);
}

.review-form {
  padding: var(--wd-s5);
  margin-bottom: var(--wd-s5);
}
.rate-row {
  display: flex;
  align-items: center;
  gap: var(--wd-s3);
  margin-bottom: var(--wd-s4);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--wd-s4);
}
.login-tip {
  padding: var(--wd-s6);
  margin-bottom: var(--wd-s5);
  text-align: center;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s4);
}
.review-item {
  padding: var(--wd-s5);
}
.review-head {
  display: flex;
  align-items: center;
  gap: var(--wd-s3);
}
.review-who {
  flex: 1;
}
.review-user {
  font-size: 14px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.review-time {
  font-size: 12px;
  color: var(--wd-text-4);
}
.review-content {
  margin-top: var(--wd-s4);
  font-size: 14px;
  line-height: 1.75;
  color: var(--wd-text-2);
}
.review-follow {
  margin-top: var(--wd-s3);
  padding: 8px 12px;
  border-radius: var(--wd-r-xs);
  font-size: 13px;
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}

/* 骨架 */
.skel-img {
  aspect-ratio: 1 / 1;
  border-radius: var(--wd-r-md);
}
.skel-price {
  height: 40px;
  margin-top: var(--wd-s5);
}
.skel-btn {
  height: 44px;
  margin-top: var(--wd-s5);
  width: 60%;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--wd-s5);
  }
  .title {
    font-size: 22px;
  }
}
</style>
