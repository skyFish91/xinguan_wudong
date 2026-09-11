<template>
  <div class="route-detail">
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

      <template v-else-if="routeData.id">
        <!-- 头部 -->
        <div class="hero-grid">
          <div class="wd-card hero-media">
            <img :src="imgLarge(routeData.mainImage, routeData.title)" :alt="routeData.title" @error="imgError" />
          </div>

          <div class="wd-card hero-info">
            <h1 class="name">{{ routeData.title }}</h1>

            <div class="route-line">
              <span class="from">{{ routeData.departFrom || '乌东' }}</span>
              <span class="arrow">→</span>
              <span class="dest">{{ routeData.dest || '苗乡' }}</span>
              <span class="days-chip">{{ routeData.days }} 天行程</span>
            </div>

            <div class="tags" v-if="splitTags(routeData.themes).length">
              <span v-for="t in splitTags(routeData.themes)" :key="t" class="theme-tag">{{ t }}</span>
            </div>

            <div class="price-bar">
              <div class="price-main">
                <span class="symbol">¥</span>
                <span class="amount">{{ routeData.price }}</span>
                <span class="unit">/人</span>
              </div>
              <span class="sales">已售 {{ routeData.sales || 0 }}</span>
            </div>

            <dl class="detail-list">
              <div class="row" v-if="routeData.hotelStandard">
                <dt>住宿标准</dt>
                <dd>{{ routeData.hotelStandard }}</dd>
              </div>
              <div class="row" v-if="routeData.mealStandard">
                <dt>用餐标准</dt>
                <dd>{{ routeData.mealStandard }}</dd>
              </div>
              <div class="row" v-if="routeData.included">
                <dt>费用包含</dt>
                <dd>{{ routeData.included }}</dd>
              </div>
            </dl>

            <p class="notice" v-if="routeData.notice">
              <el-icon><InfoFilled /></el-icon>
              {{ routeData.notice }}
            </p>
          </div>
        </div>

        <!-- 行程安排 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">行程安排</h2>
            <span class="wd-section-more" v-if="routeData.itineraries?.length">
              共 {{ routeData.itineraries.length }} 天
            </span>
          </div>

          <div class="timeline" v-if="routeData.itineraries?.length">
            <div v-for="it in routeData.itineraries" :key="it.id" class="tl-item wd-rise">
              <div class="tl-marker">
                <span class="tl-day">D{{ it.dayNo }}</span>
              </div>
              <div class="wd-card tl-card">
                <p class="tl-desc">{{ it.description }}</p>
                <div class="tl-meta">
                  <span v-if="it.scenic" class="tl-tag"><el-icon><Location /></el-icon>{{ it.scenic }}</span>
                  <span v-if="it.meal" class="tl-tag"><el-icon><Food /></el-icon>{{ it.meal }}</span>
                  <span v-if="it.hotel" class="tl-tag"><el-icon><House /></el-icon>{{ it.hotel }}</span>
                  <span v-if="it.transport" class="tl-tag"><el-icon><Van /></el-icon>{{ it.transport }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="wd-card" v-else>
            <EmptyState title="行程详情整理中" desc="这条路线还没有发布每日安排，可先咨询客服。" />
          </div>
        </section>

        <!-- 预订 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">预订出发</h2>
          </div>

          <div class="wd-card book-card">
            <el-form :model="form" label-width="96px" class="book-form">
              <el-form-item label="出发日期">
                <el-date-picker
                  v-model="form.useDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disableBeforeTomorrow"
                />
              </el-form-item>
              <el-form-item label="出行人数">
                <el-input-number v-model="form.quantity" :min="1" :max="20" />
              </el-form-item>
              <el-form-item label="游客姓名">
                <el-input v-model="form.visitors" placeholder="逗号分隔，选填" class="input" />
              </el-form-item>
              <el-form-item>
                <div class="book-foot">
                  <div class="total">
                    <span class="total-label">合计</span>
                    <span class="total-amount">¥{{ (Number(routeData.price) * form.quantity).toFixed(2) }}</span>
                  </div>
                  <el-button type="primary" size="large" :loading="buying" @click="submitBuy">
                    提交订单
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </section>
      </template>

      <!-- 路线不存在 -->
      <div class="wd-card" v-else>
        <EmptyState variant="network" title="没有找到这条路线" desc="它可能已下架，或链接有误。">
          <router-link to="/travel/routes"><el-button type="primary">回到路线列表</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { InfoFilled, Location, Food, House, Van } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgLarge, imgError } from '../../utils/media';
