<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <h1>🏔️ 乌东文旅</h1>
          <p>探索黔东南的秘境之美</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="icon">📍</div>
            <div class="text">
              <h3>GPS 智能定位</h3>
              <p>自动推荐最近景区</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">🎫</div>
            <div class="text">
              <h3>实时库存查询</h3>
              <p>票量透明，不怕买不到</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">⚡</div>
            <div class="text">
              <h3>一键预订</h3>
              <p>快速下单，轻松出游</p>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form">
          <h2>欢迎回来</h2>
          <p class="subtitle">选择身份登录您的账号</p>

          <!-- 身份选择 -->
          <div class="role-tabs">
            <div
              class="role-tab"
              :class="{ active: loginRole === 'tourist' }"
              @click="loginRole = 'tourist'"
            >
              <el-icon><User /></el-icon>
              <span>游客登录</span>
            </div>
            <div
              class="role-tab"
              :class="{ active: loginRole === 'merchant' }"
              @click="loginRole = 'merchant'"
            >
              <el-icon><Shop /></el-icon>
              <span>商家登录</span>
            </div>
            <div
              class="role-tab"
              :class="{ active: loginRole === 'admin' }"
              @click="loginRole = 'admin'"
            >
              <el-icon><Setting /></el-icon>
              <span>管理员</span>
            </div>
          </div>

          <el-form ref="formRef" :model="form" :rules="rules" @submit.prevent="handleLogin">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="手机号/邮箱"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="密码"
                size="large"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="form-extras">
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>

            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              style="width: 100%; margin-top: 20px"
            >
              登录
            </el-button>
          </el-form>

          <div class="divider" v-if="loginRole === 'tourist'">
            <span>或</span>
          </div>

          <div class="social-login" v-if="loginRole === 'tourist'">
            <button class="social-btn wechat">
              <span class="icon">💬</span>
              微信登录
            </button>
            <button class="social-btn qq">
              <span class="icon">🐧</span>
              QQ登录
            </button>
          </div>

          <div class="register-link" v-if="loginRole === 'tourist'">
            还没有账号？
            <router-link to="/register">立即注册</router-link>
          </div>

          <div class="other-links" v-if="loginRole !== 'tourist'">
            <router-link to="/" class="back-home">返回首页</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Shop, Setting } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref()
const loginRole = ref('tourist') // 登录角色：tourist/merchant/admin

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

async function handleLogin() {
  try {
    await formRef.value.validate()

    loading.value = true

    // 模拟登录（实际应调用后端 API）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 根据角色设置不同的用户数据
    let mockUser
    let redirectPath

    if (loginRole.value === 'merchant') {
      mockUser = {
        id: 100,
        username: form.username,
        role: 'merchant',
        merchantName: '西江千户苗寨管理处',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant'
      }
      redirectPath = '/merchant/dashboard'
    } else if (loginRole.value === 'admin') {
      mockUser = {
        id: 1000,
        username: form.username,
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      }
      redirectPath = '/admin/dashboard'
    } else {
      mockUser = {
        id: 10001,
        username: form.username,
        role: 'tourist',
        email: 'user@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
      }
      redirectPath = route.query.redirect as string || '/'
    }

    userStore.setToken(`${loginRole.value}-token-` + Date.now())
    userStore.setUserInfo(mockUser)

    ElMessage.success('登录成功！')
    router.push(redirectPath)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.login-container {
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.login-left {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand h1 {
  font-size: 48px;
  margin-bottom: 10px;
}

.brand p {
  font-size: 18px;
  opacity: 0.9;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 60px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-item .icon {
  font-size: 40px;
}

.feature-item .text h3 {
  font-size: 20px;
  margin-bottom: 5px;
}

.feature-item .text p {
  font-size: 14px;
  opacity: 0.9;
}

.login-right {
  padding: 60px;
  display: flex;
  align-items: center;
}

.login-form {
  width: 100%;
}

.login-form h2 {
  font-size: 32px;
  color: #2d3748;
  margin-bottom: 10px;
}

.subtitle {
  color: #718096;
  margin-bottom: 30px;
}

.role-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.role-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px 10px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
}

.role-tab:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.role-tab.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-weight: 600;
}

.role-tab .el-icon {
  font-size: 24px;
}

.role-tab span {
  font-size: 13px;
}

.form-extras {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.divider {
  text-align: center;
  margin: 30px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e2e8f0;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #a0aec0;
  font-size: 14px;
}

.social-login {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.social-btn {
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.social-btn:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.social-btn .icon {
  font-size: 20px;
}

.register-link {
  text-align: center;
  margin-top: 30px;
  color: #718096;
  font-size: 14px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.other-links {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.back-home {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.back-home:hover {
  text-decoration: underline;
}
</style>
