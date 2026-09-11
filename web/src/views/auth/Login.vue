<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <!-- 左侧装饰 -->
        <div class="login-banner">
          <div class="banner-content">
            <h1>欢迎来到乌东文旅</h1>
            <p>探索美好生活，记录旅行点滴</p>
          </div>
        </div>

        <!-- 右侧登录表单 -->
        <div class="login-form">
          <div class="form-header">
            <h2>{{ isRegister ? '注册账号' : '登录' }}</h2>
            <p>{{ isRegister ? '已有账号？' : '还没有账号？' }}
              <a @click="toggleMode">{{ isRegister ? '立即登录' : '立即注册' }}</a>
            </p>
          </div>

          <!-- 登录方式切换 -->
          <div class="login-tabs" v-if="!isRegister">
            <div
              :class="['tab-item', { active: loginType === 'password' }]"
              @click="loginType = 'password'"
            >
              密码登录
            </div>
            <div
              :class="['tab-item', { active: loginType === 'phone' }]"
              @click="loginType = 'phone'"
            >
              验证码登录
            </div>
          </div>

          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="form-content"
          >
            <!-- 手机号 -->
            <el-form-item label="手机号" prop="phone">
              <el-input
                v-model="form.phone"
                placeholder="请输入手机号"
                size="large"
                clearable
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 密码登录 -->
            <template v-if="loginType === 'password' && !isRegister">
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  show-password
                  clearable
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </template>

            <!-- 验证码登录 -->
            <template v-if="loginType === 'phone' || isRegister">
              <el-form-item label="验证码" prop="code">
                <div class="code-input">
                  <el-input
                    v-model="form.code"
                    placeholder="请输入验证码"
                    size="large"
                    maxlength="6"
                    clearable
                  >
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                  <el-button
                    size="large"
                    :disabled="countdown > 0"
                    @click="handleSendCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                  </el-button>
                </div>
              </el-form-item>

              <!-- 注册时的密码 -->
              <el-form-item label="设置密码" prop="password" v-if="isRegister">
                <el-input
                  v-model="form.password"
                  type="password"
                  placeholder="请设置密码（6-20位）"
                  size="large"
                  show-password
                  clearable
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <!-- 昵称 -->
              <el-form-item label="昵称" prop="nickname" v-if="isRegister">
                <el-input
                  v-model="form.nickname"
                  placeholder="请输入昵称"
                  size="large"
                  clearable
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>
            </template>

            <!-- 协议 -->
            <el-form-item prop="agree" v-if="isRegister">
              <el-checkbox v-model="form.agree">
                我已阅读并同意
                <a href="/terms" target="_blank">《用户协议》</a>
                和
                <a href="/privacy" target="_blank">《隐私政策》</a>
              </el-checkbox>
            </el-form-item>

            <!-- 提交按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="loading"
                @click="handleSubmit"
              >
                {{ isRegister ? '注册' : '登录' }}
              </el-button>
            </el-form-item>

            <!-- 忘记密码 -->
            <div class="form-footer" v-if="!isRegister">
              <a @click="handleForgetPassword">忘记密码？</a>
            </div>
          </el-form>

          <!-- 第三方登录 -->
          <div class="oauth-login" v-if="!isRegister">
            <div class="divider">
              <span>其他登录方式</span>
            </div>
            <div class="oauth-buttons">
              <el-button circle @click="handleOAuthLogin('wechat')">
                <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20">
                  <path d="M664.250054 368.541681c10.015098 0 19.892049 0.732687 29.67281 1.795902-26.647917-122.810047-159.358451-214.077703-310.826188-214.077703-169.353083 0-308.085774 114.232694-308.085774 259.274962 0 83.708494 46.165436 152.460344 123.281791 205.78483l-30.80868 91.730191 107.688651-53.455469c38.558178 7.53665 69.459978 15.308661 107.924012 15.308661 9.66308 0 19.230993-0.470721 28.752858-1.225921-6.025227-20.36584-9.521864-41.723264-9.521864-63.862493C402.328693 476.632491 517.908058 368.541681 664.250054 368.541681zM498.62897 285.87389c23.200398 0 38.557154 15.120372 38.557154 38.061874 0 22.846334-15.356756 38.156018-38.557154 38.156018-23.107277 0-46.260603-15.309684-46.260603-38.156018C452.368366 300.994262 475.522716 285.87389 498.62897 285.87389zM283.016307 362.091782c-23.107277 0-46.402843-15.309684-46.402843-38.156018 0-22.941502 23.295566-38.061874 46.402843-38.061874 23.081695 0 38.46301 15.120372 38.46301 38.061874C321.479317 346.782098 306.098002 362.091782 283.016307 362.091782zM945.448458 606.151333c0-121.888048-123.258255-221.236753-261.683954-221.236753-146.57838 0-262.015505 99.348706-262.015505 221.236753 0 122.06508 115.437126 221.200938 262.015505 221.200938 30.66644 0 61.617359-7.609305 92.423993-15.262612l84.513836 45.786813-23.178909-76.17082C899.379213 735.776599 945.448458 674.90216 945.448458 606.151333zM598.803483 567.994292c-15.332197 0-30.807656-15.096836-30.807656-30.501688 0-15.190981 15.47546-30.477129 30.807656-30.477129 23.295566 0 38.558178 15.286148 38.558178 30.477129C637.361661 552.897456 622.099049 567.994292 598.803483 567.994292zM768.25071 567.994292c-15.213493 0-30.594809-15.096836-30.594809-30.501688 0-15.190981 15.381315-30.477129 30.594809-30.477129 23.107277 0 38.558178 15.286148 38.558178 30.477129C806.808888 552.897456 791.357987 567.994292 768.25071 567.994292z" fill="#00c800"></path>
                </svg>
              </el-button>
              <el-button circle @click="handleOAuthLogin('qq')">
                <svg class="icon" viewBox="0 0 1024 1024" width="20" height="20">
                  <path d="M511.09 63.58c-218.22 0-395.62 177.4-395.62 395.62 0 107.85 43.17 205.58 113.18 276.88-10.64 32.44-50.18 125.82-89.69 191.94-12.8 21.43 9.14 32.27 18.43 26.4 52.9-33.39 164.91-99.54 215.8-127.28 38.21 10.13 78.54 15.61 120.27 15.61 218.22 0 395.62-177.4 395.62-395.62-0.01-218.23-177.41-395.55-378-395.55z" fill="#5CB3F9"></path>
                </svg>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Phone, Lock, Message, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isRegister = ref(false)
