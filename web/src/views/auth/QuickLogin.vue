<template>
  <div style="padding: 40px; max-width: 500px; margin: 0 auto;">
    <el-card>
      <template #header>
        <h2 style="margin: 0;">快速登录</h2>
      </template>

      <el-form :model="form" label-width="80px">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="13800138000" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="123456" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%;">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div v-if="result" style="margin-top: 20px;">
        <el-alert :type="result.type" :title="result.title" :closable="false" show-icon>
          <pre style="margin: 10px 0 0 0; font-size: 12px; max-height: 300px; overflow: auto;">{{ result.data }}</pre>
        </el-alert>
      </div>

      <div v-if="token" style="margin-top: 20px;">
        <el-button type="success" @click="goToCommunity" style="width: 100%;">
          进入社区页面
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const form = ref({
  phone: '13800138000',
  password: '123456'
})
const loading = ref(false)
const result = ref(null)
const token = ref(localStorage.getItem('token'))

const handleLogin = async () => {
  loading.value = true
  result.value = null

  try {
    const res = await axios({
      method: 'POST',
      url: '/app/user/login/password',
      data: {
        phone: form.value.phone,
        password: form.value.password
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
      token.value = loginToken

      result.value = {
        type: 'success',
        title: '✅ 登录成功！',
        data: JSON.stringify(res.data, null, 2)
      }

      ElMessage.success('登录成功！Token已保存到localStorage')
    } else {
      result.value = {
        type: 'warning',
        title: '⚠️ 登录返回异常',
        data: JSON.stringify(res.data, null, 2)
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    result.value = {
      type: 'error',
      title: '❌ 登录失败',
      data: error.message + '\n\n' + JSON.stringify(error.response?.data || {}, null, 2)
    }
    ElMessage.error('登录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

const goToCommunity = () => {
  router.push('/community/feed')
}
</script>
