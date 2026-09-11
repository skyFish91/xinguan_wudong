<template>
  <div>
    <TopNav />
    <div class="wd-container cart-page">
      <header class="page-head">
        <h1 class="page-title">购物车</h1>
        <p class="page-sub">确认规格与数量后勾选结算，支持按商家自动拆单</p>
      </header>

      <!-- 骨架屏 -->
      <div v-if="loading" class="rows">
        <div v-for="i in 3" :key="`s${i}`" class="wd-skel-card row-skel">
          <div class="wd-skeleton" style="width: 92px; height: 92px; border-radius: 12px"></div>
          <div class="row-skel-main">
            <div class="wd-skeleton wd-skel-line wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-line wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <template v-else-if="list.length">
        <div class="rows">
          <div
            v-for="(item, i) in list"
            :key="item.id"
            class="wd-card row wd-rise"
            :class="{ 'is-invalid': item.invalid }"
            :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
          >
            <el-checkbox
              v-model="checkedMap[item.id]"
              :disabled="item.invalid || item.stockNotEnough"
              class="row-check"
            />
            <div class="row-media">
              <img :src="img(item.image, item.title)" :alt="item.title" @error="imgError" />
            </div>
            <div class="row-main">
              <div class="row-title clamp-1">{{ item.title }}</div>
              <div class="row-spec">{{ item.specName || '默认规格' }}</div>
              <div class="row-warn">
                <span v-if="item.invalid" class="badge badge-danger">已失效</span>
                <span v-else-if="item.stockNotEnough" class="badge badge-warn">
                  库存不足（仅剩 {{ item.stock }}）
                </span>
                <span v-else class="badge badge-ok">现货充足</span>
              </div>
            </div>
            <div class="row-price">¥{{ item.price }}</div>
            <el-input-number
              v-model="item.quantity"
              :min="1"
              :max="item.stock || 99"
              size="small"
              @change="changeQty(item)"
            />
            <el-button link type="danger" class="row-del" @click="removeItem(item)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 结算栏：液态玻璃吸底 -->
        <div class="checkout-bar glass-strong">
          <el-checkbox v-model="checkAll" @change="toggleAll">全选</el-checkbox>
          <div class="checkout-right">
            <div class="sum">
              已选 <b>{{ checkedIds.length }}</b> 件 · 合计
              <span class="sum-amount">¥{{ totalAmount.toFixed(2) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="!checkedIds.length"
              :loading="checkingOut"
              @click="checkout"
            >
              去结算
            </el-button>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          variant="default"
          title="购物车还是空的"
          desc="挑几件非遗好物或苗乡特产吧，下单后可以在这里一起结算。"
        >
          <router-link to="/clothing"><el-button type="primary">逛非遗好物</el-button></router-link>
          <router-link to="/food"><el-button>看苗乡美食</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { img, imgError } from '../../utils/media';

const router = useRouter();
const list = ref<any[]>([]);
const loading = ref(true);
const checkedMap = reactive<Record<number, boolean>>({});
const checkAll = ref(false);
const checkingOut = ref(false);

const checkedIds = computed(() => list.value.filter((i) => checkedMap[i.id]).map((i) => i.id));
const totalAmount = computed(() =>
  list.value.filter((i) => checkedMap[i.id]).reduce((sum, i) => sum + Number(i.price) * i.quantity, 0)
);

async function load() {
  loading.value = true;
  try {
    list.value = await request.get('/cart/');
    list.value.forEach((i) => {
      // 无效或库存不足的条目默认不勾选；数量超过库存时修正
      if (checkedMap[i.id] === undefined) {
        checkedMap[i.id] = !i.invalid && !i.stockNotEnough;
      }
      if (i.stock && i.quantity > i.stock) {
        i.quantity = i.stock;
      }
    });
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

function toggleAll(v: boolean) {
  list.value.forEach((i) => {
    if (!i.invalid && !i.stockNotEnough) {
      checkedMap[i.id] = v;
    }
  });
}

async function changeQty(item: any) {
  try {
    list.value = await request.put(`/cart/${item.id}`, { quantity: item.quantity });
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 已提示
  }
}

async function removeItem(item: any) {
  try {
    await ElMessageBox.confirm(`确定移除「${item.title}」？`, '提示', { type: 'warning' });
    list.value = await request.post(`/cart/${item.id}/remove`);
    delete checkedMap[item.id];
    window.dispatchEvent(new Event('cart-changed'));
  } catch {
    // 取消删除或已提示
  }
}

async function checkout() {
  if (!checkedIds.value.length) {
    ElMessage.warning('请先勾选要结算的商品');
    return;
  }
  checkingOut.value = true;
  try {
    const orders: any[] = await request.post('/cart/checkout', { cartIds: checkedIds.value });
    window.dispatchEvent(new Event('cart-changed'));
    if (orders.length === 1) {
      router.push(`/pay/${orders[0].id}`);
    } else {
      ElMessage.success(`已按商家拆分为 ${orders.length} 个订单`);
      router.push('/orders?status=0');
    }
  } catch {
    // 已提示
  } finally {
    checkingOut.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.cart-page {
  padding-top: var(--wd-s7);
  padding-bottom: var(--wd-s10);
}
.page-head {
  margin-bottom: var(--wd-s6);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.rows {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s4);
}

/* 商品行 */
.row {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
  padding: var(--wd-s5);
  transition: box-shadow 0.3s var(--wd-ease), border-color 0.3s var(--wd-ease),
    transform 0.3s var(--wd-ease);
}
.row:hover {
  box-shadow: var(--wd-sh-2);
  transform: translateY(-2px);
}
.row.is-invalid {
  opacity: 0.62;
}
.row-check {
  flex-shrink: 0;
}
.row-media {
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  border-radius: var(--wd-r-sm);
  overflow: hidden;
  background: #eef1f6;
}
.row-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.row-main {
  flex: 1;
  min-width: 0;
}
.row-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.row-spec {
  margin-top: 5px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.row-warn {
  margin-top: 8px;
}
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  font-weight: 500;
}
.badge-ok {
  color: #2f7a55;
  background: #e8f6ee;
}
.badge-warn {
  color: #a8761a;
  background: #fdf4e0;
}
.badge-danger {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}

.row-price {
  width: 96px;
  text-align: right;
  font-size: 17px;
  font-weight: 700;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.row-del {
  opacity: 0.5;
  transition: opacity 0.24s var(--wd-ease);
}
.row:hover .row-del {
  opacity: 1;
}

/* 结算栏 */
.checkout-bar {
  position: sticky;
  bottom: var(--wd-s5);
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s5);
  margin-top: var(--wd-s6);
  padding: 14px 22px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-3);
}
.checkout-right {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
}
.sum {
  font-size: 13.5px;
  color: var(--wd-text-3);
}
.sum b {
  color: var(--wd-text-1);
}
.sum-amount {
  margin-left: 4px;
  font-size: 22px;
  font-weight: 800;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}

/* 骨架 */
.row-skel {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
  padding: var(--wd-s5);
}
.row-skel-main {
  flex: 1;
}

@media (max-width: 720px) {
  .row {
    flex-wrap: wrap;
  }
  .row-price {
    width: auto;
    text-align: left;
  }
  .checkout-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    border-radius: var(--wd-r-lg);
  }
  .checkout-right {
    justify-content: space-between;
  }
}
</style>
