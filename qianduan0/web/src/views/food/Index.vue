<template>
  <div>
    <TopNav />
    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">苗乡美食</h1>
        <p class="page-sub">长桌宴、酸汤鱼与山野土产，从苗寨餐桌到你家厨房</p>
      </header>

      <el-tabs v-model="tab" class="food-tabs">
        <!-- ============ 餐厅 ============ -->
        <el-tab-pane label="苗乡餐厅 · 餐位预订" name="restaurants">
          <div class="toolbar glass-strong">
            <el-input
              v-model="restKeyword"
              placeholder="搜索餐厅"
              class="search"
              clearable
              :prefix-icon="Search"
              @keyup.enter="loadRest(1)"
            />
            <el-button type="primary" @click="loadRest(1)">搜索</el-button>
            <el-radio-group v-model="restSort" class="sorts" @change="loadRest(1)">
              <el-radio-button value="rating">评分优先</el-radio-button>
              <el-radio-button value="capacity">容纳人数</el-radio-button>
            </el-radio-group>
          </div>

          <div v-if="restLoading" class="wd-grid wd-grid-2">
            <SkeletonCard v-for="i in 4" :key="`rs${i}`" cover="240px" />
          </div>

          <div v-else-if="restaurants.length" class="wd-grid wd-grid-2">
            <article
              v-for="(r, i) in restaurants"
              :key="r.id"
              class="wd-card wd-card-hover wd-rise restaurant-card"
              :style="{ animationDelay: `${i * 60}ms` }"
              @click="$router.push(`/food/restaurant/${r.id}`)"
            >
              <div class="wd-media rest-media">
                <img :src="img(r.mainImage, r.name, true)" :alt="r.name" @error="imgError" />
                <span class="rating-chip wd-chip">
                  <el-icon><StarFilled /></el-icon> {{ r.rating }}
                </span>
              </div>
              <div class="wd-card-body">
                <div class="wd-title clamp-1">{{ r.name }}</div>
                <div class="wd-desc clamp-2">{{ r.intro || '地道苗家风味，欢迎预订餐位' }}</div>
                <div class="rest-foot">
                  <span class="seat-tag">
                    <el-icon><UserFilled /></el-icon> 可容纳 {{ r.capacity }} 人
                  </span>
                  <span class="book-btn">预订餐位 <el-icon><ArrowRight /></el-icon></span>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="wd-card">
            <EmptyState
              variant="search"
              title="没有找到餐厅"
              desc="换个关键词试试，或者看看苗乡特产。"
            />
          </div>
        </el-tab-pane>

        <!-- ============ 农产品 ============ -->
        <el-tab-pane label="苗乡特产 · 农产品" name="farm">
          <div class="toolbar glass-strong">
            <el-select v-model="farmCatId" placeholder="全部分类" clearable class="cat-select" @change="loadFarm(1)">
              <el-option v-for="c in farmCats" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
            <el-input
              v-model="farmKeyword"
              placeholder="搜索特产"
              class="search"
              clearable
              :prefix-icon="Search"
              @keyup.enter="loadFarm(1)"
            />
            <el-button type="primary" @click="loadFarm(1)">搜索</el-button>
          </div>

          <div v-if="farmLoading" class="wd-grid wd-grid-4">
            <SkeletonCard v-for="i in 8" :key="`fs${i}`" cover="180px" />
          </div>

          <div v-else-if="farmList.length" class="wd-grid wd-grid-4">
            <article
              v-for="(f, i) in farmList"
              :key="f.id"
              class="wd-card wd-card-hover wd-rise"
              :style="{ animationDelay: `${Math.min(i, 8) * 50}ms` }"
              @click="showFarm(f)"
            >
              <div class="wd-media" style="height: 180px">
                <img :src="img(f.mainImage, f.name, true)" :alt="f.name" @error="imgError" />
                <span v-if="f.origin" class="wd-chip card-chip">{{ f.origin }}</span>
              </div>
              <div class="wd-card-body">
                <div class="wd-title clamp-1">{{ f.name }}</div>
                <div class="wd-desc clamp-1">{{ f.spec || '苗乡直供 · 当季新鲜' }}</div>
                <div class="card-foot">
                  <span class="wd-price">¥{{ f.price }}</span>
                  <el-button size="small" type="primary" @click.stop="addFarmCart(f)">
                    <el-icon><ShoppingCart /></el-icon>
                  </el-button>
                </div>
              </div>
            </article>
          </div>

          <div v-else class="wd-card">
            <EmptyState
              variant="search"
              title="没有找到特产"
              desc="试试其他分类，或者清空关键词重新搜索。"
            />
          </div>

          <el-pagination
            v-if="farmTotal > 12"
            layout="prev, pager, next"
            :total="farmTotal"
            :page-size="12"
            :current-page="farmPage"
            class="pager"
            @current-change="loadFarm"
          />

          <!-- 农产品详情弹窗 -->
          <el-dialog v-model="farmDialog" :title="currentFarm?.name" width="580px">
            <div class="dialog-media">
              <img :src="img(currentFarm?.mainImage, currentFarm?.name, true)" :alt="currentFarm?.name" @error="imgError" />
            </div>
            <div class="dialog-meta">
              <span v-if="currentFarm?.origin" class="mini-tag">产地溯源：{{ currentFarm.origin }}</span>
              <span v-if="currentFarm?.shelfLife" class="mini-tag">保质期：{{ currentFarm.shelfLife }}</span>
            </div>
            <p v-if="currentFarm?.description" class="dialog-desc">{{ currentFarm.description }}</p>
            <template #footer>
              <div class="dialog-foot">
                <el-input-number v-model="farmQty" :min="1" :max="99" />
                <el-button type="primary" size="large" @click="addFarmCart(currentFarm, true)">
                  加入购物车
                </el-button>
              </div>
            </template>
          </el-dialog>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowRight,
  Search,
  ShoppingCart,
  StarFilled,
  UserFilled,
} from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';
import { img, imgError } from '../../utils/media';