const loginType = ref('password') // password | phone
const loading = ref(false)
const countdown = ref(0)
const formRef = ref(null)

const form = reactive({
  phone: '',
  password: '',
  code: '',
  nickname: '',
  agree: false
})

// 表单验证规则
const rules = computed(() => {
  const baseRules = {
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ]
  }

  if (isRegister.value) {
    return {
      ...baseRules,
      code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6-20 位', trigger: 'blur' }
      ],
      nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度在 2-20 位', trigger: 'blur' }
      ],
      agree: [
        { validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请阅读并同意协议'))
          } else {
            callback()
          }
        }, trigger: 'change' }
      ]
    }
  } else if (loginType.value === 'password') {
    return {
      ...baseRules,
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    }
  } else {
    return {
      ...baseRules,
      code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
    }
  }
})

// 切换登录/注册模式
const toggleMode = () => {
  isRegister.value = !isRegister.value
  formRef.value?.resetFields()
}

// 发送验证码
const handleSendCode = async () => {
  try {
    await formRef.value.validateField('phone')

    loading.value = true
    await userStore.sendCode(form.phone)

    ElMessage.success('验证码已发送')
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    if (error.errors) {
      // 表单验证失败
    } else {
      ElMessage.error(error.message || '发送失败')
    }
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    loading.value = true

    if (isRegister.value) {
      // 注册
      await userStore.register({
        phone: form.phone,
        code: form.code,
        password: form.password,
        nickname: form.nickname
      })
      ElMessage.success('注册成功')

      // 跳转到来源页或首页
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      // 登录 - 完全参考 quick-login 的逻辑
      await userStore.login({ phone: form.phone, password: form.password })
      await userStore.getUserInfo()
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
      return

      const res = await axios({
        method: 'POST',
        url: '/app/user/login/password',
        data: {
          phone: form.phone,
          password: form.password
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('登录响应:', res)

      if (res.data && res.data.code === 1000 && res.data.data && res.data.data.token) {
        // 登录成功
        const loginToken = res.data.data.token
        localStorage.setItem('token', loginToken)

        ElMessage.success('登录成功！Token已保存')

        // 跳转到来源页或首页
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } else {
        ElMessage.error('登录失败：返回数据异常')
      }
    }
  } catch (error) {
    if (error.errors) {
      // 表单验证失败
    } else {
      console.error('登录失败:', error)
      ElMessage.error(error.message || '操作失败')
    }
  } finally {
    loading.value = false
  }
}

// 忘记密码
const handleForgetPassword = () => {
  ElMessage.info('请使用验证码登录')
  loginType.value = 'phone'
}

// 第三方登录
const handleOAuthLogin = (provider) => {
  ElMessage.info(`${provider} 登录功能开发中`)
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;

  .login-container {
    width: 100%;
    max-width: 1000px;
  }

  .login-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .login-banner {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 60px 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      display: none;
    }

    .banner-content {
      text-align: center;

      h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 16px;
      }

      p {
        font-size: 18px;
        opacity: 0.9;
      }
    }
  }

  .login-form {
    padding: 60px 40px;

    .form-header {
      margin-bottom: 32px;

      h2 {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 8px;
      }

      p {
        color: #999;
        font-size: 14px;

        a {
          color: #667eea;
          cursor: pointer;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .login-tabs {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
      border-bottom: 2px solid #f0f0f0;

      .tab-item {
        padding: 12px 0;
        cursor: pointer;
        color: #999;
        transition: all 0.3s;
        position: relative;

        &:hover {
          color: #667eea;
        }

        &.active {
          color: #667eea;
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #667eea;
          }
        }
      }
    }

    .code-input {
      display: flex;
      gap: 12px;

      .el-input {
        flex: 1;
      }

      .el-button {
        width: 120px;
        flex-shrink: 0;
      }
    }

    .form-footer {
      text-align: right;
      margin-top: -10px;

      a {
        color: #667eea;
        font-size: 14px;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .oauth-login {
      margin-top: 40px;

      .divider {
        text-align: center;
        position: relative;
        margin-bottom: 24px;

        &::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e0e0e0;
        }

        span {
          position: relative;
          background: #fff;
          padding: 0 16px;
          color: #999;
          font-size: 14px;
        }
      }

      .oauth-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;

        .el-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #e0e0e0;

          &:hover {
            border-color: #667eea;
          }

          .icon {
            display: block;
          }
        }
      }
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
}

:deep(.el-checkbox__label) {
  color: #666;
  font-size: 14px;

  a {
    color: #667eea;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
