<template>
  <el-dialog
    v-model="visible"
    title="发表评价"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <!-- 评价对象 -->
      <div class="review-target">
        <img :src="targetImage" @error="onImageError" />
        <div class="target-info">
          <h4>{{ targetName }}</h4>
          <p v-if="orderNo">订单号：{{ orderNo }}</p>
        </div>
      </div>

      <el-divider />

      <!-- 评分 -->
      <el-form-item label="综合评分" prop="rating" required>
        <el-rate
          v-model="form.rating"
          :texts="ratingTexts"
          show-text
          size="large"
        />
      </el-form-item>

      <!-- 评价内容 -->
      <el-form-item label="评价内容" prop="content" required>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="5"
          placeholder="分享你的真实体验，帮助更多人做出选择"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 评价标签 -->
      <el-form-item label="评价标签">
        <div class="tag-selector">
          <el-tag
            v-for="tag in availableTags"
            :key="tag"
            :type="form.tags.includes(tag) ? 'primary' : 'info'"
            :effect="form.tags.includes(tag) ? 'dark' : 'plain'"
            @click="toggleTag(tag)"
            class="tag-item"
          >
            {{ tag }}
          </el-tag>
        </div>
      </el-form-item>

      <!-- 上传图片 -->
      <el-form-item label="上传图片">
        <div class="upload-area">
          <div v-for="(img, idx) in form.images" :key="idx" class="image-item">
            <img :src="img" />
            <div class="image-mask" @click="removeImage(idx)">
              <el-icon><Delete /></el-icon>
            </div>
          </div>
          <div
            v-if="form.images.length < 9"
            class="upload-trigger"
            @click="handleUpload"
          >
            <el-icon><Plus /></el-icon>
            <p>上传图片</p>
            <p class="hint">最多9张</p>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          style="display: none"
          @change="handleFileChange"
        />
      </el-form-item>

      <el-alert type="info" :closable="false" style="margin-bottom: 20px">
        <template #title>
          评价一经发布不可修改，请认真填写。平台将对不实评价进行审核处理。
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        发布评价
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useReviewStore } from '@/stores/review'
import { useUserStore } from '@/stores/user'

interface Props {
  modelValue: boolean
  targetType: 'scenic' | 'route'
  targetId: number
  targetName: string
  targetImage: string
  orderId?: string
  orderNo?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'success'])

const reviewStore = useReviewStore()
const userStore = useUserStore()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref()
const fileInputRef = ref<HTMLInputElement>()

const form = reactive({
  rating: 5,
  content: '',
  tags: [] as string[],
  images: [] as string[]
})

const rules = {
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  content: [
    { required: true, message: '请填写评价内容', trigger: 'blur' },
    { min: 10, message: '评价内容至少10个字', trigger: 'blur' }
  ]
}

const ratingTexts = ['非常差', '比较差', '一般', '比较好', '非常好']

const availableTags = [
  '景色优美',
  '值得推荐',
  '交通便利',
  '服务周到',
  '性价比高',
  '适合拍照',
  '适合亲子',
  '人少清净',
  '设施完善',
  '文化底蕴'
]

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) {
      resetForm()
    }
  }
)

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function resetForm() {
  form.rating = 5
  form.content = ''
  form.tags = []
  form.images = []
  formRef.value?.clearValidate()
}

function toggleTag(tag: string) {
  const index = form.tags.indexOf(tag)
  if (index > -1) {
    form.tags.splice(index, 1)
  } else {
    if (form.tags.length < 5) {
      form.tags.push(tag)
    } else {
      ElMessage.warning('最多选择5个标签')
    }
  }
}

function handleUpload() {
  fileInputRef.value?.click()
}

function handleFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files || files.length === 0) return

  const remaining = 9 - form.images.length
  if (files.length > remaining) {
    ElMessage.warning(`最多还能上传 ${remaining} 张图片`)
  }

  // 模拟上传：转 base64（实际项目应上传到服务器）
  Array.from(files)
    .slice(0, remaining)
    .forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.warning(`${file.name} 超过 5MB，已跳过`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        form.images.push(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    })

  // 清空 input，允许重复选择同一文件
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"%3E%3Crect fill="%23e5e7eb" width="120" height="90"/%3E%3Ctext x="60" y="55" text-anchor="middle" font-size="30"%3E🏔️%3C/text%3E%3C/svg%3E'
}

async function handleSubmit() {
  try {
    await formRef.value.validate()
  } catch {
    return
  }

  if (!userStore.userInfo) {
    ElMessage.warning('请先登录')
    return
  }

  submitting.value = true

  try {
    // 模拟提交延迟
    await new Promise((resolve) => setTimeout(resolve, 800))

    reviewStore.addReview({
      targetType: props.targetType,
      targetId: props.targetId,
      targetName: props.targetName,
      targetImage: props.targetImage,
      orderId: props.orderId,
      orderNo: props.orderNo,
      rating: form.rating,
      content: form.content,
      images: form.images,
      tags: form.tags,
      userId: userStore.userInfo.id,
      username: userStore.userInfo.username,
      userAvatar: userStore.userInfo.avatar
    })

    ElMessage.success('评价发布成功！')
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

function handleClose() {
  if (form.content || form.images.length > 0) {
    // 有内容时提示
    ElMessage.info('评价内容未保存')
  }
}
</script>

<style scoped>
.review-target {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
}

.review-target img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.target-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
}

.target-info p {
  font-size: 13px;
  color: #718096;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  transform: translateY(-2px);
}

.upload-area {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  gap: 12px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  color: white;
  font-size: 24px;
}

.image-item:hover .image-mask {
  opacity: 1;
}

.upload-trigger {
  width: 100px;
  height: 100px;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #9ca3af;
}

.upload-trigger:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f7fafc;
}

.upload-trigger .el-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.upload-trigger p {
  font-size: 13px;
  margin: 0;
}

.upload-trigger .hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
