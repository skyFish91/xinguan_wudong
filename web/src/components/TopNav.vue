<template>
  <div class="top-nav">
    <div class="nav-inner">
      <router-link to="/" class="logo">乌东文旅</router-link>
      <el-menu mode="horizontal" :default-active="activePath" router class="nav-menu" :ellipsis="false">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/clothing">非遗好物</el-menu-item>
        <el-menu-item index="/food">苗乡美食</el-menu-item>
        <el-menu-item index="/hotel">民宿住宿</el-menu-item>
        <el-menu-item index="/travel">景区出行</el-menu-item>
        <el-menu-item index="/community">社区分享</el-menu-item>
        <el-menu-item index="/ai">🤖 AI助手</el-menu-item>
      </el-menu>
      <div class="nav-right">
        <template v-if="userStore.isLogin">
          <el-badge :value="cartCount" :hidden="cartCount === 0">
            <router-link to="/cart" class="icon-link">购物车</router-link>
          </el-badge>
          <router-link to="/orders" class="icon-link">我的订单</router-link>
          <el-dropdown @command="onCommand">
            <span class="user-name">{{ userStore.userInfo?.nickname || '我的' }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="user">个人中心</el-dropdown-item>
                <el-dropdown-item command="etickets">我的电子票</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="icon-link">登录</router-link>
          <router-link to="/register" class="icon-link">注册</router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import request from '../api/request';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartCount = ref(0);

// 顶部菜单高亮：取路径第一段
const activePath = computed(() => {
  const seg = '/' + route.path.split('/')[1];
  return seg === '/' || seg === '/clothing' || seg === '/food' || seg === '/hotel' || seg === '/travel' || seg === '/community' || seg === '/ai'
    ? seg
    : '/';
});

async function loadCartCount() {
  if (!userStore.isLogin) return;
  try {
    const res: any = await request.get('/cart/count');
    cartCount.value = Number(res) || 0;
  } catch {
    cartCount.value = 0;
  }
}

function onCommand(cmd: string) {
  if (cmd === 'logout') {
    userStore.logout();
    router.push('/');
  } else if (cmd === 'user') {
    router.push('/user');
  } else if (cmd === 'etickets') {
    router.push('/travel/my-etickets');
  }
}

onMounted(loadCartCount);
// 购物车变化时刷新角标
window.addEventListener('cart-changed', loadCartCount);
</script>

<style scoped>
.top-nav {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 48px;
  height: 64px;
  padding: 0 24px;
}

.logo {
  font-size: 20px;
  font-weight: 400;
  color: #333;
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 2px;
  transition: opacity 0.2s ease;
}

.logo:hover {
  opacity: 0.7;
}

.nav-menu {
  flex: 1;
  border-bottom: none;
  background: transparent;
}

.nav-menu :deep(.el-menu-item) {
  font-size: 14px;
  font-weight: 400;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  height: 64px;
  line-height: 64px;
  padding: 0 20px;
}

.nav-menu :deep(.el-menu-item:hover) {
  background: transparent;
  color: #333;
}

.nav-menu :deep(.el-menu-item.is-active) {
  color: #333;
  border-bottom-color: #8b7355;
  background: transparent;
  font-weight: 500;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.icon-link {
  color: #666;
  text-decoration: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  transition: color 0.2s ease;
  padding: 6px 12px;
}

.icon-link:hover {
  color: #333;
}

.user-name {
  cursor: pointer;
  color: #666;
  font-size: 13px;
  font-weight: 400;
  padding: 6px 12px;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-name:hover {
  color: #333;
}

.user-name::after {
  content: '';
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-top: 4px solid currentColor;
  margin-left: 2px;
}

:deep(.el-badge) {
  display: flex;
  align-items: center;
}

:deep(.el-badge__content) {
  background: #8b7355;
  border: none;
  font-weight: 500;
  font-size: 11px;
  height: 16px;
  line-height: 16px;
  padding: 0 5px;
  min-width: 16px;
}
</style>

