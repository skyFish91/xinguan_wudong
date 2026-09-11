<template>
  <div v-show="mounted" class="wd-progress" :class="{ 'is-on': visible, 'is-done': done }">
    <div class="wd-progress-bar" :style="{ width: `${pct}%` }">
      <span class="wd-progress-glow"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 顶部路由进度条。
 * 存在的意义：路由分包是懒加载的，首次进入某页会有 100~400ms 的空白，
 * 没有反馈就会显得「卡住 / 生硬」。这条 2px 的进度条把这段等待可视化。
 * 导航在 90ms 内完成时不显示（避免一闪而过的噪点）。
 */
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const visible = ref(false);
const done = ref(false);
const mounted = ref(false);
const pct = ref(0);

let showTimer: ReturnType<typeof setTimeout> | null = null;
let tickTimer: ReturnType<typeof setTimeout> | null = null;
let resetTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  [showTimer, tickTimer, resetTimer].forEach((t) => t && clearTimeout(t));
  showTimer = tickTimer = resetTimer = null;
}

function start() {
  clearTimers();
  done.value = false;
  pct.value = 0;
  // 慢于 90ms 才现身
  showTimer = setTimeout(() => {
    visible.value = true;
    requestAnimationFrame(() => (pct.value = 72));
    tickTimer = setTimeout(() => (pct.value = 88), 420);
  }, 90);
}

function finish() {
  const wasVisible = visible.value;
  clearTimers();
  if (!wasVisible) {
    visible.value = false;
    pct.value = 0;
    return;
  }
  done.value = true;
  pct.value = 100;
  resetTimer = setTimeout(() => {
    visible.value = false;
    done.value = false;
    pct.value = 0;
  }, 320);
}

let offBefore: (() => void) | undefined;
let offAfter: (() => void) | undefined;
let offError: (() => void) | undefined;

onMounted(() => {
  mounted.value = true;
  offBefore = router.beforeEach(() => {
    start();
    return true;
  });
  offAfter = router.afterEach(() => finish());
  offError = router.onError(() => finish());
});

onUnmounted(() => {
  clearTimers();
  offBefore?.();
  offAfter?.();
  offError?.();
});
</script>

<style scoped>
.wd-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 3000;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s linear;
}
.wd-progress.is-on {
  opacity: 1;
}
.wd-progress.is-done {
  opacity: 0;
  transition: opacity 0.32s linear;
}

.wd-progress-bar {
  position: relative;
  height: 100%;
  width: 0;
  border-radius: 0 var(--wd-r-pill) var(--wd-r-pill) 0;
  background: linear-gradient(
    90deg,
    var(--wd-brand-300),
    var(--wd-brand-400),
    var(--wd-brand)
  );
  box-shadow: 0 0 10px rgba(var(--wd-brand-rgb), 0.55);
  transition: width 0.42s var(--wd-ease);
}

/* 前端拖尾光点：让静止的进度条也有「活着」的感觉 */
.wd-progress-glow {
  position: absolute;
  right: 0;
  top: 50%;
  width: 90px;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9));
  opacity: 0.85;
}
</style>
