<template>
  <div>
    <TopNav />
    <div class="page">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索民宿名称/地址" class="search" clearable @keyup.enter="load(1)" />
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <div class="price-range">
          价格
          <el-input-number v-model="minPrice" :min="0" :max="9999" :controls="false" placeholder="最低" class="price-input" />
          -
          <el-input-number v-model="maxPrice" :min="0" :max="9999" :controls="false" placeholder="最高" class="price-input" />
        </div>
        <el-button @click="load(1)">筛选</el-button>
        <el-radio-group v-model="sort" class="sorts" @change="load(1)">
          <el-radio-button value="rating">评分优先</el-radio-button>
          <el-radio-button value="price_asc">价格升序</el-radio-button>
        </el-radio-group>
      </div>

      <el-empty v-if="!loading && !list.length" description="暂无民宿" />
      <div class="grid">
        <el-card v-for="h in list" :key="h.id" class="item" shadow="hover" @click="$router.push(`/hotel/${h.id}`)">
          <img :src="h.mainImage" class="item-img" />
          <div class="item-title">{{ h.name }}</div>
          <div class="item-sub">{{ h.address }}</div>
          <div class="tags">
            <el-tag v-for="t in splitTags(h.styleTags)" :key="t" size="small" class="tag">{{ t }}</el-tag>
          </div>
          <div class="item-bottom">
            <span class="price"><span v-if="h.minPrice !== null && h.minPrice !== undefined">¥{{ h.minPrice }} 起</span></span>
            <span class="sales">评分 {{ h.rating }}</span>
          </div>
        </el-card>
      </div>

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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const keyword = ref('');
const minPrice = ref<number | undefined>(undefined);
const maxPrice = ref<number | undefined>(undefined);
const sort = ref('rating');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

function splitTags(tags: string) {
  return tags ? tags.split(',').filter(t => t) : [];
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/hotel/homestays', {
      params: {
        keyword: keyword.value || undefined,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
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

onMounted(() => load());
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
  width: 260px;
}
.price-range {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  margin-left: 12px;
}
.price-input {
  width: 90px;
}
.sorts {
  margin-left: auto;
}
.grid {
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
.tags {
  margin-top: 6px;
}
.tag {
  margin-right: 4px;
  margin-top: 4px;
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
</style>
