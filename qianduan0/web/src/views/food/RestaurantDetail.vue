<template>
  <div class="restaurant-detail">
    <TopNav />

    <div class="wd-container wd-page">
      <!-- 骨架屏 -->
      <div v-if="loading" class="hero-grid">
        <div class="wd-skeleton skel-img"></div>
        <div class="wd-skel-card">
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <template v-else-if="restaurant.id">
        <!-- 餐厅信息 -->
        <div class="hero-grid">
          <div class="wd-card hero-media">
            <img :src="imgLarge(restaurant.mainImage, restaurant.name)" :alt="restaurant.name" @error="imgError" />
          </div>

          <div class="wd-card hero-info">
            <h1 class="name">{{ restaurant.name }}</h1>

            <div class="meta-row">
              <span class="rating">
                <el-icon><Star /></el-icon>
                {{ restaurant.rating || '—' }}
              </span>
              <span class="meta-item">
                <el-icon><Location /></el-icon>
                {{ restaurant.address }}
              </span>
            </div>

            <div class="facts">
              <div class="fact">
                <span class="fact-label">营业时间</span>
                <span class="fact-value">{{ restaurant.openTime || '—' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">可容纳</span>
                <span class="fact-value">{{ restaurant.capacity || '—' }} 人</span>
              </div>
            </div>

            <p class="intro" v-if="restaurant.intro">{{ restaurant.intro }}</p>
          </div>
        </div>

        <!-- 招牌菜品 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">招牌菜品</h2>
            <span class="wd-section-more" v-if="restaurant.dishes?.length">
              {{ restaurant.dishes.length }} 道
            </span>
          </div>

          <div class="wd-grid wd-grid-4" v-if="restaurant.dishes?.length">
            <article v-for="d in restaurant.dishes" :key="d.id" class="wd-card wd-card-hover dish">
              <div class="wd-media dish-media">
                <img :src="img(d.image, d.name)" :alt="d.name" @error="imgError" />
              </div>
              <div class="dish-body">
                <h3 class="wd-title clamp-1">{{ d.name }}</h3>
                <div class="dish-price"><small>¥</small>{{ d.price }}</div>
              </div>
            </article>
          </div>

          <div class="wd-card" v-else>
            <EmptyState title="还没有上传菜品" desc="这家店的菜单正在整理中。" />
          </div>
        </section>

        <!-- 餐位预订 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">餐位预订</h2>
            <span class="wd-section-sub-inline">免费预订，需提前 2 小时</span>
          </div>

          <div class="wd-card book-card">
            <el-form :model="form" label-width="96px" class="book-form">
              <el-form-item label="预订日期">
                <el-date-picker
                  v-model="form.bookingDate"
                  type="date"
                  :disabled-date="disablePast"
                  value-format="YYYY-MM-DD"
                  @change="loadSlots"
                />
              </el-form-item>

              <el-form-item label="用餐时段">
                <div class="slot-list" v-if="restaurant.slots?.length">
                  <button
                    v-for="s in restaurant.slots"
                    :key="s.id"
                    :class="['slot-item', { active: form.slotId === s.id, disabled: s.remain <= 0 }]"
                    :disabled="s.remain <= 0"
                    @click="form.slotId = s.id"
                  >
                    <span class="slot-name">{{ s.slotName }}</span>
                    <span class="slot-remain">余 {{ s.remain }}</span>
                  </button>
                </div>
                <span v-else class="slot-empty">该日暂无可预订时段</span>
              </el-form-item>

              <el-form-item label="用餐人数">
                <el-input-number v-model="form.guestCount" :min="1" :max="20" />
              </el-form-item>
              <el-form-item label="联系人">
                <el-input v-model="form.contactName" placeholder="请填写联系人姓名" class="input" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="form.contactPhone" placeholder="方便店家联系你" class="input" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" size="large" :loading="booking" @click="submitBooking">
                  提交预订
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </section>
      </template>

      <!-- 餐厅不存在 -->
      <div class="wd-card" v-else>
        <EmptyState variant="network" title="没有找到这家餐厅" desc="它可能已下架，或链接有误。">
          <router-link to="/food"><el-button type="primary">回到苗乡美食</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Star, Location } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgLarge, imgError } from '../../utils/media';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const restaurant = ref<any>({});
const booking = ref(false);
const loading = ref(true);
const form = reactive({
  bookingDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  slotId: 0,
  guestCount: 2,
  contactName: '',
  contactPhone: '',
});

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

onMounted(async () => {
  await load();
  loading.value = false;
});
</script>

<style scoped>
.restaurant-detail {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
  gap: var(--wd-s8);
  align-items: start;
}
.hero-media {
  aspect-ratio: 4 / 3;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  padding: var(--wd-s6);
}
.name {
  font-size: 27px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.meta-row {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
  flex-wrap: wrap;
  margin-top: var(--wd-s3);
  font-size: 13px;
  color: var(--wd-text-3);
}
.rating {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  border-radius: var(--wd-r-pill);
  font-weight: 700;
  color: #8a6d1f;
  background: #fdf3d7;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--wd-s3) var(--wd-s5);
  margin-top: var(--wd-s5);
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  background: #f7f9fc;
}
.fact {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
}
.fact-label {
  color: var(--wd-text-4);
}
.fact-value {
  font-weight: 600;
  color: var(--wd-text-1);
}

.intro {
  margin-top: var(--wd-s4);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--wd-text-2);
}

/* 菜品 */
.dish-media {
  height: 148px;
}
.dish-body {
  padding: var(--wd-s4);
}
.dish-price {
  margin-top: 8px;
  font-size: 19px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.dish-price small {
  font-size: 12px;
  font-weight: 500;
}

/* 预订表单 */
.wd-section-sub-inline {
  font-size: 13px;
  color: var(--wd-text-4);
}
.book-card {
  padding: var(--wd-s6);
}
.book-form {
  max-width: 640px;
}
.input {
  width: 280px;
}
.slot-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.slot-item {
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
.slot-item:hover:not(.disabled) {
  border-color: rgba(var(--wd-brand-rgb), 0.4);
  transform: translateY(-2px);
}
.slot-item.active {
  border-color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.slot-item.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.slot-name {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--wd-text-1);
}
.slot-item.active .slot-name {
  color: var(--wd-brand);
  font-weight: 600;
}
.slot-remain {
  font-size: 11.5px;
  color: var(--wd-text-4);
}
.slot-empty {
  font-size: 13px;
  color: var(--wd-text-4);
}

.skel-img {
  aspect-ratio: 4 / 3;
  border-radius: var(--wd-r-md);
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--wd-s5);
  }
  .name {
    font-size: 22px;
  }
  .input {
    width: 100%;
  }
}
</style>
