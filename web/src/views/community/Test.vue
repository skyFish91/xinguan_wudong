<template>
  <div style="padding: 40px; background: #f5f5f5; min-height: 100vh;">
    <div style="max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
      <h1 style="color: #409eff; margin-bottom: 20px;">🎉 社区功能测试页面</h1>

      <el-alert
        title="页面加载成功！"
        type="success"
        :closable="false"
        style="margin-bottom: 20px;"
      >
        如果你能看到这个页面，说明路由和Vue组件都正常工作。
      </el-alert>

      <el-card style="margin-bottom: 20px;">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>系统状态</span>
            <el-button type="primary" size="small" @click="testApi">测试API</el-button>
          </div>
        </template>

        <el-descriptions :column="2" border>
          <el-descriptions-item label="前端地址">http://localhost:3000/</el-descriptions-item>
          <el-descriptions-item label="后端地址">http://localhost:8001/</el-descriptions-item>
          <el-descriptions-item label="当前路由">{{ $route.path }}</el-descriptions-item>
          <el-descriptions-item label="Token状态">{{ hasToken ? '已登录' : '未登录' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card v-if="!hasToken" style="margin-bottom: 20px;">
        <template #header>登录测试</template>
        <el-button type="primary" @click="quickLogin">快速登录（13800138000）</el-button>
        <p style="margin-top: 10px; color: #999; font-size: 14px;">
          点击按钮快速登录测试账号
        </p>
      </el-card>

      <el-card style="margin-bottom: 20px;">
        <template #header>API测试结果</template>
        <div v-if="apiResult">
          <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;">{{ apiResult }}</pre>
        </div>
        <div v-else style="color: #999;">
          点击"测试API"按钮查看结果
        </div>
      </el-card>

      <el-card>
        <template #header>快速跳转</template>
        <el-space wrap>
          <el-button @click="$router.push('/community')">社区首页</el-button>
          <el-button @click="$router.push('/community/feed')">游记列表</el-button>
          <el-button @click="$router.push('/')">返回首页</el-button>
        </el-space>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const hasToken = computed(() => !!localStorage.getItem('token'))
const apiResult = ref('')

const quickLogin = async () => {
  try {
    const res = await axios.post('/app/user/login/password', {
      phone: '13800138000',
      password: '123456'
    })

    if (res.data.code === 1000) {
      localStorage.setItem('token', res.data.data.token)
      ElMessage.success('登录成功！')
      location.reload()
    } else {
      ElMessage.error('登录失败: ' + res.data.message)
    }
  } catch (error) {
    ElMessage.error('登录请求失败: ' + error.message)
  }
}

const testApi = async () => {
  apiResult.value = '正在测试...'

  try {
    const token = localStorage.getItem('token')

    // 显示当前token状态用于调试
    console.log('当前token:', token)
    apiResult.value = '当前token: ' + (token ? token.substring(0, 50) + '...' : '无') + '\n\n正在请求...'

    if (!token) {
      apiResult.value = 'Error: 请先登录，localStorage中没有token'
      ElMessage.error('请先登录')
      return
    }

    const res = await axios({
      method: 'POST',
      url: '/app/notePost/feed',
      data: {
        page: 1,
        pageSize: 10
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    apiResult.value = JSON.stringify(res.data, null, 2)

    if (res.data.code === 1000) {
      ElMessage.success('API调用成功！返回 ' + (res.data.data?.list?.length || 0) + ' 条数据')
    } else {
      ElMessage.warning('API返回: ' + res.data.message)
    }
  } catch (error) {
    console.error('API Error:', error)
    apiResult.value = 'Error: ' + error.message + '\n\n详细信息:\n' + JSON.stringify(error.response?.data || {}, null, 2)
    ElMessage.error('API调用失败: ' + error.message)
  }
}
</script>
