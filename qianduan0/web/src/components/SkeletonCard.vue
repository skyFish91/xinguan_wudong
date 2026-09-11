<template>
  <div class="wd-skel-card" :style="rootStyle">
    <!-- 封面灰块 -->
    <div
      v-if="variant !== 'text'"
      class="wd-skeleton wd-skel-cover"
      :style="{ height: coverHeight }"
    ></div>

    <div class="wd-skel-body">
      <div class="wd-skeleton wd-skel-line wd-skel-title"></div>
      <div
        v-for="i in lines"
        :key="i"
        class="wd-skeleton wd-skel-line wd-skel-text"
        :style="{ width: i === lines ? '52%' : '88%' }"
      ></div>

      <div v-if="variant !== 'text'" class="skel-foot">
        <div class="wd-skeleton wd-skel-line" style="width: 62px; height: 18px"></div>
        <div class="wd-skeleton wd-skel-line" style="width: 42px"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    /** grid：等高栅格卡片；waterfall：随机高矮（瀑布流）；text：纯文字条 */
    variant?: 'grid' | 'waterfall' | 'text';
    /** 封面高度，waterfall 下作为基准高度 */
    cover?: string;
    /** 正文行数 */
    lines?: number;
  }>(),
  {
    variant: 'grid',
    cover: '180px',
    lines: 2,
  }
);

// 瀑布流骨架用确定性的高低差，避免每次渲染跳动
const seed = Math.random();
const coverHeight = computed(() => {
  if (props.variant === 'waterfall') {
    const extra = Math.round(seed * 90);
    return `calc(${props.cover} + ${extra}px)`;
  }
  return props.cover;
});

const rootStyle = computed(() => ({
  borderRadius: 'var(--wd-r-md)',
  breakInside: props.variant === 'waterfall' ? ('avoid' as const) : undefined,
}));
</script>

<style scoped>
.skel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
</style>
