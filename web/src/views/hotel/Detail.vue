<template>
  <div>
    <TopNav />
    <div class="page" v-if="homestay.id">
      <div class="top">
        <img :src="homestay.mainImage" class="main-img" />
        <div class="info">
          <h2>{{ homestay.name }}</h2>
          <div class="line">地址：{{ homestay.address }}</div>
          <div class="line">入住 {{ homestay.checkInTime }} · 离店 {{ homestay.checkOutTime }}</div>
          <div class="line">评分 {{ homestay.rating }} · 含早餐{{ homestay.hasBreakfast ? '是' : '否' }} · 允许宠物{{ homestay.petPolicy ? '是' : '否' }} · 押金 ¥{{ homestay.deposit }}</div>
          <div class="tags">
            <el-tag v-for="t in splitTags(homestay.styleTags)" :key="t" size="small" class="tag">{{ t }}</el-tag>
          </div>
          <div class="line intro">{{ homestay.intro }}</div>
        </div>
      </div>

      <el-divider content-position="left">房型选择</el-divider>
      <div class="rooms">
        <el-card
          v-for="r in homestay.rooms"
          :key="r.id"
          class="room"
          :class="{ active: selectedRoom?.id === r.id }"
          @click="onSelectRoom(r)"
        >
          <img v-if="r.mainImage" :src="r.mainImage" class="room-img" />
          <div class="room-name">{{ r.name }}</div>
          <div class="room-sub">{{ r.bedType }} · {{ r.area }}㎡ · 住 {{ r.capacity }} 人</div>
          <div class="room-fac">{{ r.facilities }}</div>
          <div class="room-price">¥{{ r.price }} / 晚</div>
        </el-card>
      </div>

      <!-- 预订表单 -->
      <template v-if="selectedRoom">
        <el-divider content-position="left">预订信息</el-divider>
        <el-form :model="form" label-width="100px" class="book-form">
          <el-form-item label="入住日期">
            <el-date-picker
              v-model="form.dates"
              type="daterange"
              value-format="YYYY-MM-DD"
              :disabled-date="disablePast"
              @change="calcPrice"
            />
          </el-form-item>
          <el-form-item v-if="priceResult">
            <div class="price-detail">
              <div v-for="d in priceResult.detail" :key="d.date" class="price-night">{{ d.date }}：¥{{ d.price }}</div>
              <div class="price-total">共 {{ priceResult.nights }} 晚，合计 <span class="red">¥{{ priceResult.total }}</span></div>
            </div>
          </el-form-item>
          <el-form-item label="入住人">
            <el-input v-model="form.guestName" class="input" />
          </el-form-item>
          <el-form-item label="身份证号">
            <el-input v-model="form.guestIdCard" class="input" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.guestPhone" class="input" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="booking" @click="submitBooking">提交预订并支付</el-button>
          </el-form-item>
        </el-form>
      </template>
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
const homestay = ref<any>({});
const selectedRoom = ref<any>(null);
const priceResult = ref<any>(null);
const booking = ref(false);
const form = reactive({
  dates: [dayjs().add(1, 'day').format('YYYY-MM-DD'), dayjs().add(2, 'day').format('YYYY-MM-DD')],
  guestName: '',
  guestIdCard: '',
  guestPhone: '',
});

function splitTags(tags: string) {
  return tags ? tags.split(',').filter(t => t) : [];
}

function disablePast(d: Date) {
  return dayjs(d).isBefore(dayjs(), 'day');
}

async function load() {
  try {
    homestay.value = await request.get(`/hotel/homestays/${route.params.id}`);
    if (homestay.value.rooms?.length) {
      selectedRoom.value = homestay.value.rooms[0];
      await calcPrice();
    }
  } catch {
    // 已提示
  }
}

function onSelectRoom(r: any) {
  selectedRoom.value = r;
  priceResult.value = null;
  if (form.dates) {
    calcPrice();
  }
}

async function calcPrice() {
  if (!selectedRoom.value || !form.dates || form.dates.length !== 2) {
    return;
  }
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
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}
.top {
  display: flex;
  gap: 24px;
}
.main-img {
  width: 420px;
  height: 300px;
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
.tags {
  margin-top: 10px;
}
.tag {
  margin-right: 6px;
}
.rooms {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.room {
  width: 260px;
  cursor: pointer;
  border: 2px solid transparent;
}
.room.active {
  border-color: #c0392b;
}
.room-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
}
.room-name {
  margin-top: 8px;
  font-weight: 600;
}
.room-sub {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
.room-fac {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}
.room-price {
  margin-top: 8px;
  color: #c0392b;
  font-weight: bold;
}
.book-form {
  max-width: 560px;
}
.input {
  width: 260px;
}
.price-detail {
  background: #fdf5f5;
  padding: 10px 14px;
  border-radius: 6px;
  line-height: 1.8;
}
.price-night {
  color: #666;
}
.price-total {
  font-weight: 600;
}
.red {
  color: #c0392b;
  font-size: 20px;
}
</style>
