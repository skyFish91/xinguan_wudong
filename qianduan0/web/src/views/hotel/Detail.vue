<template>
  <div class="homestay-detail">
    <TopNav />

    <div class="wd-container wd-page">
      <!-- 骨架屏 -->
      <div v-if="loading" class="hero-grid">
        <div class="wd-skeleton skel-img"></div>
        <div class="wd-skel-card">
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <template v-else-if="homestay.id">
        <!-- 民宿信息 -->
        <div class="hero-grid">
          <div class="wd-card hero-media">
            <img :src="imgLarge(homestay.mainImage, homestay.name)" :alt="homestay.name" @error="imgError" />
          </div>

          <div class="wd-card hero-info">
            <h1 class="name">{{ homestay.name }}</h1>

            <div class="meta-row">
              <span class="rating">
                <el-icon><Star /></el-icon>
                {{ homestay.rating || '—' }}
              </span>
              <span class="addr">
                <el-icon><Location /></el-icon>
                {{ homestay.address }}
              </span>
            </div>

            <div class="facts">
              <div class="fact">
                <span class="fact-label">入住</span>
                <span class="fact-value">{{ homestay.checkInTime || '—' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">离店</span>
                <span class="fact-value">{{ homestay.checkOutTime || '—' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">含早餐</span>
                <span class="fact-value">{{ homestay.hasBreakfast ? '是' : '否' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">允许宠物</span>
                <span class="fact-value">{{ homestay.petPolicy ? '是' : '否' }}</span>
              </div>
              <div class="fact">
                <span class="fact-label">押金</span>
                <span class="fact-value">¥{{ homestay.deposit || 0 }}</span>
              </div>
            </div>

            <div class="tags" v-if="splitTags(homestay.styleTags).length">
              <span v-for="t in splitTags(homestay.styleTags)" :key="t" class="style-tag">{{ t }}</span>
            </div>

            <p class="intro" v-if="homestay.intro">{{ homestay.intro }}</p>
          </div>
        </div>

        <!-- 房型 -->
        <section class="wd-section">
          <div class="wd-section-head">
            <h2 class="wd-section-title">房型选择</h2>
            <span class="wd-section-sub-inline" v-if="homestay.rooms?.length">
              {{ homestay.rooms.length }} 种可选
            </span>
          </div>

          <div class="wd-grid wd-grid-3" v-if="homestay.rooms?.length">
            <article
              v-for="r in homestay.rooms"
              :key="r.id"
              :class="['wd-card room', { active: selectedRoom?.id === r.id }]"
              @click="onSelectRoom(r)"
            >
              <div class="room-media">
                <img :src="img(r.mainImage, r.name)" :alt="r.name" @error="imgError" />
                <span v-if="selectedRoom?.id === r.id" class="wd-chip wd-chip-indigo picked">已选</span>
              </div>
              <div class="room-body">
                <h3 class="room-name">{{ r.name }}</h3>
                <p class="room-sub">{{ r.bedType }} · {{ r.area }}㎡ · 住 {{ r.capacity }} 人</p>
                <p class="room-fac clamp-2" v-if="r.facilities">{{ r.facilities }}</p>
                <div class="room-foot">
                  <span class="room-price"><small>¥</small>{{ r.price }}<small>/晚</small></span>
                </div>
              </div>
            </article>
          </div>

          <div class="wd-card" v-else>
            <EmptyState title="暂无可订房型" desc="这家民宿还没有开放房型，先看看别家吧。" />
          </div>
        </section>

        <!-- 预订表单 -->
        <section class="wd-section" v-if="selectedRoom">
          <div class="wd-section-head">
            <h2 class="wd-section-title">预订信息</h2>
          </div>

          <div class="wd-card book-card">
            <el-form :model="form" label-width="96px" class="book-form">
              <el-form-item label="入住日期">
                <el-date-picker
                  v-model="form.dates"
                  type="daterange"
                  value-format="YYYY-MM-DD"
                  :disabled-date="disablePast"
                  start-placeholder="入住"
                  end-placeholder="离店"
                  @change="calcPrice"
                />
              </el-form-item>

              <el-form-item v-if="priceResult">
                <div class="price-detail">
                  <div class="nights">
                    <div v-for="d in priceResult.detail" :key="d.date" class="price-night">
                      <span>{{ d.date }}</span>
                      <span>¥{{ d.price }}</span>
                    </div>
                  </div>
                  <div class="price-total">
                    共 {{ priceResult.nights }} 晚，合计
                    <span class="total-amount">¥{{ priceResult.total }}</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="入住人">
                <el-input v-model="form.guestName" placeholder="请填写入住人姓名" class="input" />
              </el-form-item>
              <el-form-item label="身份证号">
                <el-input v-model="form.guestIdCard" placeholder="用于办理入住登记" class="input" />
              </el-form-item>
              <el-form-item label="联系电话">
                <el-input v-model="form.guestPhone" placeholder="方便店家联系你" class="input" />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" size="large" :loading="booking" @click="submitBooking">
                  提交预订并支付
                </el-button>
                <span class="safe-tip">提交后将跳转收银台（演示环境可模拟支付）</span>
              </el-form-item>
            </el-form>
          </div>
        </section>
      </template>

      <!-- 民宿不存在 -->
      <div class="wd-card" v-else>
        <EmptyState variant="network" title="没有找到这家民宿" desc="它可能已下架，或链接有误。">
          <router-link to="/hotel"><el-button type="primary">回到住宿列表</el-button></router-link>
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
const homestay = ref<any>({});
const selectedRoom = ref<any>(null);
const priceResult = ref<any>(null);
const booking = ref(false);
const loading = ref(true);
const form = reactive({
  dates: [dayjs().add(1, 'day').format('YYYY-MM-DD'), dayjs().add(2, 'day').format('YYYY-MM-DD')],
  guestName: '',
  guestIdCard: '',
  guestPhone: '',
});

function splitTags(tags: string) {
  return tags ? tags.split(',').filter((t) => t) : [];
}

function disablePast(d: Date) {
  return dayjs(d).isBefore(dayjs(), 'day');
}

async function load() {
  loading.value = true;
  try {
    homestay.value = await request.get(`/hotel/homestays/${route.params.id}`);
    if (homestay.value.rooms?.length) {
      selectedRoom.value = homestay.value.rooms[0];
      await calcPrice();
    }
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

function onSelectRoom(r: any) {
  selectedRoom.value = r;
  priceResult.value = null;
  if (form.dates) calcPrice();
}

async function calcPrice() {
  if (!selectedRoom.value || !form.dates || form.dates.length !== 2) return;
  try {
    priceResult.value = await request.get('/hotel/price', {
      params: {
        roomTypeId: selectedRoom.value.id,
        checkInDate: form.dates[0],
        checkOutDate: form.dates[1],
      },
    });
  } catch {
    priceResult.value = null;
  }
}

async function submitBooking() {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }
  if (!form.dates || form.dates.length !== 2) {
    ElMessage.warning('请选择入住日期');
    return;
  }
  if (!form.guestName || !form.guestIdCard || !form.guestPhone) {
    ElMessage.warning('请填写入住人信息');
    return;
  }
  booking.value = true;
  try {
    const order: any = await request.post('/hotel/bookings', {
      homestayId: homestay.value.id,
      roomTypeId: selectedRoom.value.id,
      checkInDate: form.dates[0],
      checkOutDate: form.dates[1],
      guestName: form.guestName,
      guestIdCard: form.guestIdCard,
      guestPhone: form.guestPhone,
    });
    router.push(`/pay/${order.id}`);
  } catch {
    // 已提示
  } finally {
    booking.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.homestay-detail {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 480px) minmax(0, 1fr);
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
.addr {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.facts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
  color: var(--wd-text-1);
  font-weight: 600;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--wd-s4);
}
.style-tag {
  padding: 4px 13px;
  border-radius: var(--wd-r-pill);
  font-size: 12.5px;
  color: var(--wd-indigo);
  background: #eef2f9;
}

.intro {
  margin-top: var(--wd-s4);
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--wd-text-2);
}

.wd-section-sub-inline {
  font-size: 13px;
  color: var(--wd-text-4);
}

/* 房型卡 */
.room {
  cursor: pointer;
  border-width: 2px;
}
.room:hover {
  transform: translateY(-6px);
  box-shadow: var(--wd-sh-3);
}
.room.active {
  border-color: var(--wd-brand);
  box-shadow: var(--wd-sh-brand);
}
.room-media {
  position: relative;
  height: 168px;
  overflow: hidden;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.room-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--wd-ease);
}
.room:hover .room-media img {
  transform: scale(1.06);
}
.picked {
  position: absolute;
  top: 12px;
  right: 12px;
}
.room-body {
  padding: var(--wd-s4) var(--wd-s5) var(--wd-s5);
}
.room-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.room-sub {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.room-fac {
  margin-top: 8px;
  min-height: 36px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--wd-text-4);
}
.room-foot {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin-top: var(--wd-s3);
  padding-top: var(--wd-s3);
  border-top: 1px solid var(--wd-border);
}
.room-price {
  font-size: 21px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.room-price small {
  font-size: 12px;
  font-weight: 500;
  color: var(--wd-text-4);
}

/* 预订表单 */
.book-card {
  padding: var(--wd-s6);
}
.book-form {
  max-width: 620px;
}
.input {
  width: 280px;
}
.price-detail {
  width: 100%;
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  background: linear-gradient(120deg, #eef3fb, #f7fafe);
}
.nights {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: var(--wd-s3);
  border-bottom: 1px dashed rgba(var(--wd-brand-rgb), 0.2);
}
.price-night {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--wd-text-2);
  font-variant-numeric: tabular-nums;
}
.price-total {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 6px;
  padding-top: var(--wd-s3);
  font-size: 13.5px;
  color: var(--wd-text-2);
}
.total-amount {
  font-size: 24px;
  font-weight: 800;
  color: var(--wd-brand);
}
.safe-tip {
  margin-left: 14px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 骨架 */
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