import dayjs from 'dayjs';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const routeData = ref<any>({});
const buying = ref(false);
const loading = ref(true);
const form = reactive({
  useDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
  quantity: 1,
  visitors: '',
});

function splitTags(tags: string) {
  return tags ? tags.split(',').filter((t) => t) : [];
}

function disableBeforeTomorrow(d: Date) {
  return dayjs(d).isBefore(dayjs().add(1, 'day'), 'day');
}

async function load() {
  loading.value = true;
  try {
    routeData.value = await request.get(`/travel/routes/${route.params.id}`);
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function submitBuy() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!form.useDate) {
    ElMessage.warning('请选择出发日期');
    return;
  }
  const names = form.visitors
    ? form.visitors.split(/[,，]/).map((s) => s.trim()).filter((s) => s)
    : [];
  buying.value = true;
  try {
    const order: any = await request.post('/travel/routes/buy', {
      routeId: routeData.value.id,
      useDate: form.useDate,
      quantity: form.quantity,
      visitors: JSON.stringify(names),
    });
    router.push(`/pay/${order.id}`);
  } catch {
    // 已提示
  } finally {
    buying.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.route-detail {
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
  font-size: 26px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}

.route-line {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: var(--wd-s3);
  font-size: 15px;
  color: var(--wd-text-2);
}
.from,
.dest {
  font-weight: 600;
  color: var(--wd-text-1);
}
.arrow {
  color: var(--wd-text-4);
}
.days-chip {
  padding: 3px 12px;
  border-radius: var(--wd-r-pill);
  font-size: 12px;
  font-weight: 600;
  color: var(--wd-indigo);
  background: #eef2f9;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--wd-s4);
}
.theme-tag {
  padding: 4px 13px;
  border-radius: var(--wd-r-pill);
  font-size: 12.5px;
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}

.price-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--wd-s4);
  margin-top: var(--wd-s5);
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  background: linear-gradient(120deg, #eef3fb, #f7fafe);
}
.price-main {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.price-main .symbol {
  font-size: 18px;
  font-weight: 700;
  color: var(--wd-brand);
}
.price-main .amount {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.price-main .unit {
  font-size: 13px;
  color: var(--wd-text-3);
}
.sales {
  font-size: 12.5px;
  color: var(--wd-text-3);
}

.detail-list {
  margin: var(--wd-s5) 0 0;
}
.detail-list .row {
  display: flex;
  gap: var(--wd-s4);
  padding: 7px 0;
  font-size: 13.5px;
}
.detail-list dt {
  flex-shrink: 0;
  width: 68px;
  color: var(--wd-text-4);
}
.detail-list dd {
  margin: 0;
  line-height: 1.7;
  color: var(--wd-text-2);
}

.notice {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: var(--wd-s4);
  padding: 10px 14px;
  border-radius: var(--wd-r-xs);
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--wd-text-3);
  background: #f7f9fc;
}

/* 时间轴 */
.timeline {
  position: relative;
  padding-left: 4px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 21px;
  top: 12px;
  bottom: 12px;
  width: 2px;
  background: linear-gradient(180deg, var(--wd-brand-400), #e6eaf2);
  border-radius: var(--wd-r-pill);
}
.tl-item {
  position: relative;
  display: flex;
  gap: var(--wd-s5);
  padding-bottom: var(--wd-s5);
}
.tl-item:last-child {
  padding-bottom: 0;
}
.tl-marker {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}
.tl-day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 16px rgba(var(--wd-brand-rgb), 0.24);
}
.tl-card {
  flex: 1;
  padding: var(--wd-s5);
}
.tl-desc {
  font-size: 14.5px;
  line-height: 1.8;
  color: var(--wd-text-1);
}
.tl-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--wd-s4);
}
.tl-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: var(--wd-r-pill);
  font-size: 12.5px;
  color: var(--wd-text-2);
  background: #f1f3f7;
}

/* 预订 */
.book-card {
  padding: var(--wd-s6);
}
.book-form {
  max-width: 640px;
}
.input {
  width: 280px;
}
.book-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s5);
  width: 100%;
  padding-top: var(--wd-s4);
  border-top: 1px solid var(--wd-border);
}
.total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.total-label {
  font-size: 13px;
  color: var(--wd-text-3);
}
.total-amount {
  font-size: 26px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
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
    font-size: 21px;
  }
  .input {
    width: 100%;
  }
  .book-foot {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
