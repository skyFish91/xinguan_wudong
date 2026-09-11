<template>
  <el-dialog
    v-model="visible"
    title="发布游记"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <!-- 标题 -->
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="form.title"
          placeholder="给你的游记起个标题吧"
          maxlength="100"
          show-word-limit
        />
      </el-form-item>

      <!-- 内容 -->
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          placeholder="分享你的旅行故事..."
          maxlength="5000"
          show-word-limit
        />
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="图片">
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <div
            v-for="(img, index) in form.images"
            :key="index"
            style="position: relative; width: 120px; height: 120px; border: 1px solid #dcdfe6; border-radius: 4px; overflow: hidden;"
          >
            <img :src="img" style="width: 100%; height: 100%; object-fit: cover;" />
            <div
              style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; cursor: pointer;"
              @click="removeImage(index)"
            >
              <el-icon><Close /></el-icon>
            </div>
          </div>

          <!-- 上传按钮 -->
          <el-upload
            v-if="form.images.length < 9"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="handleImageChange"
          >
            <div style="width: 120px; height: 120px; border: 1px dashed #dcdfe6; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fafafa;">
              <el-icon size="24" color="#999"><Plus /></el-icon>
              <span style="font-size: 12px; color: #999; margin-top: 5px;">上传图片</span>
            </div>
          </el-upload>
        </div>
        <div style="color: #999; font-size: 12px; margin-top: 8px;">
          最多上传9张图片，支持 JPG、PNG 格式
        </div>
      </el-form-item>

      <!-- 话题选择 -->
      <el-form-item label="话题">
        <el-select
          v-model="form.topicIds"
          multiple
          placeholder="选择相关话题（可选）"
          style="width: 100%;"
        >
          <el-option
            v-for="topic in topics"
            :key="topic.id"
            :label="topic.name"
            :value="topic.id"
          />
        </el-select>
      </el-form-item>

      <!-- 位置（可选） -->
      <el-form-item label="位置">
        <el-input
          v-model="form.location"
          placeholder="你在哪里？（可选）"
          clearable
        >
          <template #prefix>
            <el-icon><Location /></el-icon>
          </template>
        </el-input>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="publishing" @click="handlePublish">
        发布
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Close, Location } from '@element-plus/icons-vue'
import { communityApi, uploadApi } from '@/api/community'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const publishing = ref(false)
const topics = ref([])

const form = reactive({
  title: '',
  content: '',
  images: [],
  topicIds: [],
  location: ''
})

const rules = {
  title: [
    { required: true, message: '请输入标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在 2-100 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入内容', trigger: 'blur' },
    { min: 10, max: 5000, message: '内容长度在 10-5000 个字符', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    loadTopics()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

// 加载话题列表
const loadTopics = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const data = await communityApi.getTopics()
    topics.value = data.list || []
  } catch (err) {
    console.error('加载话题失败:', err)
  }
}

// 处理图片选择 - 上传到服务端，取回可访问地址
const handleImageChange = async (file) => {
  if (form.images.length >= 9) {
    ElMessage.warning('最多只能上传9张图片')
    return
  }

  // 检查文件大小（限制5MB，与后端一致）
  if (file.raw.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB')
    return
  }

  try {
    const url = await uploadApi.uploadImage(file.raw)
    if (!url) {
      throw new Error('上传未返回地址')
    }
    form.images.push(url)
    ElMessage.success('图片已添加')
  } catch (err) {
    ElMessage.error(err.message || '图片上传失败')
  }
}

// 删除图片
const removeImage = (index) => {
  form.images.splice(index, 1)
}

// 发布游记
const handlePublish = async () => {
  try {
    await formRef.value.validate()

    // 检查是否至少有图片
    if (form.images.length === 0) {
      ElMessage.warning('请至少添加一张图片')
      return
    }

    publishing.value = true

    await communityApi.publish({
      title: form.title,
      content: form.content,
      images: form.images,
      topicIds: form.topicIds.length > 0 ? form.topicIds : [],
      linkedName: form.location || '',
    })

    ElMessage.success('发布成功！')
    emit('success')
    handleClose()
    resetForm()
  } catch (err) {
    if (!err.errors) {
      ElMessage.error(err.message || '发布失败')
    }
  } finally {
    publishing.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.title = ''
  form.content = ''
  form.images = []
  form.topicIds = []
  form.location = ''
  formRef.value?.resetFields()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}
</script>

