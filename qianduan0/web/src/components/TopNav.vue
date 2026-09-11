<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }">
    <div class="nav-inner wd-container">
      <!-- 品牌：蝴蝶妈妈 + 铜鼓太阳纹标志 -->
      <router-link to="/" class="logo">
        <BrandMark :size="38" tone="brand" />
        <span class="logo-text">
          乌东文旅
          <small>WUDONG · MIAO</small>
        </span>
      </router-link>

      <!-- 主导航 -->
      <nav class="nav-links">
        <router-link
          v-for="item in navs"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ 'is-active': activePath === item.path }"
        >
          {{ item.label }}
        </router-link>
      </nav>

      <!-- 右侧操作区 -->
      <div class="nav-right">
        <template v-if="userStore.isLogin">
          <router-link to="/cart" class="ghost-btn">
            <el-badge :value="cartCount" :hidden="cartCount === 0" :offset="[2, 2]">
              <span class="ghost-label">购物车</span>
            </el-badge>
          </router-link>
          <router-link to="/orders" class="ghost-btn">我的订单</router-link>
          <el-dropdown @command="onCommand" trigger="click">
            <span class="user-chip">
              <el-avatar :size="26">{{ initial }}</el-avatar>
              <span class="user-name">{{ userStore.userInfo?.nickname || '我的' }}</span>
              <el-icon class="caret"><ArrowDown /></el-icon>
            </span>
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
          <router-link to="/login" class="ghost-btn">登录</router-link>
          <router-link to="/register" class="solid-btn">免费注册</router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowDown } from '@element-plus/icons-vue';
import BrandMark from './BrandMark.vue';
import { useUserStore } from '../stores/user';
import request from '../api/request';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const cartCount = ref(0);
const scrolled = ref(false);

const navs = [
  { path: '/', label: '首页' },
  { path: '/clothing', label: '非遗好物' },
  { path: '/food', label: '苗乡美食' },
  { path: '/hotel', label: '民宿住宿' },
  { path: '/travel', label: '景区出行' },
  { path: '/community', label: '社区分享' },
];

const activePath = computed(() => {
  const seg = '/' + (route.path.split('/')[1] || '');
  return navs.some((n) => n.path === seg) ? seg : '/';
});

const initial = computed(() => {
  const n = userStore.userInfo?.nickname || '';
  return n ? n.slice(0, 1).toUpperCase() : '我';
});

async function loadCartCount() {
  if (!userStore.isLogin) {
    cartCount.value = 0;
    return;
  }
  try {
    const res: any = await request.get('/cart/count');
    cartCount.value = Number(res) || 0;
  } catch {
    cartCount.value = 0;
  }
}

function onScroll() {
  scrolled.value = window.scrollY > 8;
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

onMounted(() => {
  loadCartCount();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener('scroll', onScroll));
window.addEventListener('cart-changed', loadCartCount);
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255, 255, 255, 0.66);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid rgba(237, 240, 245, 0.9);
  transition: background 0.3s var(--wd-ease), box-shadow 0.3s var(--wd-ease),
    border-color 0.3s var(--wd-ease);
}
.nav.is-scrolled {
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 1px 0 rgba(31, 36, 48, 0.04), 0 8px 28px rgba(31, 36, 48, 0.06);
  border-color: transparent;
}

.nav-inner {
  display: flex;
  align-items: center;
  gap: 28px;
  height: 68px;
}

/* 品牌 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-text {
  display: flex;
  flex-direction: column;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: 0.02em;
  color: var(--wd-text-1);
}
.logo-text small {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.18em;
  color: var(--wd-brand-300);
}

/* 主导航：胶囊底 + 滑出下划线 */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}
.nav-link {
  position: relative;
  padding: 9px 15px;
  border-radius: var(--wd-r-pill);
  font-size: 14.5px;
  font-weight: 500;
  color: var(--wd-text-2);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.24s var(--wd-ease), background 0.24s var(--wd-ease);
}
.nav-link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 0;
  height: 2px;
  border-radius: var(--wd-r-pill);
  background: linear-gradient(90deg, var(--wd-brand-400), var(--wd-brand-600));
  transform: translateX(-50%);
  transition: width 0.28s var(--wd-ease);
}
.nav-link:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.nav-link:hover::after {
  width: 22px;
}
.nav-link.is-active {
  color: var(--wd-brand);
  font-weight: 600;
}
.nav-link.is-active::after {
  width: 22px;
}

/* 右侧 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  font-weight: 500;
  color: var(--wd-text-2);
  text-decoration: none;
  transition: all 0.22s var(--wd-ease);
}
.ghost-btn:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.solid-btn {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 18px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 16px rgba(var(--wd-brand-rgb), 0.24);
  transition: all 0.22s var(--wd-ease);
}
.solid-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(var(--wd-brand-rgb), 0.3);
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px 0 4px;
  border-radius: var(--wd-r-pill);
  cursor: pointer;
  outline: none;
  transition: background 0.22s var(--wd-ease);
}
.user-chip:hover {
  background: #f2f4f8;
}
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--wd-text-1);
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.caret {
  font-size: 12px;
  color: var(--wd-text-4);
}

@media (max-width: 1080px) {
  .nav-links {
    gap: 0;
  }
  .nav-link {
    padding: 8px 10px;
    font-size: 13.5px;
  }
  .nav-inner {
    gap: 14px;
  }
}
@media (max-width: 860px) {
  .logo-text small,
  .ghost-label {
    display: none;
  }
}
</style>
