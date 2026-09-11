<template>
  <nav class="travel-tabs">
    <router-link
      v-for="t in tabs"
      :key="t.path"
      :to="t.path"
      class="travel-tab"
      :class="{ active: isActive(t.path) }"
    >
      <span class="travel-tab-label">{{ t.label }}</span>
    </router-link>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const tabs = [
  { path: '/travel', label: '景区门票' },
  { path: '/travel/routes', label: '精品路线' },
  { path: '/travel/guides', label: '出行攻略' },
  { path: '/travel/my-etickets', label: '我的电子票' },
];

function isActive(path: string) {
  if (path === '/travel') {
    // /travel 只在正是景区页时高亮
    return route.path === '/travel' || route.path === '/travel/';
  }
  return route.path.startsWith(path);
}
</script>

<style scoped>
.travel-tabs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  margin-bottom: var(--wd-s6);
  border-radius: var(--wd-r-pill);
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  backdrop-filter: saturate(180%) blur(16px);
  border: 1px solid var(--wd-border);
  box-shadow: var(--wd-sh-1);
}
.travel-tab {
  padding: 8px 20px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--wd-text-2);
  text-decoration: none;
  transition: all 0.24s var(--wd-ease);
}
.travel-tab:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.travel-tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
}
</style>
