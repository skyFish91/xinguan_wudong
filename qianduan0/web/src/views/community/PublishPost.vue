<template>
  <div class="publish-post-page">
    <TopNav />

    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">发布游记</h1>
        <p class="page-sub">记录一段旅途，分享给同样在路上的人</p>
      </header>

      <div class="publish-layout">
        <!-- 表单 -->
        <div class="wd-card publish-card">
          <el-form :model="formData" label-width="88px" label-position="top">
            <!-- 标题 -->
            <el-form-item label="标题" required>
              <el-input
                v-model="formData.title"
                placeholder="一句话说清这段旅程，例如「四月的乌东梯田，灌水正当时」"
                maxlength="100"
                show-word-limit
                size="large"
              />
            </el-form-item>

            <!-- 内容 -->
            <el-form-item label="正文" required>
              <el-input
                v-model="formData.content"
                type="textarea"
                placeholder="路程怎么走、住在哪、吃了什么、花了多少钱……写下来就是别人的攻略。"
                :rows="9"
                maxlength="5000"
                show-word-limit
              />
            </el-form-item>

            <!-- 地点 -->
            <el-form-item label="地点">
              <div class="loc-row">
                <el-input
                  v-model="formData.location"
                  placeholder="填写地点名称，或点击右侧定位"
                  maxlength="100"
                />
                <el-button type="primary" plain :loading="locating" @click="handleLocationClick">
                  <el-icon><Location /></el-icon>
                  定位
                </el-button>
              </div>
              <p v-if="formData.lng && formData.lat" class="field-hint">
                已获取坐标：{{ formData.lat.toFixed(6) }}, {{ formData.lng.toFixed(6) }}
              </p>
            </el-form-item>

            <!-- 话题 -->
            <el-form-item label="话题">
              <el-select
                v-model="formData.topicIds"
                multiple
                placeholder="选择相关话题，更容易被同好看到"
                class="full"
              >
                <el-option v-for="topic in topics" :key="topic.id" :label="topic.name" :value="topic.id" />
              </el-select>
            </el-form-item>

            <!-- 图片 -->
            <el-form-item label="配图">
              <div class="upload-wrap">
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
                <p class="field-hint">支持多张，第一张会自动作为封面</p>
              </div>
            </el-form-item>

            <!-- 操作 -->
            <el-form-item class="actions-item">
              <div class="actions">
                <el-button type="primary" size="large" :loading="publishing" @click="handlePublish">
                  {{ publishing ? '发布中…' : '发布游记' }}
                </el-button>
                <el-button size="large" @click="handleCancel">取消</el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 侧栏提示 -->
        <aside class="side-col">
          <div class="wd-card tip-card">
            <h3 class="tip-title">怎么写更受欢迎</h3>
            <ul class="tip-list">
              <li>标题具体一点，带上季节或地点</li>
              <li>正文分段写，路线、花费、避坑分开说</li>
              <li>配 3 张以上实拍图，封面选最有代表性的</li>
              <li>选好话题，让同好能找到你</li>
            </ul>
          </div>

          <div class="wd-card tip-card">
            <h3 class="tip-title">审核说明</h3>
            <p class="tip-text">
              游记提交后进入审核，通过后会在社区公开展示；如有问题会附带驳回原因。
            </p>
          </div>
        </aside>
      </div>
    </div>

    <el-image-viewer
      v-if="showImageViewer"
      :url-list="[previewImageUrl]"
      @close="showImageViewer = false"
    />
  </div>
</template>

<script setup>
import TopNav from '../../components/TopNav.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Location } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'

const router = useRouter()

const formData = ref({
  title: '',
  content: '',
  location: '',
  topicIds: [],
  images: [],
  lat: null,
  lng: null,
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
    const images = fileList.value.map((f) => f.serverUrl || '').filter((url) => url)

    await communityApi.publish({
      title: formData.value.title,
      content: formData.value.content,
      topicIds: formData.value.topicIds,
      images,
      linkedName: formData.value.location || '',
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
  fileList.value = fileList.value.filter((f) => f !== file)
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

<style scoped>
.publish-post-page {
  min-height: calc(100vh - 60px);
  padding-bottom: var(--wd-s9);
}

.page-head {
  padding-bottom: var(--wd-s6);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.publish-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: var(--wd-s7);
  align-items: start;
}

.publish-card {
  padding: var(--wd-s6) var(--wd-s7) var(--wd-s5);
}

.loc-row {
  display: flex;
  gap: var(--wd-s3);
  width: 100%;
}
.field-hint {
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.full {
  width: 100%;
}
.upload-wrap {
  width: 100%;
}
.actions-item {
  margin-bottom: 0;
}
.actions {
  display: flex;
  gap: var(--wd-s3);
  padding-top: var(--wd-s2);
}

/* 侧栏 */
.side-col {
  min-width: 0;
}
.tip-card {
  padding: var(--wd-s5);
  margin-bottom: var(--wd-s4);
}
.tip-title {
  margin-bottom: var(--wd-s3);
  padding-bottom: var(--wd-s3);
  border-bottom: 1px solid var(--wd-border);
  font-size: 15px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.tip-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--wd-text-2);
}
.tip-list li + li {
  margin-top: 4px;
}
.tip-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--wd-text-2);
}

/* 上传控件对齐卡片风格 */
.publish-card :deep(.el-upload--picture-card),
.publish-card :deep(.el-upload-list--picture-card .el-upload-list__item) {
  border-radius: var(--wd-r-sm);
}

@media (max-width: 1000px) {
  .publish-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .publish-card {
    padding: var(--wd-s5);
  }
  .loc-row {
    flex-direction: column;
  }
}
</style>
