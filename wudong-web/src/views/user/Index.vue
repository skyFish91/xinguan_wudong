<template>
  <div class="user-center">
    <div class="user-sidebar">
      <div class="user-profile-card">
        <el-avatar :size="80" :src="userStore.userInfo?.avatar">
          {{ userStore.userInfo?.username?.charAt(0) }}
        </el-avatar>
        <h3>{{ userStore.userInfo?.username }}</h3>
        <p>{{ userStore.userInfo?.email }}</p>
      </div>

      <el-menu
        :default-active="$route.path"
        router
        class="user-menu"
      >
        <el-menu-item index="/user/profile">
          <el-icon><User /></el-icon>
          <span>个人资料</span>
        </el-menu-item>
        <el-menu-item index="/user/orders">
          <el-icon><Document /></el-icon>
          <span>我的订单</span>
        </el-menu-item>
        <el-menu-item index="/user/favorites">
          <el-icon><Star /></el-icon>
          <span>我的收藏</span>
        </el-menu-item>
        <el-menu-item index="/user/reviews">
          <el-icon><ChatDotRound /></el-icon>
          <span>我的评价</span>
        </el-menu-item>
      </el-menu>
    </div>

    <div class="user-content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { User, Document, Star, ChatDotRound } from '@element-plus/icons-vue'

const userStore = useUserStore()
</script>

<style scoped>
.user-center {
  max-width: 1400px;
  margin: 40px auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
  min-height: 600px;
}

.user-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-profile-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.user-profile-card h3 {
  font-size: 20px;
  margin: 15px 0 5px;
  color: #2d3748;
}

.user-profile-card p {
  font-size: 14px;
  color: #718096;
}

.user-menu {
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.user-content {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  min-height: 500px;
}
</style>
