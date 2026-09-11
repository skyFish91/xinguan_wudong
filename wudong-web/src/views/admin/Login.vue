<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <h1>🏛️ 乌东文旅</h1>
          <h2>平台管理系统</h2>
          <p>统一管理商家、用户、订单和数据</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="icon">👥</div>
            <div class="text">
              <h3>商家管理</h3>
              <p>审核商家入驻，管理商家信息</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">📊</div>
            <div class="text">
              <h3>数据统计</h3>
              <p>平台整体数据分析</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">💰</div>
            <div class="text">
              <h3>财务管理</h3>
              <p>订单流水、分成结算</p>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form">
          <h2>管理员登录</h2>
          <p class="subtitle">登录平台管理系统</p>

          <el-form ref="formRef" :model="form" :rules="rules">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="管理员账号"
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

            <el-form-item prop="code">
              <div style="display: flex; gap: 10px">
                <el-input
                  v-model="form.code"
                  placeholder="验证码"
                  size="large"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Key /></el-icon>
                  </template>
                </el-input>
                <div class="captcha-code">
                  {{ captchaCode }}
                </div>
              </div>
            </el-form-item>

            <div class="form-extras">
              <el-checkbox v-model="form.remember">记住我</el-checkbox>
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

          <div class="tourist-link">
            <router-link to="/">返回游客端</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  code: '',
  remember: false
})

const captchaCode = computed(() => {
  // 简单的验证码生成
  return Math.random().toString(36).substring(2, 6).toUpperCase()
})

const rules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

async function handleLogin() {
  try {
    await formRef.value.validate()

    loading.value = true

    // 模拟管理员登录（实际应调用后端 API）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟管理员数据
    const mockAdmin = {
      id: 1000,
      username: form.username,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }

    userStore.setToken('admin-token-' + Date.now())
    userStore.setUserInfo(mockAdmin)

    ElMessage.success('登录成功！')

    // 跳转到管理后台
    const redirect = route.query.redirect as string || '/admin/dashboard'
    router.push(redirect)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
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

.brand h2 {
  font-size: 28px;
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
  margin-bottom: 40px;
}

.captcha-code {
  width: 120px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 5px;
  border-radius: 6px;
  user-select: none;
}

.form-extras {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.tourist-link {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.tourist-link a {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
}

.tourist-link a:hover {
  text-decoration: underline;
}
</style>
