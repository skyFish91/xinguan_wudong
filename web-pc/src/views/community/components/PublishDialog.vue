<template>
  <el-dialog
    v-model="visible"
    title="发布游记"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <!-- 上传图片/视频 -->
      <el-form-item label="照片视频" prop="images">
        <div class="upload-area">
          <!-- 图片上传 -->
          <el-upload
            v-if="!form.videoUrl"
            :file-list="fileList"
            list-type="picture-card"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
            :limit="9"
            multiple
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>

          <!-- 视频上传（二选一） -->
          <div class="video-upload" v-if="fileList.length === 0">
            <el-upload
              :show-file-list="false"
              :before-upload="beforeVideoUpload"
              :http-request="handleVideoUpload"
              accept="video/*"
            >
              <el-button type="primary" plain>
                <el-icon><VideoCamera /></el-icon>
                上传视频
              </el-button>
            </el-upload>
            <p class="upload-tip">图片最多9张 或 单个视频</p>
          </div>

          <!-- 视频预览 -->
          <div class="video-preview" v-if="form.videoUrl">
            <video :src="form.videoUrl" controls style="width: 100%; max-height: 300px" />
            <el-button type="danger" size="small" @click="removeVideo">删除视频</el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 标题 -->
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="给你的游记起个标题吧"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <!-- 正文 -->
      <el-form-item label="正文" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="分享你的旅行故事..."
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <!-- 话题 -->
      <el-form-item label="话题">
        <el-select
          v-model="form.topicIds"
          multiple
          filterable
          placeholder="添加话题（可选）"
          style="width: 100%"
        >
          <el-option
            v-for="topic in topics"
            :key="topic.id"
            :label="`# ${topic.name}`"
            :value="topic.id"
          />
        </el-select>
      </el-form-item>

      <!-- 关联地点 -->
      <el-form-item label="关联地点">
        <el-select
          v-model="form.poiId"
          filterable
          placeholder="选择地点（可选）"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="poi in pois"
            :key="poi.id"
            :label="poi.name"
            :value="poi.id"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        发布
      </el-button>
    </template>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="showViewer"
      :url-list="previewUrls"
      :initial-index="previewIndex"
      @close="showViewer = false"
    />
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, VideoCamera } from '@element-plus/icons-vue'
import { communityApi, uploadApi } from '@/api/community'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const form = ref({
  title: '',
  content: '',
  images: [],
  videoUrl: '',
  topicIds: [],
  poiId: null
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2-50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入正文', trigger: 'blur' },
    { min: 10, max: 5000, message: '正文长度在 10-5000 个字符', trigger: 'blur' }
  ],
  images: [
    {
      validator: (rule, value, callback) => {
        if (!form.value.images.length && !form.value.videoUrl) {
          callback(new Error('请上传图片或视频'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

const fileList = ref([])
const topics = ref([])
const pois = ref([])
const submitting = ref(false)
const showViewer = ref(false)
const previewUrls = ref([])
const previewIndex = ref(0)

// 加载话题和地点
const loadTopics = async () => {
  try {
    const data = await communityApi.getTopics()
    topics.value = data.list || []
  } catch (error) {
    console.error('加载话题失败', error)
  }
}

// 模拟加载地点（实际应该从后端获取）
const loadPois = () => {
  pois.value = [
    { id: 1, name: '乌东古城' },
    { id: 2, name: '云海公园' },
    { id: 3, name: '东山风景区' }
  ]
}

// 图片上传前校验
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB')
    return false
  }
  return true
}

// 图片上传
const handleUpload = async ({ file }) => {
  try {
    const url = await uploadApi.uploadImage(file)
    form.value.images.push(url)
    fileList.value.push({
      name: file.name,
      url
    })
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 移除图片
const handleRemove = (file) => {
  const index = fileList.value.findIndex((item) => item.url === file.url)
  if (index > -1) {
    fileList.value.splice(index, 1)
    form.value.images.splice(index, 1)
  }
}

// 预览图片
const handlePreview = (file) => {
  previewUrls.value = fileList.value.map((item) => item.url)
  previewIndex.value = fileList.value.findIndex((item) => item.url === file.url)
  showViewer.value = true
}

// 视频上传前校验
const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('视频大小不能超过 100MB')
    return false
  }
  return true
}

// 视频上传
const handleVideoUpload = async ({ file }) => {
  try {
    const loading = ElMessage({
      message: '上传中...',
      duration: 0
    })
    const url = await uploadApi.uploadVideo(file, (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      loading.message = `上传中 ${percent}%`
    })
    loading.close()
    form.value.videoUrl = url
    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
  }
}

// 移除视频
const removeVideo = () => {
  form.value.videoUrl = ''
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true
    await communityApi.publish({
      title: form.value.title,
      content: form.value.content,
      images: form.value.images,
      videoUrl: form.value.videoUrl,
      topicIds: form.value.topicIds,
      poiId: form.value.poiId
    })

    ElMessage.success('发布成功，等待审核')
    emit('success')
    handleClose()
  } catch (error) {
    if (error.errors) {
      // 表单校验失败
    } else {
      ElMessage.error(error.message || '发布失败')
    }
  } finally {
    submitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  form.value = {
    title: '',
    content: '',
    images: [],
    videoUrl: '',
    topicIds: [],
    poiId: null
  }
  fileList.value = []
  visible.value = false
}

// 监听对话框打开
watch(visible, (val) => {
  if (val) {
    loadTopics()
    loadPois()
  }
})
</script>

<style lang="scss" scoped>
.upload-area {
  width: 100%;

  .video-upload {
    text-align: center;
    padding: 20px;
    border: 1px dashed #dcdfe6;
    border-radius: 8px;

    .upload-tip {
      margin-top: 12px;
      font-size: 14px;
      color: #999;
    }
  }

  .video-preview {
    text-align: center;

    video {
      border-radius: 8px;
      margin-bottom: 12px;
    }
  }
}

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}
</style>
