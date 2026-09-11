<template>
  <div class="layout">
    <!-- 侧栏 -->
    <aside class="side">
      <div class="logo">
        <BrandMark :size="34" tone="light" class="logo-icon" />
        <div class="logo-text">
          <div class="logo-title">乌东文旅</div>
          <div class="logo-sub">苗寨数字管理平台</div>
        </div>
      </div>

      <el-menu :default-active="route.path" router class="menu" :collapse="false">
        <el-menu-item index="/">
          <el-icon><DataLine /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>

        <template v-if="userStore.role === 'admin'">
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/applies">
            <el-icon><Shop /></el-icon>
            <template #title>商家审核</template>
          </el-menu-item>
          <el-menu-item index="/orders">
            <el-icon><List /></el-icon>
            <template #title>订单总览</template>
          </el-menu-item>
          <el-menu-item index="/refunds">
            <el-icon><Money /></el-icon>
            <template #title>退款审批</template>
          </el-menu-item>
          <el-menu-item index="/content">
            <el-icon><ChatLineSquare /></el-icon>
            <template #title>内容审核</template>
          </el-menu-item>
          <el-menu-item index="/sensitive">
            <el-icon><Warning /></el-icon>
            <template #title>敏感词管理</template>
          </el-menu-item>
          <el-menu-item index="/ops">
            <el-icon><Picture /></el-icon>
            <template #title>运营管理</template>
          </el-menu-item>
          <el-menu-item index="/finance">
            <el-icon><Coin /></el-icon>
            <template #title>财务管理</template>
          </el-menu-item>
        </template>

        <template v-if="userStore.role === 'merchant'">
          <el-menu-item v-if="userStore.moduleType === 'clothing'" index="/merchant/clothing">
            <el-icon><Goods /></el-icon>
            <template #title>商品管理</template>
          </el-menu-item>
          <el-menu-item v-if="userStore.moduleType === 'food'" index="/merchant/food">
            <el-icon><Food /></el-icon>
            <template #title>餐厅管理</template>
          </el-menu-item>
          <el-menu-item v-if="userStore.moduleType === 'hotel'" index="/merchant/hotel">
            <el-icon><House /></el-icon>
            <template #title>民宿管理</template>
          </el-menu-item>
          <el-menu-item v-if="userStore.moduleType === 'travel'" index="/merchant/travel">
            <el-icon><Position /></el-icon>
            <template #title>票务管理</template>
          </el-menu-item>
        </template>
      </el-menu>

      <div class="side-footer">
        <div class="side-footer-tip">v 1.0 · 演示版</div>
      </div>
    </aside>

    <!-- 主体 -->
    <div class="main">
      <header class="head">
        <div class="head-left">
          <AppBreadcrumb />
        </div>
        <div class="head-right">
          <ThemeSwitch />
          <el-tag v-if="userStore.role === 'admin'" type="danger" effect="dark" round class="role-tag">平台管理员</el-tag>
          <el-tag v-else type="warning" effect="dark" round class="role-tag">
            {{ userStore.userInfo?.merchant?.shopName || '商家' }}
          </el-tag>
          <el-dropdown @command="onCommand" trigger="click">
            <div class="user-btn">
              <CartoonAvatar :size="32" :variant="avatarVariant" />
              <span class="user-name">{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      <main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../api/request';
import { useUserStore } from '../stores/user';
import AppBreadcrumb from '../components/AppBreadcrumb.vue';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import BrandMark from '../components/BrandMark.vue';
import CartoonAvatar from '../components/CartoonAvatar.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const avatarVariant = computed(() => {
  if (userStore.role === 'merchant') return userStore.moduleType || 'clothing';
  return 'admin';
});

function onCommand(cmd: string) {
  if (cmd === 'logout') {
    userStore.logout();
    router.push('/login');
  }
}

onMounted(async () => {
  try {
    const profile: any = await request.get('/auth/profile');
    userStore.setLogin(userStore.token, profile);
  } catch {
    // 已提示
  }
});
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* --- 侧栏（靛蓝渐变 + 银饰 logo）--- */
.side {
  width: 220px;
  background: var(--bg-side);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 4px 0 12px rgba(0,0,0,0.06);
}
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 18px 22px;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-icon {
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
}
.logo-title {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 1px;
}
.logo-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  margin-top: 2px;
  letter-spacing: 0.5px;
}
.menu {
  background: transparent !important;
  border-right: none !important;
  flex: 1;
  padding: 12px 8px;
}
.menu :deep(.el-menu-item) {
  color: rgba(255,255,255,0.78);
  border-radius: 6px;
  margin-bottom: 4px;
  height: 42px;
  line-height: 42px;
  transition: all 0.2s ease;
}
.menu :deep(.el-menu-item:hover) {
  background: var(--bg-side-hover) !important;
  color: #fff;
}
.menu :deep(.el-menu-item.is-active) {
  background: var(--bg-side-active) !important;
  color: #fff;
  position: relative;
}
.menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: #fff;
  border-radius: 2px;
}
.menu :deep(.el-icon) {
  color: inherit;
}
.side-footer {
  padding: 14px 18px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.side-footer-tip {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-align: center;
}

/* --- 主体 --- */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.head {
  height: 60px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: var(--shadow-sm);
}
.head-left {
  display: flex;
  align-items: center;
}
.head-right {
  display: flex;
  align-items: center;
  gap: 14px;
}
.role-tag {
  font-weight: 500;
}
.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 10px 4px 4px;
  border-radius: var(--radius-pill);
  transition: background 0.2s ease;
  color: var(--text-regular);
}
.user-btn:hover {
  background: var(--bg-page);
}
.user-name {
  font-size: 14px;
}
.content {
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: var(--bg-page);
}
</style>