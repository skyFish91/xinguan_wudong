<template>
  <!-- 顶部路由进度条：懒加载分包的空白期给个反馈 -->
  <RouteProgress />

  <!-- 头部导航提到布局层：跨页切换时导航不再跟着一起淡出重绘。
       它本身是 fixed 定位（见 TopNav 的 .nav），不占文档流，
       所以这里切换显隐只会淡入淡出，不会让页面高度发生变化。 -->
  <transition name="wd-nav">
    <TopNav v-if="showNav" />
  </transition>

  <!-- 内容区：给 fixed 导航让出高度。
       min-height 撑满一屏，避免 out-in 换页的那一瞬间文档高度塌陷、露出底色。
       裸页（登录 / 注册）的整屏面板自己带负 margin 抵消这里的 padding。 -->
  <div class="app-content">
    <router-view v-slot="{ Component, route: current }">
      <transition :name="animName" mode="out-in">
        <component :is="Component" :key="current.path" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TopNav from './components/TopNav.vue';
import RouteProgress from './components/RouteProgress.vue';

const route = useRoute();

/** meta.bare 的页面自带整屏布局（登录 / 注册是左右分屏），不挂头部导航 */
const isBare = computed(() => route.meta.bare === true);

/**
 * 导航显隐直接跟随路由，不再延迟。
 * 早先这里用 setTimeout 错开 140~200ms，本意是避开与页面淡入相撞；
 * 但导航当时是 sticky、占着 68px 文档流，而 out-in 换页只要 160ms——
 * 于是登录页先被顶下去 68px、40ms 后再弹回来，就是你看到的「顿一下」。
 * 现在导航已改为 fixed，显隐与布局彻底解耦，直接跟随才是稳的。
 */
const showNav = computed(() => !isBare.value);

const animName = computed(() => (route.meta.transition as string) || 'wd-page');
</script>

<style scoped>
.app-content {
  padding-top: var(--wd-nav-h);
  min-height: 100vh;
}
</style>
