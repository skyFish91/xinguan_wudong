<template>
  <div class="publish-post-page">
    <div class="container">
      <div class="publish-card card">
        <h1>发布游记</h1>

        <el-form :model="formData" label-width="100px">
          <!-- 标题 -->
          <el-form-item label="标题" required>
            <el-input
              v-model="formData.title"
              placeholder="请输入游记标题"
              maxlength="100"
            />
          </el-form-item>

          <!-- 内容 -->
          <el-form-item label="内容" required>
            <el-input
              v-model="formData.content"
              type="textarea"
              placeholder="请输入游记内容"
              :rows="6"
              maxlength="5000"
            />
          </el-form-item>

          <!-- 地点 -->
          <el-form-item label="地点">
            <div style="display: flex; gap: 10px;">
              <el-input
                v-model="formData.location"
                placeholder="请输入旅游地点或点击定位"
                maxlength="100"
              />
              <el-button
                type="primary"
                @click="handleLocationClick"
                :loading="locating"
                icon="location"
              >
                📍 定位
              </el-button>
            </div>
            <div v-if="formData.lng && formData.lat" style="font-size: 12px; color: #666; margin-top: 5px;">
              坐标: {{ formData.lat.toFixed(6) }}, {{ formData.lng.toFixed(6) }}
            </div>
          </el-form-item>

          <!-- 话题 -->
          <el-form-item label="话题">
            <el-select
              v-model="formData.topicIds"
              multiple
              placeholder="选择相关话题"
            >
              <el-option
                v-for="topic in topics"
                :key="topic.id"
                :label="topic.name"
                :value="topic.id"
              />
            </el-select>
          </el-form-item>

          <!-- 图片上传 -->
          <el-form-item label="图片">
            <el-upload
              v-model:file-list="fileList"
              action="/api/upload/file"
              :headers="uploadHeaders"
              name="file"
              list-type="picture-card"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              multiple
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <!-- 按钮 -->
          <el-form-item>
            <el-button type="primary" @click="handlePublish" :loading="publishing">
              {{ publishing ? '发布中...' : '发布' }}
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'

const router = useRouter()

const formData = ref({
  title: '',
  content: '',
  location: '',
  topicIds: [],
  images: [],
  lat: null,
  lng: null
})

const fileList = ref([])
const topics = ref([])
const publishing = ref(false)
const locating = ref(false)
const showImageViewer = ref(false)
const previewImageUrl = ref('')

const loadTopics = async () => {
  try {
    const data = await communityApi.getTopics()
    topics.value = data.list || []
  } catch (err) {
    console.error('加载话题失败:', err)
  }
}

const handlePublish = async () => {
  if (!formData.value.title.trim()) {
    ElMessage.error('请输入标题')
    return
  }
  if (!formData.value.content.trim()) {
    ElMessage.error('请输入内容')
    return
  }

  publishing.value = true
  try {
    // 只取上传成功后由服务端返回的地址，避免把本地预览 blob: 地址发出去
    const images = fileList.value.map(f => f.serverUrl || '').filter(url => url)

    await communityApi.publish({
      title: formData.value.title,
      content: formData.value.content,
      topicIds: formData.value.topicIds,
      images,
      linkedName: formData.value.location || ''
    })

    ElMessage.success('发布成功')
    router.push('/community')
  } catch (err) {
    ElMessage.error(err.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

const handleCancel = () => {
  router.back()
}

const handlePreview = (file) => {
  previewImageUrl.value = file.url
  showImageViewer.value = true
}

const handleRemove = (file) => {
  fileList.value = fileList.value.filter(f => f !== file)
}

/** 上传需要登录态，统一从本地取 token */
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: 'Bearer ' + token } : {}
})

const handleUploadSuccess = (response, uploadFile) => {
  // 后端返回 [{ url, name }]（无 code 信封）
  const first = Array.isArray(response) ? response[0] : response
  const url = (first && (first.url || first.path)) || ''
  if (url) {
    uploadFile.serverUrl = url
  } else {
    ElMessage.error('图片上传失败')
  }
}

const handleLocationClick = () => {
  if (!navigator.geolocation) {
    ElMessage.error('您的浏览器不支持定位功能')
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      formData.value.lat = latitude
      formData.value.lng = longitude
      formData.value.location = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      ElMessage.success('定位成功')
      locating.value = false
    },
    (error) => {
      locating.value = false
      let message = '定位失败'
      if (error.code === error.PERMISSION_DENIED) {
        message = '您拒绝了位置权限，请在浏览器设置中允许'
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = '无法获取位置信息'
      } else if (error.code === error.TIMEOUT) {
        message = '定位超时'
      }
      ElMessage.error(message)
    }
  )
}

onMounted(() => {
  loadTopics()
})
</script>

<style lang="scss" scoped>
.publish-post-page {
  background: #f5f7fa;
  padding: 40px 0;
  min-height: calc(100vh - 60px);

  .publish-card {
    padding: 40px;
    margin: 0 auto;

    h1 {
      margin-bottom: 30px;
      font-size: 24px;
      font-weight: 600;
    }
  }
}
</style>

