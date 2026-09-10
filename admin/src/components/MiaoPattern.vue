<template>
  <!-- 苗族银饰边框装饰 - 用于卡片标题/侧栏 logo -->
  <svg
    class="miao-pattern"
    :width="size"
    :height="size"
    viewBox="0 0 60 60"
    fill="none"
    stroke="currentColor"
    stroke-width="1.2"
  >
    <circle cx="30" cy="30" r="22" />
    <circle cx="30" cy="30" r="6" fill="currentColor" />
    <g stroke-linecap="round">
      <path d="M30 8 C 22 18, 22 28, 30 30" />
      <path d="M30 52 C 38 42, 38 32, 30 30" />
      <path d="M8 30 C 18 22, 28 22, 30 30" />
      <path d="M52 30 C 42 38, 32 38, 30 30" />
      <path d="M14 14 C 22 20, 28 28, 30 30" />
      <path d="M46 14 C 38 20, 32 28, 30 30" />
      <path d="M14 46 C 20 38, 28 32, 30 30" />
      <path d="M46 46 C 40 38, 32 32, 30 30" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ size?: number | string }>();
</script>

<style scoped>
.miao-pattern {
  color: currentColor;
}
</style>