<template>
  <div class="empty-state">
    <img :src="imageSrc" :alt="description" class="empty-img" />
    <div class="empty-title">{{ description }}</div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import emptyData from '../assets/svg/empty-data.svg';
import emptySearch from '../assets/svg/empty-search.svg';
import emptyPermission from '../assets/svg/empty-permission.svg';

const props = defineProps<{
  type?: 'data' | 'search' | 'permission';
  description?: string;
}>();

const imageMap = {
  data: emptyData,
  search: emptySearch,
  permission: emptyPermission,
};

const descMap = {
  data: '暂无数据',
  search: '未找到匹配结果',
  permission: '无访问权限',
};

const imageSrc = computed(() => imageMap[props.type || 'data']);
const description = computed(() => props.description || descMap[props.type || 'data']);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  color: var(--text-secondary);
}
.empty-img {
  width: 200px;
  height: 150px;
  object-fit: contain;
  opacity: 0.85;
}
.empty-title {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-secondary);
}
</style>