<template>
  <button class="theme-switch" :title="isDark ? '切换为浅色' : '切换为深色'" @click="toggle">
    <svg v-if="!isDark" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const STORAGE_KEY = 'wudong-theme';
const isDark = ref(false);

function apply(dark: boolean) {
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}

function toggle() {
  isDark.value = !isDark.value;
  apply(isDark.value);
  localStorage.setItem(STORAGE_KEY, isDark.value ? 'dark' : 'light');
}

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') {
    isDark.value = true;
  } else if (!saved) {
    // 默认跟随系统
    isDark.value = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
  apply(isDark.value);
});

watch(isDark, apply);
</script>

<style scoped>
.theme-switch {
  background: transparent;
  border: 1px solid var(--border-base);
  color: var(--text-regular);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.theme-switch:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>