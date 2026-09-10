<template>
  <div>
    <TopNav />
    <div class="page">
      <!-- 搜索与排序 -->
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索非遗好物" class="search" clearable @keyup.enter="load(1)" />
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <el-radio-group v-model="sort" class="sorts" @change="load(1)">
          <el-radio-button value="default">综合</el-radio-button>
          <el-radio-button value="sales">销量</el-radio-button>
          <el-radio-button value="price_asc">价格升序</el-radio-button>
          <el-radio-button value="price_desc">价格降序</el-radio-button>
        </el-radio-group>
      </div>

      <div class="body">
        <!-- 分类树 -->
        <div class="side">
          <div
            v-for="c in categories"
            :key="c.id"
            class="cat"
            :class="{ active: topCatId === c.id }"
            @click="onTopCat(c)"
          >
            {{ c.name }}
          </div>
        </div>

        <!-- 商品 -->
        <div class="main">
          <div v-if="subCats.length" class="sub-cats">
            <el-tag
              v-for="s in subCats"
              :key="s.id"
              :effect="categoryId === s.id ? 'dark' : 'plain'"
              class="sub-tag"
              @click="onSubCat(s)"
            >
              {{ s.name }}
            </el-tag>
          </div>

          <el-empty v-if="!loading && !list.length" description="暂无商品" />
          <TransitionGroup name="product-card" tag="div" class="grid">
            <el-card v-for="p in list" :key="p.id" class="item" shadow="hover" @click="$router.push(`/clothing/${p.id}`)">
              <img :src="p.mainImage" class="item-img" />
              <div class="item-title">{{ p.title }}</div>
              <div class="item-sub">{{ p.subtitle }}</div>
              <div class="item-bottom">
                <span class="price">¥{{ p.price }}</span>
                <span class="sales">已售 {{ p.sales }}</span>
              </div>
            </el-card>
          </TransitionGroup>

          <el-pagination
            v-if="total > pageSize"
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            :current-page="page"
            class="pager"
            @current-change="load"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const categories = ref<any[]>([]);
const topCatId = ref<number>(0);
const subCats = ref<any[]>([]);
const categoryId = ref<number | undefined>(undefined);
const keyword = ref('');
const sort = ref('default');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/clothing/products', {
      params: {
        categoryId: categoryId.value,
        keyword: keyword.value || undefined,
        sort: sort.value,
        page: page.value,
        pageSize,
      },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

function onTopCat(c: any) {
  topCatId.value = c.id;
  subCats.value = c.children || [];
  // 顶级分类需要传给后端；后端会自动包含其下的二级分类。
  categoryId.value = c.id;
  load(1);
}

function onSubCat(s: any) {
  categoryId.value = categoryId.value === s.id ? undefined : s.id;
  load(1);
}

onMounted(async () => {
  try {
    categories.value = await request.get('/clothing/categories');
  } catch {
    // 已提示
  }
  load(1);
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
  width: 300px;
}
.sorts {
  margin-left: auto;
}
.body {
  display: flex;
  gap: 20px;
}
.side {
  width: 160px;
  flex-shrink: 0;
  border-right: 1px solid #eee;
}
.cat {
  padding: 10px 16px;
  cursor: pointer;
  color: #333;
  border-radius: 4px;
}
.cat:hover {
  background: #f5f5f5;
}
.cat.active {
  background: #c0392b;
  color: #fff;
}
.main {
  flex: 1;
}
.sub-cats {
  margin-bottom: 12px;
}
.sub-tag {
  margin-right: 8px;
  cursor: pointer;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.item {
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}
.item:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 24px rgba(66, 44, 28, 0.14);
}
.item-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  border-radius: 4px;
  display: block;
  transition: transform 0.35s ease;
}
.item:hover .item-img {
  transform: scale(1.045);
}
.item-title {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.product-card-enter-active,
.product-card-move {
  transition: opacity 0.32s ease, transform 0.32s ease;
}
.product-card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
@media (prefers-reduced-motion: reduce) {
  .item,
  .item-img,
  .product-card-enter-active,
  .product-card-move {
    transition: none;
  }
}
</style>
