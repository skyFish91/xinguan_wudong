<template>
  <div class="eticket-page">
    <div class="wd-container wd-page">
      <PageBack />
      <header class="page-head">
        <h1 class="page-title">我的电子票</h1>
        <p class="page-sub">到景区出示票号即可核销，出行前记得核对使用日期</p>
      </header>

      <!-- 骨架屏 -->
      <div v-if="loading" class="ticket-grid">
        <div v-for="i in 4" :key="`s${i}`" class="wd-skel-card">
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <!-- 票列表 -->
      <div v-else-if="list.length" class="ticket-grid">
        <article
          v-for="(e, i) in list"
          :key="e.id"
          class="wd-card ticket wd-rise"
          :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
        >
          <!-- 票头 -->
          <div class="ticket-top">
            <span class="ticket-kind">{{ e.bizType === 'route' ? '路线套餐' : '景区门票' }}</span>
            <span class="status-pill" :class="`st-${e.status}`">{{ statusText(e.status) }}</span>
          </div>

          <!-- 票号：压边设计 -->
          <div class="ticket-code-wrap">
            <div class="code-label">票号</div>
            <div class="ticket-code">{{ e.code }}</div>
          </div>

          <dl class="ticket-fields">
            <div class="row">
              <dt>游客</dt>
              <dd>{{ e.visitorName || '—' }}</dd>
            </div>
            <div class="row">
              <dt>使用日期</dt>
              <dd>{{ e.useDate || '—' }}</dd>
            </div>
            <div class="row" v-if="e.verifyAt">
              <dt>核销时间</dt>
              <dd>{{ formatTime(e.verifyAt) }}</dd>
            </div>
          </dl>

          <div class="ticket-foot">
            <span class="foot-hint" v-if="e.status === 0">未核销 · 请在有效期内使用</span>
            <span class="foot-hint muted" v-else>{{ statusText(e.status) }}</span>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          variant="order"
          title="还没有电子票"
          desc="去景区订票或购买路线套餐，票号会自动出现在这里。"
        >
          <router-link to="/travel"><el-button type="primary">去看景区</el-button></router-link>
          <router-link to="/travel/routes"><el-button>选一条路线</el-button></router-link>
        </EmptyState>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PageBack from '../../components/PageBack.vue';
import EmptyState from '../../components/EmptyState.vue';
import request from '../../api/request';

const list = ref<any[]>([]);
const loading = ref(true);

function statusText(status: number) {
  return status === 0 ? '未核销' : status === 1 ? '已核销' : '已退款';
}

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

onMounted(async () => {
  try {
    const data: any = await request.get('/travel/my-etickets');
    list.value = Array.isArray(data) ? data : data.list || [];
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.eticket-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.page-head {
  padding-bottom: var(--wd-s6);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--wd-s5);
}

/* 票卡：顶部渐变条 + 虚线撕口 */
.ticket {
  padding: var(--wd-s5);
  background: linear-gradient(180deg, #fcfdff 0%, #ffffff 32%);
}
.ticket::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: linear-gradient(90deg, var(--wd-brand-400), var(--wd-brand-600), var(--wd-gold));
}

.ticket-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s3);
}
.ticket-kind {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.status-pill {
  padding: 4px 13px;
  border-radius: var(--wd-r-pill);
  font-size: 12px;
  font-weight: 600;
}
.st-0 {
  color: #b26b00;
  background: #fdf4e3;
}
.st-1 {
  color: #1e7a45;
  background: #e8f5ed;
}
.st-2 {
  color: var(--wd-text-3);
  background: #f1f3f7;
}

.ticket-code-wrap {
  margin: var(--wd-s4) 0;
  padding: var(--wd-s4) var(--wd-s5);
  border-radius: var(--wd-r-sm);
  background: var(--wd-brand-soft);
}
.code-label {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--wd-text-4);
}
.ticket-code {
  margin-top: 4px;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
  word-break: break-all;
}

.ticket-fields {
  margin: 0;
  padding: var(--wd-s2) 0;
  border-top: 1px dashed var(--wd-border-strong);
  border-bottom: 1px dashed var(--wd-border-strong);
}
.ticket-fields .row {
  display: flex;
  align-items: baseline;
  gap: var(--wd-s4);
  padding: 6px 0;
}
.ticket-fields dt {
  flex-shrink: 0;
  width: 64px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.ticket-fields dd {
  margin: 0;
  font-size: 13.5px;
  color: var(--wd-text-1);
}

.ticket-foot {
  padding-top: var(--wd-s3);
}
.foot-hint {
  font-size: 12px;
  color: var(--wd-brand);
}
.foot-hint.muted {
  color: var(--wd-text-4);
}
</style>
