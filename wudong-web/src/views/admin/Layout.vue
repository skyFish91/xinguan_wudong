<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="260px" class="admin-aside">
        <div class="logo">
          <h2>🏛️ 平台管理</h2>
        </div>
        <el-menu
          :default-active="$route.path"
          router
          class="admin-menu"
          background-color="#1e293b"
          text-color="#94a3b8"
          active-text-color="#667eea"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><Odometer /></el-icon>
            <span>数据概览</span>
          </el-menu-item>
          <el-menu-item index="/admin/merchants">
            <el-icon><Shop /></el-icon>
            <span>商家管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/scenics">
            <el-icon><MapLocation /></el-icon>
            <span>景区管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/orders">
            <el-icon><Document /></el-icon>
            <span>订单管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/finance">
            <el-icon><Money /></el-icon>
            <span>财务管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <span>评价管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/statistics">
            <el-icon><TrendCharts /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主体内容 -->
      <el-container>
        <!-- 顶部栏 -->
        <el-header class="admin-header">
          <div class="header-left">
            <span class="admin-name">乌东文旅平台管理系统</span>
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
        <el-main class="admin-main">
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
  Shop,
  User,
  MapLocation,
  Document,
  Money,
  ChatDotRound,
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
    router.push('/admin/login')
  } else if (command === 'tourist') {
    router.push('/')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.el-container {
  height: 100%;
}

.admin-aside {
  background: #1e293b;
  height: 100vh;
  overflow-y: auto;
}

.logo {
  padding: 30px 20px;
  text-align: center;
  border-bottom: 1px solid #334155;
}

.logo h2 {
  color: #667eea;
  font-size: 20px;
  font-weight: bold;
}

.admin-menu {
  border-right: none;
}

.admin-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.admin-name {
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

.admin-main {
  background: #f5f7fa;
  padding: 30px;
  overflow-y: auto;
}
</style>
