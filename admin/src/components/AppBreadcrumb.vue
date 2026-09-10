<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item v-for="(item, idx) in items" :key="idx" :to="item.to">
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const items = computed(() => {
  const matched = route.matched.filter((r) => r.meta?.title);
  return matched.map((r) => ({
    title: r.meta.title as string,
    to: r.path === route.path ? undefined : r.path,
  }));
});
</script>

<style scoped>
.app-breadcrumb {
  font-size: 13px;
}
.app-breadcrumb :deep(.el-breadcrumb__item__inner) {
  color: var(--text-secondary);
  font-weight: normal;
}
.app-breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__item__inner) {
  color: var(--text-primary);
  font-weight: 600;
}
</style>