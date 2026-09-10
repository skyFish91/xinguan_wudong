<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>🏔️ 加入乌东文旅</h1>
        <p>开启您的旅行之旅</p>
      </div>

      <div class="register-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱"
              size="large"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码（至少6位）"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
            />
          </el-form-item>

          <el-form-item prop="agree">
            <el-checkbox v-model="form.agree">
              我已阅读并同意
              <a href="#" class="link">《用户协议》</a>
              和
              <a href="#" class="link">《隐私政策》</a>
            </el-checkbox>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRegister"
            style="width: 100%; margin-top: 10px"
          >
            立即注册
          </el-button>
        </el-form>

        <div class="login-link">
          已有账号？
          <router-link to="/login">立即登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  agree: false
})

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass, trigger: 'blur' }
  ],
  agree: [
    {
      validator: (rule: any, value: any, callback: any) => {
        if (!value) {
          callback(new Error('请阅读并同意用户协议'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

async function handleRegister() {
  try {
    await formRef.value.validate()

    loading.value = true

    // 模拟注册（实际应调用后端 API）
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 自动登录
    const mockUser = {
      id: Date.now(),
      username: form.username,
      phone: form.phone,
      email: form.email,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + form.username
    }

    userStore.setToken('mock-token-' + Date.now())
    userStore.setUserInfo(mockUser)

    ElMessage.success('注册成功！')
    router.push('/')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.register-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 50px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.register-header h1 {
  font-size: 36px;
  color: #2d3748;
  margin-bottom: 10px;
}

.register-header p {
  color: #718096;
  font-size: 16px;
}

.link {
  color: #667eea;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.login-link {
  text-align: center;
  margin-top: 30px;
  color: #718096;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
