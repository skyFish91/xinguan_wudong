<template>
  <div>
    <TopNav />
    <div class="page" v-if="restaurant.id">
      <div class="top">
        <img :src="restaurant.mainImage" class="main-img" />
        <div class="info">
          <h2>{{ restaurant.name }}</h2>
          <div class="line">地址：{{ restaurant.address }}</div>
          <div class="line">营业时间：{{ restaurant.openTime }}</div>
          <div class="line">评分 {{ restaurant.rating }} · 人均 ¥{{ restaurant.avgPrice }} · 可容纳 {{ restaurant.capacity }} 人</div>
          <div class="line intro">{{ restaurant.intro }}</div>
          <el-button :type="faved ? 'warning' : 'default'" class="fav-btn" @click="toggleFavorite">
            {{ faved ? '★ 已收藏' : '☆ 收藏餐厅' }}
          </el-button>
        </div>
      </div>

      <!-- 菜品 -->
      <el-divider content-position="left">招牌菜品</el-divider>
      <div class="dishes">
        <el-card v-for="d in restaurant.dishes" :key="d.id" class="dish">
          <img v-if="d.image" :src="d.image" class="dish-img" />
          <div class="dish-name">{{ d.name }}</div>
          <div class="dish-price">¥{{ d.price }}</div>
        </el-card>
      </div>

      <!-- 餐位预订 -->
      <el-divider content-position="left">餐位预订</el-divider>
      <el-form :model="form" label-width="90px" class="book-form">
        <el-form-item label="预订日期">
          <el-date-picker v-model="form.bookingDate" type="date" :disabled-date="disablePast" value-format="YYYY-MM-DD" @change="loadSlots" />
        </el-form-item>
        <el-form-item label="用餐时段">
          <el-radio-group v-model="form.slotId">
            <el-radio v-for="s in restaurant.slots" :key="s.id" :value="s.id">
              {{ s.slotName }}（余 {{ s.remain }}）
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用餐人数">
          <el-input-number v-model="form.guestCount" :min="1" :max="20" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactName" class="input" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" class="input" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="booking" @click="submitBooking">提交预订（免费，需提前 2 小时）</el-button>
        </el-form-item>
      </el-form>

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
        <el-input v-model="reviewForm.content" type="textarea" :rows="3" placeholder="分享你的用餐体验..." />
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
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const restaurant = ref<any>({});
const booking = ref(false);
const form = reactive({
  bookingDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  slotId: 0,
  guestCount: 2,
  contactName: '',
  contactPhone: '',
});
const faved = ref(false);
const reviews = ref<any[]>([]);
const reviewForm = reactive({ rating: 5, content: '' });

function disablePast(d: Date) {
  return dayjs(d).isBefore(dayjs(), 'day');
}

async function load(loadSlotsAlso = false) {
  try {
    restaurant.value = await request.get(`/food/restaurants/${route.params.id}`, {
      params: { date: form.bookingDate },
    });
    if (loadSlotsAlso || !form.slotId) {
      form.slotId = restaurant.value.slots?.[0]?.id || 0;
    }
  } catch {
    // 已提示
  }
}

async function loadSlots() {
  await load(false);
}

async function submitBooking() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!form.slotId) {
    ElMessage.warning('请选择用餐时段');
    return;
  }
  if (!form.contactName || !form.contactPhone) {
    ElMessage.warning('请填写联系人与电话');
    return;
  }
  booking.value = true;
  try {
    await request.post('/food/bookings', {
      restaurantId: restaurant.value.id,
      slotId: form.slotId,
      bookingDate: form.bookingDate,
      guestCount: form.guestCount,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
    });
    ElMessage.success('预订成功，可在我的订单中查看');
    router.push('/orders');
  } catch {
    // 已提示
  } finally {
    booking.value = false;
  }
}

async function loadFavorite() {
  if (!userStore.isLogin || !restaurant.value.id) return;
  try {
    const r: any = await request.get('/food/favorite/status', {
      params: { bizType: 'restaurant', bizId: restaurant.value.id },
    });
    faved.value = !!r.favorited;
  } catch {
    // 已提示
  }
}

async function toggleFavorite() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  try {
    const r: any = await request.post('/food/favorite/toggle', {
      bizType: 'restaurant',
      bizId: restaurant.value.id,
    });
    faved.value = !!r.favorited;
    ElMessage.success(r.favorited ? '已收藏' : '已取消收藏');
  } catch {
    // 已提示
  }
}

async function loadReviews() {
  if (!restaurant.value.id) return;
  try {
    const data: any = await request.get('/food/reviews', {
      params: { bizType: 'restaurant', bizId: restaurant.value.id, page: 1, pageSize: 20 },
    });
    reviews.value = data.list || [];
  } catch {
    // 已提示
  }
}

async function submitReview() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!reviewForm.content.trim()) {
    ElMessage.warning('请填写评价内容');
    return;
  }
  try {
    await request.post('/food/reviews', {
      bizType: 'restaurant',
      bizId: restaurant.value.id,
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
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
}
.info {
  flex: 1;
}
.line {
  margin-top: 10px;
  color: #555;
}
.intro {
  line-height: 1.7;
}
.dishes {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.dish {
  width: 200px;
}
.dish-img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}
.dish-name {
  font-weight: 600;
  margin-top: 6px;
}
.dish-price {
  color: #c0392b;
  margin-top: 4px;
}
.book-form {
  max-width: 560px;
}
.input {
  width: 240px;
}
.fav-btn {
  margin-top: 10px;
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
