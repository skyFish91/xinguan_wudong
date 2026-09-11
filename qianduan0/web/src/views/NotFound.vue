<template>
  <div class="wd-container wd-page nf">
    <div class="nf-stage">
      <span class="nf-ghost" aria-hidden="true">404</span>
      <EmptyState
        variant="search"
        title="这条路走岔了"
        desc="页面可能已经下架，也可能是链接里少了一个字符。"
      >
        <el-button type="primary" size="large" @click="goHome">回到首页</el-button>
        <el-button v-if="canBack" size="large" @click="router.back()">返回上一页</el-button>
      </EmptyState>
    </div>

    <nav class="nf-guess" aria-label="推荐去处">
      <div class="nf-guess-title">或者，去这些地方看看</div>
      <div class="nf-guess-links">
        <RouterLink
          v-for="g in guesses"
          :key="g.to"
          class="wd-chip wd-chip-indigo nf-link"
          :to="g.to"
        >
          {{ g.label }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import EmptyState from '../components/EmptyState.vue';

const router = useRouter();

/** 直接打开死链时没有可回退的历史，就不显示「返回上一页」 */
const canBack = computed(() => !!window.history.state?.back);

const guesses = [
  { label: '非遗好物', to: '/clothing' },
  { label: '苗乡美食', to: '/food' },
  { label: '民宿住宿', to: '/hotel' },
  { label: '景区出行', to: '/travel' },
  { label: '社区分享', to: '/community' },
];

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.nf {
  padding-bottom: var(--wd-s11);
}

.nf-stage {
  position: relative;
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 var(--wd-s6);
  overflow: hidden;
}

/* 巨大的 404 只做背景肌理，不进无障碍树 */
.nf-ghost {
  position: absolute;
  top: calc(var(--wd-s7) - 12px);
  left: 50%;
  transform: translateX(-50%);
  font-family: inherit;
  font-size: clamp(150px, 22vw, 260px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
  color: var(--wd-brand);
  opacity: 0.055;
  user-select: none;
  pointer-events: none;
  white-space: nowrap;
}

/*
 * 插画与背后的 404 都是浅色，直接叠会糊成一片；
 * 给插画一层向外的底色光晕，把它从数字上「托」起来。
 */
.nf-stage :deep(.wd-empty) {
  position: relative;
  z-index: 1;
  max-width: 560px;
  margin: 0 auto;
  background: radial-gradient(
    closest-side at 50% 46%,
    var(--wd-bg) 52%,
    color-mix(in srgb, var(--wd-bg) 0%, transparent) 100%
  );
}

.nf-guess {
  margin-top: var(--wd-s2);
  padding-top: var(--wd-s6);
  border-top: 1px solid var(--wd-border);
  text-align: center;
}

.nf-guess-title {
  margin-bottom: var(--wd-s4);
  font-size: 14px;
  color: var(--wd-text-3);
}

.nf-guess-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wd-s2);
  justify-content: center;
}

.nf-link {
  text-decoration: none;
  transition: transform var(--wd-dur) var(--wd-ease);
}

.nf-link:hover {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  .nf-link {
    transition: none;
  }
  .nf-link:hover {
    transform: none;
  }
}
</style>
