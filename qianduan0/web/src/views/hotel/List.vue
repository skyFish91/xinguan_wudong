<template>
  <div>
    <TopNav />
    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">民宿住宿</h1>
        <p class="page-sub">吊脚楼、木楼小院与山景房，住进苗寨的清晨与夜色</p>
      </header>

      <div class="toolbar glass-strong">
        <el-input
          v-model="keyword"
          placeholder="搜索民宿名称 / 地址"
          class="search"
          clearable
          :prefix-icon="Search"
          @keyup.enter="load(1)"
        />
        <div class="price-range">
          <span class="pr-label">价格</span>
          <el-input-number v-model="minPrice" :min="0" :max="9999" :controls="false" placeholder="最低" class="price-input" />
          <span class="pr-dash">—</span>
          <el-input-number v-model="maxPrice" :min="0" :max="9999" :controls="false" placeholder="最高" class="price-input" />
        </div>
        <el-button @click="load(1)">筛选</el-button>
        <el-radio-group v-model="sort" class="sorts" @change="load(1)">
          <el-radio-button value="rating">评分优先</el-radio-button>
          <el-radio-button value="price_asc">价格从低到高</el-radio-button>
        </el-radio-group>
      </div>

      <div v-if="!loading && list.length" class="result-bar">
        共 <b>{{ total }}</b> 家美宿
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="wd-grid wd-grid-3">
        <SkeletonCard v-for="i in 6" :key="`s${i}`" cover="230px" />
      </div>

      <!-- 民宿卡片 -->
      <div v-else-if="list.length" class="wd-grid wd-grid-3">
        <article
          v-for="(h, i) in list"
          :key="h.id"
          class="wd-card wd-card-hover wd-rise"
          :style="{ animationDelay: `${Math.min(i, 6) * 60}ms` }"
          @click="$router.push(`/hotel/${h.id}`)"
        >
          <div class="wd-media" style="height: 230px">
            <img :src="img(h.mainImage, h.name, true)" :alt="h.name" @error="imgError" />
            <span class="rating-chip wd-chip">
              <el-icon><StarFilled /></el-icon> {{ h.rating }}
            </span>
            <div class="place-overlay">
              <span class="place-name">{{ h.name }}</span>
              <span class="place-addr">
                <el-icon><LocationInformation /></el-icon> {{ h.address }}
              </span>
            </div>
          </div>
          <div class="wd-card-body">
            <div class="wd-title clamp-1">{{ h.name }}</div>
            <div class="wd-desc clamp-1">{{ h.address }}</div>
            <div v-if="splitTags(h.styleTags).length" class="tag-row">
              <span v-for="t in splitTags(h.styleTags).slice(0, 3)" :key="t" class="mini-tag">{{ t }}</span>
            </div>
            <div class="card-foot">
              <span class="wd-price">
                <template v-if="h.minPrice !== null && h.minPrice !== undefined">¥{{ h.minPrice }} <small>起/晚</small></template>
                <template v-else>价格待定</template>
              </span>
              <span class="buy-hint">查看房型 <el-icon><ArrowRight /></el-icon></span>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          variant="search"
          :title="hasFilter ? '没有符合条件的民宿' : '暂无民宿上架'"
          :desc="hasFilter ? '试着放宽价格区间，或清空关键词重新搜索。' : '苗寨的房源正在陆续入驻，先去看看别的吧。'"
        >
          <el-button v-if="hasFilter" @click="resetFilter">清空筛选</el-button>
          <router-link v-else to="/travel"><el-button type="primary">看看景区</el-button></router-link>
        </EmptyState>
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
import { computed, onMounted, ref } from 'vue';
import {
  ArrowRight,
  LocationInformation,
  Search,
  StarFilled,
} from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { img, imgError } from '../../utils/media';

const keyword = ref('');
const minPrice = ref<number | undefined>(undefined);
const maxPrice = ref<number | undefined>(undefined);
const sort = ref('rating');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 12;
const loading = ref(false);

const hasFilter = computed(
  () => !!keyword.value || minPrice.value !== undefined || maxPrice.value !== undefined
);

function splitTags(tags: string) {
  return tags ? tags.split(',').filter((t) => t) : [];
}

function resetFilter() {
  keyword.value = '';
  minPrice.value = undefined;
  maxPrice.value = undefined;
  load(1);
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

.toolbar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: var(--wd-s7);
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.search {
  width: 260px;
}
.price-range {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid var(--wd-border);
}
.pr-label {
  font-size: 13px;
  color: var(--wd-text-3);
}
.pr-dash {
  color: var(--wd-text-4);
}
.price-input {
  width: 88px;
}
.sorts {
  margin-left: auto;
}

.result-bar {
  margin-bottom: var(--wd-s5);
  font-size: 13px;
  color: var(--wd-text-4);
}
.result-bar b {
  color: var(--wd-text-1);
  font-size: 15px;
}

.rating-chip {
  position: absolute;
  right: 12px;
  top: 12px;
}

.place-overlay {
  position: absolute;
  left: 18px;
  bottom: 16px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 3px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.36s var(--wd-ease);
  pointer-events: none;
}
.wd-card:hover .place-overlay {
  opacity: 1;
  transform: none;
}
.place-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
.place-addr {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

.tag-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.mini-tag {
  padding: 3px 10px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  color: var(--wd-indigo);
  background: #eef2f9;
}

.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}
.buy-hint {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--wd-text-4);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.3s var(--wd-ease);
}
.wd-card:hover .buy-hint {
  opacity: 1;
  transform: none;
  color: var(--wd-brand);
}

.pager {
  margin-top: var(--wd-s8);
  justify-content: center;
}

@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
    border-radius: var(--wd-r-lg);
  }
  .search {
    width: 100%;
  }
  .price-range {
    border-left: none;
    padding-left: 0;
  }
  .sorts {
    margin-left: 0;
  }
}
</style>
