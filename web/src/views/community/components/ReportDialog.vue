<template>
  <el-dialog
    v-model="visible"
    title="举报"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="举报类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择举报类型" style="width: 100%">
          <el-option label="色情低俗" value="porn" />
          <el-option label="广告骚扰" value="spam" />
          <el-option label="违法违规" value="illegal" />
          <el-option label="侵权" value="copyright" />
          <el-option label="辱骂诽谤" value="abuse" />
          <el-option label="虚假信息" value="fake" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>

      <el-form-item label="详细说明" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请详细说明举报原因..."
          maxlength="200"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="联系方式" prop="contact">
        <el-input
          v-model="form.contact"
          placeholder="选填，便于我们联系您（手机/邮箱）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        提交举报
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  postId: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  type: '',
  reason: '',
  contact: ''
})

const rules = {
  type: [{ required: true, message: '请选择举报类型', trigger: 'change' }],
  reason: [
    { required: true, message: '请说明举报原因', trigger: 'blur' },
    { min: 10, message: '请至少输入10个字', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true
    await communityApi.report({
      targetType: 'POST',
      targetId: props.postId,
      type: form.type,
      reason: form.reason,
      contact: form.contact
    })

    ElMessage.success('举报成功，我们会尽快处理')
    handleClose()
  } catch (error) {
    if (error.errors) {
      // 表单验证失败
    } else {
      ElMessage.error(error.message || '提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  visible.value = false
}
</script>
