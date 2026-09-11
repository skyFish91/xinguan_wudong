<template>
  <div class="merchant-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="260px" class="merchant-aside">
        <div class="logo">
          <h2>🏪 商家后台</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="merchant-menu"
          background-color="#1f2937"
          text-color="#9ca3af"
          active-text-color="#f59e0b"
        >
          <el-menu-item index="/merchant/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/merchant/scenics">
            <el-icon><MapLocation /></el-icon>
            <span>景区管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/tickets">
            <el-icon><Tickets /></el-icon>
            <span>票种管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/merchant/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>营收统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主体内容 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header class="merchant-header">
          <div class="header-left">
            <span class="merchant-name">{{ userStore.userInfo?.merchantName }}</span>
          </div>
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="tourist">
                    <el-icon><House /></el-icon>
                    返回游客端
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="merchant-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Odometer,
  MapLocation,
  Tickets,
  Document,
  TrendCharts,
  House,
  SwitchButton
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessage.success('退出成功')
    userStore.logout()
    router.push('/merchant/login')
  } else if (command === 'tourist') {
    router.push('/')
  }
}
</script>

<style scoped>
.merchant-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.merchant-aside {
  background: #1f2937;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #374151;
}

.logo h2 {
  color: #f59e0b;
  font-size: 20px;
  font-weight: bold;
}

.merchant-menu {
  border-right: none;
}

.merchant-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.merchant-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background: #f7fafc;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.merchant-main {
  background: #f5f7fa;
  padding: 30px;
  overflow-y: auto;
}
</style>
