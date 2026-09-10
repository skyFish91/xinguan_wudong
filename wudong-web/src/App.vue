<template>
  <div id="app">
    <header class="header">
      <div class="header-content">
        <router-link to="/" class="logo">🏔️ 乌东文旅</router-link>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/scenic">景区</router-link>
          <router-link to="/route">路线</router-link>
          <router-link
            v-if="userStore.userInfo?.role === 'merchant'"
            to="/merchant/dashboard"
            class="merchant-link"
          >
            <el-icon><Shop /></el-icon>
            商家后台
          </router-link>
        </nav>
        <div class="user-actions">
          <router-link to="/cart" class="cart-link" v-if="isTouristSide">
            <el-badge :value="cartStore.totalCount" :hidden="cartStore.totalCount === 0" :max="99">
              <el-icon :size="22"><ShoppingCart /></el-icon>
            </el-badge>
          </router-link>
          <template v-if="userStore.isLoggedIn">
            <el-dropdown @command="handleCommand">
              <div class="user-info">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar">
                  {{ userStore.userInfo?.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userStore.userInfo?.username }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><Document /></el-icon>
                    我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="favorites">
                    <el-icon><Star /></el-icon>
                    我的收藏
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-login">登录</router-link>
            <router-link to="/register" class="btn-register">注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>乌东文旅致力于打造黔东南最专业的旅游服务平台</p>
        </div>
        <div class="footer-section">
          <h3>联系方式</h3>
          <p>客服电话：400-888-8888</p>
          <p>邮箱：service@wudong.com</p>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <span>微信</span>
            <span>微博</span>
            <span>抖音</span>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 乌东文旅平台 · 探索黔东南之美</p>
      </div>
    </footer>

    <!-- 智能客服（仅游客端显示） -->
    <CustomerService v-if="isTouristSide" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Document, Star, SwitchButton, Shop, ShoppingCart } from '@element-plus/icons-vue'
import CustomerService from '@/components/CustomerService.vue'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()
const route = useRoute()

// 商家端 / 平台端有自己的整屏布局，不叠加游客端的头尾和客服
const isTouristSide = computed(() => {
  return !route.path.startsWith('/merchant') && !route.path.startsWith('/admin')
})

function handleCommand(command: string) {
  if (command === 'logout') {
    ElMessage.success('退出成功')
    userStore.logout()
    router.push('/')
  } else {
    router.push(`/user/${command}`)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: #fff;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  text-decoration: none;
  cursor: pointer;
}

.nav {
  display: flex;
  gap: 30px;
  margin-left: auto;
  margin-right: 40px;
}

.nav a {
  text-decoration: none;
  color: #666;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.nav a:hover,
.nav a.router-link-active {
  color: #667eea;
}

.merchant-link {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white !important;
  border-radius: 20px;
  transition: all 0.3s;
}

.merchant-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
  color: white !important;
}

.cart-link {
  display: flex;
  align-items: center;
  color: #4a5568;
  transition: color 0.3s;
  margin-right: 20px;
}

.cart-link:hover {
  color: #667eea;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.user-info:hover {
  background: #f5f5f5;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.btn-login,
.btn-register {
  padding: 8px 24px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-login:hover {
  background: #667eea;
  color: white;
}

.btn-register {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.footer {
  background: #2d3748;
  color: white;
  margin-top: auto;
  padding-top: 60px;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 30px 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: white;
}

.footer-section p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.8;
}

.social-links {
  display: flex;
  gap: 15px;
}

.social-links span {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.social-links span:hover {
  background: rgba(255, 255, 255, 0.2);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 30px;
  text-align: center;
}

.footer-bottom p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
