<template>
  <div class="profile-page">
    <h2 class="page-title">个人资料</h2>

    <el-form :model="form" label-width="100px" class="profile-form">
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
        >
          <el-avatar :size="100" :src="form.avatar">
            {{ form.username?.charAt(0) }}
          </el-avatar>
          <div class="upload-text">点击上传</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>

      <el-form-item label="手机号">
        <el-input v-model="form.phone" />
      </el-form-item>

      <el-form-item label="邮箱">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">
          保存修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const saving = ref(false)

const form = reactive({
  username: '',
  phone: '',
  email: '',
  avatar: ''
})

function handleAvatarSuccess(response: any) {
  form.avatar = response.url
  ElMessage.success('头像上传成功')
}

async function handleSave() {
  saving.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))

  userStore.setUserInfo({
    ...userStore.userInfo,
    ...form
  })

  ElMessage.success('保存成功')
  saving.value = false
}

onMounted(() => {
  if (userStore.userInfo) {
    Object.assign(form, userStore.userInfo)
  }
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #2d3748;
}

.profile-form {
  max-width: 600px;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-text {
  font-size: 12px;
  color: #667eea;
  cursor: pointer;
}
</style>
