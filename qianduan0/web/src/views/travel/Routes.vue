<template>
  <div>
    <div class="wd-container wd-page">
      <PageBack />
      <header class="page-head">
        <h1 class="page-title">精品路线</h1>
        <p class="page-sub">苗族银饰工坊、梯田徒步、云海日出——按天数挑一条适合你的</p>
      </header>

      <TravelTabs />

      <div class="toolbar glass-strong">
        <el-input
          v-model="keyword"
          placeholder="搜索路线名称"
          class="search"
          clearable
          :prefix-icon="Search"
          @keyup.enter="load(1)"
        />
        <el-select v-model="days" placeholder="全部天数" clearable class="days-select" @change="load(1)">
          <el-option label="1 日游" :value="1" />
          <el-option label="2 日游" :value="2" />
          <el-option label="3 日游" :value="3" />
        </el-select>
        <el-button type="primary" @click="load(1)">搜索</el-button>
        <span v-if="!loading && list.length" class="result-inline">共 {{ total }} 条路线</span>
      </div>

      <div v-if="loading" class="wd-grid wd-grid-3">
        <SkeletonCard v-for="i in 6" :key="`s${i}`" cover="210px" />
      </div>

      <div v-else-if="list.length" class="wd-grid wd-grid-3">
        <article
          v-for="(r, i) in list"
          :key="r.id"
          class="wd-card wd-card-hover wd-rise"
          :style="{ animationDelay: `${Math.min(i, 6) * 60}ms` }"
          @click="$router.push(`/travel/routes/${r.id}`)"
        >
          <div class="wd-media" style="height: 210px">
            <img :src="img(r.mainImage, r.title, true)" :alt="r.title" @error="imgError" />
            <span class="wd-chip days-chip">
              <el-icon><Clock /></el-icon> {{ r.days }} 天
            </span>
          </div>
          <div class="wd-card-body">
            <div class="wd-title clamp-2">{{ r.title }}</div>
            <div class="route-meta">
              <span><el-icon><Position /></el-icon> {{ r.departFrom }} 出发</span>
              <span v-if="r.dest"><el-icon><Location /></el-icon> {{ r.dest }}</span>
            </div>
            <div v-if="splitTags(r.themes).length" class="tag-row">
              <span v-for="t in splitTags(r.themes).slice(0, 3)" :key="t" class="mini-tag">{{ t }}</span>
            </div>
            <div class="card-foot">
              <span class="wd-price">¥{{ r.price }} <small>/人</small></span>
              <span class="wd-meta">已售 {{ r.sales }}</span>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="wd-card">
        <EmptyState
          variant="search"
          :title="hasFilter ? '没有找到匹配的路线' : '暂无路线'"
          :desc="hasFilter ? '换个天数或关键词试试，或者看看景区门票。' : '路线正在策划中，先去挑个景区吧。'"
        >
          <el-button v-if="hasFilter" @click="resetFilter">清空筛选</el-button>
          <router-link v-else to="/travel"><el-button type="primary">看景区门票</el-button></router-link>
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
import { Clock, Location, Position, Search } from '@element-plus/icons-vue';
import PageBack from '../../components/PageBack.vue';
import TravelTabs from '../../components/TravelTabs.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { img, imgError } from '../../utils/media';

const keyword = ref('');
const days = ref<number | undefined>(undefined);
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 8;
const loading = ref(true);

const hasFilter = computed(() => !!keyword.value || days.value !== undefined);

function splitTags(tags: string) {
  return tags ? tags.split(',').filter((t) => t) : [];
}

function resetFilter() {
  keyword.value = '';
  days.value = undefined;
  load(1);
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/travel/routes', {
      params: {
        days: days.value,
        keyword: keyword.value || undefined,
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
  margin-bottom: var(--wd-s4);
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
.days-select {
  width: 140px;
}
.result-inline {
  margin-left: auto;
  font-size: 13px;
  color: var(--wd-text-4);
}

.days-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}

.route-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.route-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
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
}
</style>
