<template>
  <div class="merchant-login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <h1>🏪 乌东文旅</h1>
          <h2>商家管理平台</h2>
          <p>高效管理您的旅游业务</p>
        </div>
        <div class="features">
          <div class="feature-item">
            <div class="icon">📊</div>
            <div class="text">
              <h3>实时数据</h3>
              <p>订单、营收一目了然</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">🎫</div>
            <div class="text">
              <h3>票务管理</h3>
              <p>灵活配置票种和库存</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="icon">💰</div>
            <div class="text">
              <h3>收益透明</h3>
              <p>清晰的财务报表</p>
            </div>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-form">
          <h2>商家登录</h2>
          <p class="subtitle">登录您的商家账号</p>

          <el-form ref="formRef" :model="form" :rules="rules">
            <el-form-item prop="username">
              <el-input
                v-model="form.username"
                placeholder="商家账号"
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

          <div class="register-link">
            还没有商家账号？
            <a href="#" @click.prevent="handleApply">申请入驻</a>
          </div>

          <div class="tourist-link">
            <router-link to="/">返回游客端</router-link>
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
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入商家账号', trigger: 'blur' }
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

    // 模拟商家登录（实际应调用后端 API）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟商家数据
    const mockMerchant = {
      id: 100,
      username: form.username,
      role: 'merchant',
      merchantName: '西江千户苗寨管理处',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=merchant'
    }

    userStore.setToken('merchant-token-' + Date.now())
    userStore.setUserInfo(mockMerchant)

    ElMessage.success('登录成功！')

    // 跳转到商家后台
    const redirect = route.query.redirect as string || '/merchant/dashboard'
    router.push(redirect)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function handleApply() {
  ElMessage.info('请联系平台客服申请入驻')
}
</script>

<style scoped>
.merchant-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

.form-extras {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.forgot-link {
  color: #f59e0b;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

.register-link {
  text-align: center;
  margin-top: 30px;
  color: #718096;
  font-size: 14px;
}

.register-link a {
  color: #f59e0b;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.tourist-link {
  text-align: center;
  margin-top: 20px;
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
