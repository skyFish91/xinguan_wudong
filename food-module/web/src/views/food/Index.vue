<template>
  <div>
    <TopNav />
    <div class="page">
      <el-tabs v-model="tab">
        <!-- 餐厅 -->
        <el-tab-pane label="苗乡餐厅 · 餐位预订" name="restaurants">
          <div class="toolbar">
            <el-input v-model="restKeyword" placeholder="搜索餐厅" class="search" clearable @keyup.enter="loadRest(1)" />
            <el-button type="primary" @click="loadRest(1)">搜索</el-button>
            <el-radio-group v-model="restSort" class="sorts" @change="loadRest(1)">
              <el-radio-button value="rating">评分优先</el-radio-button>
              <el-radio-button value="capacity">容纳人数</el-radio-button>
              <el-radio-button value="price">人均价格</el-radio-button>
            </el-radio-group>
          </div>
          <div class="grid-3">
            <el-card v-for="r in restaurants" :key="r.id" shadow="hover" class="item" @click="$router.push(`/food/restaurant/${r.id}`)">
              <img :src="r.mainImage" class="item-img" />
              <div class="item-title">{{ r.name }}</div>
              <div class="item-sub">{{ r.intro }}</div>
              <div class="item-bottom">
                <span class="price">评分 {{ r.rating }}</span>
                <span class="sales">可容纳 {{ r.capacity }} 人</span>
              </div>
            </el-card>
          </div>
          <el-pagination
            v-if="restTotal > 10"
            layout="prev, pager, next"
            :total="restTotal"
            :page-size="10"
            :current-page="restPage"
            class="pager"
            @current-change="loadRest"
          />
        </el-tab-pane>

        <!-- 农产品 -->
        <el-tab-pane label="苗乡特产 · 农产品" name="farm">
          <div class="toolbar">
            <el-select v-model="farmCatId" placeholder="全部分类" clearable class="cat-select" @change="loadFarm(1)">
              <el-option v-for="c in farmCats" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
            <el-input v-model="farmKeyword" placeholder="搜索特产" class="search" clearable @keyup.enter="loadFarm(1)" />
            <el-button type="primary" @click="loadFarm(1)">搜索</el-button>
            <el-select v-model="farmSort" placeholder="默认排序" class="sort-select" @change="loadFarm(1)">
              <el-option label="默认排序" value="default" />
              <el-option label="销量优先" value="sales" />
              <el-option label="价格从低到高" value="price_asc" />
              <el-option label="价格从高到低" value="price_desc" />
            </el-select>
          </div>
          <div class="grid-4">
            <el-card v-for="f in farmList" :key="f.id" shadow="hover" class="item" @click="$router.push(`/food/farm/${f.id}`)">
              <img :src="f.mainImage" class="item-img" />
              <div class="item-title">{{ f.name }}</div>
              <div class="item-sub">{{ f.spec }}</div>
              <div class="item-bottom">
                <span class="price">¥{{ f.price }}</span>
                <el-button size="small" type="danger" @click.stop="addFarmCart(f)">加购物车</el-button>
              </div>
            </el-card>
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

        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const tab = ref('restaurants');

const restaurants = ref<any[]>([]);
const restKeyword = ref('');
const restSort = ref('rating');
const restPage = ref(1);
const restTotal = ref(0);

const farmCats = ref<any[]>([]);
const farmCatId = ref<number | undefined>(undefined);
const farmKeyword = ref('');
const farmSort = ref('default');
const farmList = ref<any[]>([]);
const farmPage = ref(1);
const farmTotal = ref(0);

async function loadRest(p = 1) {
  restPage.value = p;
  const data: any = await request.get('/food/restaurants', {
    params: { sort: restSort.value, keyword: restKeyword.value || undefined, page: restPage.value, pageSize: 10 },
  });
  restaurants.value = data.list || [];
  restTotal.value = data.total || 0;
}

async function loadFarm(p = 1) {
  farmPage.value = p;
  const data: any = await request.get('/food/farm/products', {
    params: {
      categoryId: farmCatId.value,
      keyword: farmKeyword.value || undefined,
      sort: farmSort.value,
      page: farmPage.value,
      pageSize: 12,
    },
  });
  farmList.value = data.list || [];
  farmTotal.value = data.total || 0;
}

async function addFarmCart(f: any, quantity = 1) {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录');
    router.push('/login');
    return;
  }
  try {
    await request.post('/cart/add', { farmProductId: f.id, quantity });
    ElMessage.success('已加入购物车');
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
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.search {
  width: 280px;
}
.sorts {
  margin-left: auto;
}
.cat-select {
  width: 160px;
}
.sort-select {
  width: 150px;
  margin-left: auto;
}
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.item {
  cursor: pointer;
}
.item-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}
.item-title {
  margin-top: 8px;
  font-weight: 600;
}
.item-sub {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}
.price {
  color: #c0392b;
  font-weight: bold;
}
.sales {
  font-size: 12px;
  color: #999;
}
.pager {
  margin-top: 20px;
  justify-content: center;
}
.dialog-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 12px;
}
.dialog-line {
  line-height: 1.8;
  color: #555;
}
.qty {
  margin-right: 10px;
}
</style>
