<template>
  <div>
    <TopNav />
    <div class="page" v-if="product.id">
      <div class="top">
        <img :src="product.mainImage" class="main-img" />
        <div class="info">
          <h2>{{ product.name }}</h2>
          <div class="price">¥{{ product.price }} <span class="spec">{{ product.spec }}</span></div>
          <div class="line" v-if="product.origin">产地溯源：{{ product.origin }}</div>
          <div class="line" v-if="product.shelfLife">保质期：{{ product.shelfLife }}</div>
          <div class="line">销量 {{ product.sales }} · 库存 {{ product.stock }}</div>
          <div class="ops">
            <el-input-number v-model="qty" :min="1" :max="99" />
            <el-button type="danger" @click="addCart">加入购物车</el-button>
            <el-button type="warning" @click="buyNow">立即购买</el-button>
            <el-button :type="faved ? 'warning' : 'default'" @click="toggleFavorite">
              {{ faved ? '★ 已收藏' : '☆ 收藏' }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 商品详情（富文本） -->
      <el-divider content-position="left">商品详情</el-divider>
      <div class="detail" v-html="product.detail"></div>

      <!-- 用户评价 -->
      <el-divider content-position="left">用户评价</el-divider>
      <el-empty v-if="!reviews.length" description="暂无评价，快来抢沙发～" />
      <div v-for="rv in reviews" :key="rv.id" class="review">
        <div class="review-head">
          <span class="review-user">{{ rv.userNickname }}</span>
          <el-rate :model-value="rv.rating" disabled size="small" />
          <span class="review-time">{{ formatTime(rv.createdAt) }}</span>
        </div>
        <div class="review-content">{{ rv.content }}</div>
        <div class="review-reply" v-if="rv.merchantReply">商家回复：{{ rv.merchantReply }}</div>
      </div>

      <!-- 发表评价 -->
      <el-divider content-position="left">发表评价</el-divider>
      <div class="review-form">
        <el-rate v-model="reviewForm.rating" />
        <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="分享你的使用体验..." />
        <el-button type="primary" @click="submitReview">提交评价</el-button>
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
const qty = ref(1);
const faved = ref(false);
const reviews = ref<any[]>([]);
const reviewForm = reactive({ rating: 5, content: '' });

function requireLogin() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return false;
  }
  return true;
}

async function load() {
  try {
    product.value = await request.get(`/food/farm/products/${route.params.id}`);
  } catch {
    // 已提示
  }
}

async function loadFavorite() {
  if (!userStore.isLogin || !product.value.id) return;
  try {
    const r: any = await request.get('/food/favorite/status', {
      params: { bizType: 'farm_product', bizId: product.value.id },
    });
    faved.value = !!r.favorited;
  } catch {
    // 已提示
  }
}

async function toggleFavorite() {
  if (!requireLogin()) return;
  try {
    const r: any = await request.post('/food/favorite/toggle', {
      bizType: 'farm_product',
      bizId: product.value.id,
    });
    faved.value = !!r.favorited;
    ElMessage.success(r.favorited ? '已收藏' : '已取消收藏');
  } catch {
    // 已提示
  }
}

async function addCart() {
  if (!requireLogin()) return;
  try {
    await request.post('/cart/add', { farmProductId: product.value.id, quantity: qty.value });
    ElMessage.success('已加入购物车');
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 已提示
  }
}

async function buyNow() {
  if (!requireLogin()) return;
  try {
    await request.post('/cart/add', { farmProductId: product.value.id, quantity: qty.value });
    window.dispatchEvent(new Event('cart-changed'));
    router.push('/cart');
  } catch {
    // 已提示
  }
}

async function loadReviews() {
  if (!product.value.id) return;
  try {
    const data: any = await request.get('/food/reviews', {
      params: { bizType: 'farm_product', bizId: product.value.id, page: 1, pageSize: 20 },
    });
    reviews.value = data.list || [];
  } catch {
    // 已提示
  }
}

async function submitReview() {
  if (!requireLogin()) return;
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请填写评价内容');
    return;
  }
  try {
    await request.post('/food/reviews', {
      bizType: 'farm_product',
      bizId: product.value.id,
      rating: reviewForm.rating,
      content: reviewForm.content,
    });
    ElMessage.success('评价成功');
    reviewForm.content = '';
    reviewForm.rating = 5;
    loadReviews();
  } catch {
    // 已提示
  }
}

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

onMounted(async () => {
  await load();
  loadFavorite();
  loadReviews();
});
</script>

<style scoped>
.page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
.top {
  display: flex;
  gap: 24px;
}
.main-img {
  width: 400px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
}
.info {
  flex: 1;
}
.price {
  color: #c0392b;
  font-size: 26px;
  font-weight: bold;
  margin-top: 10px;
}
.spec {
  font-size: 14px;
  color: #999;
  font-weight: normal;
}
.line {
  margin-top: 10px;
  color: #555;
}
.ops {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.detail {
  line-height: 1.8;
  color: #444;
}
.review {
  border-bottom: 1px solid #f0f0f0;
  padding: 10px 0;
}
.review-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.review-user {
  font-weight: 600;
}
.review-time {
  color: #999;
  font-size: 12px;
}
.review-content {
  margin-top: 6px;
  color: #444;
}
.review-reply {
  margin-top: 6px;
  padding: 6px 10px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}
.review-form {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
