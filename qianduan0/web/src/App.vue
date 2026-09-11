<template>
  <!-- 顶部路由进度条：懒加载分包的空白期给个反馈 -->
  <RouteProgress />

  <!-- 头部导航提到布局层：跨页切换时导航不再跟着一起淡出重绘 -->
  <TopNav v-if="showNav" />

  <router-view v-slot="{ Component, route: current }">
    <transition :name="animName" mode="out-in">
      <component :is="Component" :key="current.path" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import TopNav from './components/TopNav.vue';
import RouteProgress from './components/RouteProgress.vue';

const route = useRoute();

/** meta.bare 的页面自带整屏布局（登录 / 注册是左右分屏），不挂头部导航 */
const isBare = () => route.meta.bare === true;

const showNav = ref(!isBare());
const animName = computed(() => (route.meta.transition as string) || 'wd-page');

let navTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 导航的收起/展开刻意错开半拍：
 * 直接跟着路由立刻切换，会与页面的淡出淡入撞在一起，看着像闪了一下。
 */
watch(
  () => route.path,
  () => {
    if (navTimer) clearTimeout(navTimer);
    if (isBare()) {
      navTimer = setTimeout(() => (showNav.value = false), 200);
    } else {
      navTimer = setTimeout(() => (showNav.value = true), 140);
    }
  }
);

onUnmounted(() => {
  if (navTimer) clearTimeout(navTimer);
});
</script>
