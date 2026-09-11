<template>
  <div class="top-nav">
    <div class="nav-inner">
      <router-link to="/food" class="logo">乌东文旅 · 苗乡美食</router-link>
      <el-menu mode="horizontal" :default-active="activePath" router class="nav-menu" :ellipsis="false">
        <el-menu-item index="/food">苗乡美食</el-menu-item>
        <el-menu-item v-if="isAdmin" index="/admin">管理看板</el-menu-item>
        <el-menu-item v-else-if="isMerchant" index="/admin">商家后台</el-menu-item>
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
const isAdmin = computed(() => userStore.userInfo?.role === 'admin');
const isMerchant = computed(() => userStore.userInfo?.role === 'merchant');

// 顶部菜单高亮
const activePath = computed(() => {
  const seg = '/' + route.path.split('/')[1];
  return seg === '/food' || seg === '/admin' ? seg : '/food';
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
    router.push('/food');
  }
}

onMounted(loadCartCount);
// 购物车变化时刷新角标
window.addEventListener('cart-changed', loadCartCount);
</script>

<style scoped>
.top-nav {
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 24px;
  height: 60px;
}
.logo {
  font-size: 22px;
  font-weight: bold;
  color: #c0392b;
  text-decoration: none;
  white-space: nowrap;
}
.nav-menu {
  flex: 1;
  border-bottom: none;
}
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.icon-link {
  color: #333;
  text-decoration: none;
  cursor: pointer;
}
.user-name {
  cursor: pointer;
  color: #333;
}
</style>
