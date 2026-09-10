<template>
  <div class="main-layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="container">
        <div class="header-content">
          <!-- Logo -->
          <div class="logo" @click="$router.push('/')">
            <span class="logo-text gradient-text">乌东文旅</span>
          </div>

          <!-- 导航菜单 -->
          <nav class="nav">
            <router-link to="/" class="nav-item" active-class="active">首页</router-link>
            <router-link to="/community" class="nav-item" active-class="active">旅行社区</router-link>
            <router-link to="/scenic" class="nav-item" active-class="active">景点</router-link>
            <router-link to="/food" class="nav-item" active-class="active">美食</router-link>
            <router-link to="/stay" class="nav-item" active-class="active">住宿</router-link>
          </nav>

          <!-- 右侧操作 -->
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索游记、景点"
              class="search-input"
              prefix-icon="Search"
              @keyup.enter="handleSearch"
            />

            <!-- 未登录 -->
            <div class="auth-buttons" v-if="!userStore.isLoggedIn">
              <el-button @click="$router.push('/login')">登录</el-button>
              <el-button type="primary" @click="$router.push('/login')">注册</el-button>
            </div>

            <!-- 已登录 -->
            <el-dropdown v-else @command="handleUserAction">
              <div class="user-btn">
                <el-avatar :size="36" :src="userStore.userInfo?.avatar" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="posts">我的游记</el-dropdown-item>
                  <el-dropdown-item command="favorites">我的收藏</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </header>

    <!-- 主体内容 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h3>乌东文旅</h3>
            <p>探索美好生活，记录旅行点滴</p>
          </div>
          <div class="footer-links">
            <div class="link-group">
              <h4>平台服务</h4>
              <a href="#">关于我们</a>
              <a href="#">服务条款</a>
              <a href="#">隐私政策</a>
            </div>
            <div class="link-group">
              <h4>帮助中心</h4>
              <a href="#">常见问题</a>
              <a href="#">联系客服</a>
              <a href="#">商家入驻</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 乌东文旅平台. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const searchKeyword = ref('')

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({
      path: '/community',
      query: { q: searchKeyword.value }
    })
  }
}

const handleUserAction = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确认退出登录？', '提示', {
        type: 'warning'
      })
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
    } catch (error) {
      // 取消
    }
  } else if (command === 'profile') {
    router.push('/user')
  } else if (command === 'posts') {
    router.push('/user/posts')
  } else if (command === 'favorites') {
    router.push('/user/favorites')
  }
}
</script>

<style lang="scss" scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;

    .logo-text {
      font-size: 24px;
      font-weight: 700;
    }
  }

  .nav {
    display: flex;
    gap: 40px;

    .nav-item {
      font-size: 16px;
      color: #666;
      position: relative;
      transition: color 0.3s;

      &:hover,
      &.active {
        color: #667eea;
      }

      &.active::after {
        content: '';
        position: absolute;
        bottom: -24px;
        left: 50%;
        transform: translateX(-50%);
        width: 20px;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 2px;
      }
    }
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;

    .search-input {
      width: 240px;
    }

    .auth-buttons {
      display: flex;
      gap: 12px;
    }

    .user-btn {
      cursor: pointer;
      transition: transform 0.3s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.footer {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 60px 0 20px;
  margin-top: 80px;

  .footer-content {
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
  }

  .footer-info {
    h3 {
      font-size: 24px;
      margin-bottom: 12px;
    }

    p {
      color: #95a5a6;
    }
  }

  .footer-links {
    display: flex;
    gap: 80px;

    .link-group {
      h4 {
        font-size: 16px;
        margin-bottom: 16px;
      }

      a {
        display: block;
        color: #95a5a6;
        margin-bottom: 12px;
        transition: color 0.3s;

        &:hover {
          color: #fff;
        }
      }
    }
  }

  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #95a5a6;
  }
}
</style>