const router = useRouter();
const userStore = useUserStore();
const tab = ref('restaurants');

const restaurants = ref<any[]>([]);
const restKeyword = ref('');
const restSort = ref('rating');
const restPage = ref(1);
const restTotal = ref(0);
const restLoading = ref(false);

const farmCats = ref<any[]>([]);
const farmCatId = ref<number | undefined>(undefined);
const farmKeyword = ref('');
const farmList = ref<any[]>([]);
const farmPage = ref(1);
const farmTotal = ref(0);
const farmLoading = ref(false);
const farmDialog = ref(false);
const currentFarm = ref<any>(null);
const farmQty = ref(1);

async function loadRest(p = 1) {
  restPage.value = p;
  restLoading.value = true;
  try {
    const data: any = await request.get('/food/restaurants', {
      params: {
        sort: restSort.value,
        keyword: restKeyword.value || undefined,
        page: restPage.value,
        pageSize: 10,
      },
    });
    restaurants.value = data.list || [];
    restTotal.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    restLoading.value = false;
  }
}

async function loadFarm(p = 1) {
  farmPage.value = p;
  farmLoading.value = true;
  try {
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
  } catch {
    // 已提示
  } finally {
    farmLoading.value = false;
  }
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

.food-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--wd-s6);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: var(--wd-s6);
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.search {
  width: 280px;
}
.cat-select {
  width: 160px;
}
.sorts {
  margin-left: auto;
}

/* 餐厅卡片：图文左右排布，更有呼吸感 */
.restaurant-card {
  display: flex;
}
.rest-media {
  width: 45%;
  min-height: 200px;
  flex-shrink: 0;
}
.restaurant-card .wd-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rating-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}
.rest-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 16px;
}
.seat-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.book-btn {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-brand);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.3s var(--wd-ease);
}
.wd-card:hover .book-btn {
  opacity: 1;
  transform: none;
}

.card-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.pager {
  margin-top: var(--wd-s8);
  justify-content: center;
}

/* 弹窗 */
.dialog-media {
  width: 100%;
  height: 260px;
  border-radius: var(--wd-r-md);
  overflow: hidden;
  background: #eef1f6;
}
.dialog-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.dialog-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.mini-tag {
  padding: 4px 12px;
  border-radius: var(--wd-r-pill);
  font-size: 12px;
  color: var(--wd-indigo);
  background: #eef2f9;
}
.dialog-desc {
  margin-top: 12px;
  font-size: 13.5px;
  line-height: 1.8;
  color: var(--wd-text-2);
}
.dialog-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
    border-radius: var(--wd-r-lg);
  }
  .search {
    width: 100%;
  }
  .sorts {
    margin-left: 0;
  }
  .restaurant-card {
    flex-direction: column;
  }
  .rest-media {
    width: 100%;
  }
}
</style>
