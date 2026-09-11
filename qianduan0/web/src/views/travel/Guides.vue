<template>
  <div>
    <TopNav />
    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">出行攻略</h1>
        <p class="page-sub">从各地出发到乌东的交通方案、用时与花费，一次看懂怎么来</p>
      </header>

      <TravelTabs />

      <div class="toolbar glass-strong">
        <el-select v-model="departFrom" placeholder="全部出发地" clearable class="from-select" @change="load">
          <el-option v-for="f in fromOptions" :key="f" :label="f" :value="f" />
        </el-select>
        <span v-if="!loading && list.length" class="result-inline">共 {{ list.length }} 篇攻略</span>
      </div>

      <div v-if="loading" class="wd-grid wd-grid-3">
        <SkeletonCard v-for="i in 3" :key="`s${i}`" cover="150px" />
      </div>

      <div v-else-if="list.length" class="wd-grid wd-grid-3">
        <article
          v-for="(g, i) in list"
          :key="g.id"
          class="wd-card wd-card-hover wd-rise"
          :style="{ animationDelay: `${Math.min(i, 6) * 60}ms` }"
          @click="showDetail(g)"
        >
          <div class="wd-media" style="height: 150px">
            <img :src="cover(g, i)" :alt="g.title" @error="imgError" />
            <span class="wd-chip wd-chip-indigo route-chip">{{ g.departFrom }} → {{ g.dest }}</span>
          </div>
          <div class="wd-card-body">
            <div class="wd-title clamp-2">{{ g.title }}</div>
            <div class="guide-meta">
              <span><el-icon><Van /></el-icon> {{ g.transport }}</span>
              <span><el-icon><Clock /></el-icon> {{ g.duration }}</span>
              <span><el-icon><Wallet /></el-icon> {{ g.cost }}</span>
            </div>
            <div class="read-more">
              查看详细方案 <el-icon><ArrowRight /></el-icon>
            </div>
          </div>
        </article>
      </div>

      <div v-else class="wd-card">
        <EmptyState
          variant="search"
          title="暂无攻略"
          desc="换个出发地看看，或者先规划一条精品路线。"
        />
      </div>

      <el-dialog v-model="dialog" :title="current?.title" width="680px" class="guide-dialog">
        <div class="dialog-media">
          <img
            :src="current?.image ? imgLarge(current.image, current?.title) : PHOTO_LARGE.bridge"
            :alt="current?.title"
            @error="imgError"
          />
        </div>
        <div class="dialog-meta">
          <span class="mini-tag">出发地：{{ current?.departFrom }}</span>
          <span class="mini-tag">目的地：{{ current?.dest }}</span>
          <span class="mini-tag">交通：{{ current?.transport }}</span>
          <span class="mini-tag">用时：{{ current?.duration }}</span>
          <span class="mini-tag">费用：{{ current?.cost }}</span>
        </div>
        <div class="dialog-detail" v-html="current?.detail" />
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ArrowRight, Clock, Van, Wallet } from '@element-plus/icons-vue';
import TopNav from '../../components/TopNav.vue';
import TravelTabs from '../../components/TravelTabs.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';
import { img, imgLarge, imgError, PHOTO, PHOTO_LARGE } from '../../utils/media';

const departFrom = ref('');
const fromOptions = ref<string[]>([]);
const list = ref<any[]>([]);
const loading = ref(true);
const dialog = ref(false);
const current = ref<any>(null);

/** 后端攻略数据没有配图，用本地素材按顺序铺开，避免整屏重复
    （卡片封面 150px 高，低清图完全够用，故大小图混用以增加变化） */
const LOCAL_COVERS = [
  PHOTO.guide,
  PHOTO_LARGE.bridge,
  PHOTO.photography,
  PHOTO_LARGE.terraces,
  PHOTO_LARGE.clouds,
  PHOTO.medicine,
];

function cover(g: any, i: number) {
  return g.image ? img(g.image, g.title) : LOCAL_COVERS[i % LOCAL_COVERS.length];
}

async function load() {
  loading.value = true;
  try {
    list.value = await request.get('/travel/guides', {
      params: { departFrom: departFrom.value || undefined },
    });
    const set = new Set<string>();
    list.value.forEach((g) => set.add(g.departFrom));
    fromOptions.value = Array.from(set);
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function showDetail(g: any) {
  try {
    current.value = await request.get(`/travel/guides/${g.id}`);
    dialog.value = true;
  } catch {
    // 已提示
  }
}

onMounted(load);
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
.from-select {
  width: 180px;
}
.result-inline {
  margin-left: auto;
  font-size: 13px;
  color: var(--wd-text-4);
}

.route-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}

.guide-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.guide-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-text-4);
  transition: color 0.28s var(--wd-ease), transform 0.28s var(--wd-ease);
}
.wd-card:hover .read-more {
  color: var(--wd-brand);
  transform: translateX(3px);
}

/* 弹窗 */
.dialog-media {
  width: 100%;
  height: 240px;
  border-radius: var(--wd-r-md);
  overflow: hidden;
  background: #eef1f6;
  margin-bottom: var(--wd-s4);
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
}
.mini-tag {
  padding: 4px 12px;
  border-radius: var(--wd-r-pill);
  font-size: 12px;
  color: var(--wd-indigo);
  background: #eef2f9;
}
.dialog-detail {
  margin-top: var(--wd-s5);
  font-size: 14px;
  line-height: 1.9;
  color: var(--wd-text-2);
}
.dialog-detail :deep(img) {
  max-width: 100%;
  border-radius: var(--wd-r-sm);
}
@media (max-width: 900px) {
  .toolbar {
    flex-wrap: wrap;
    border-radius: var(--wd-r-lg);
  }
}
</style>
