<template>
  <div class="merchant-scenics">
    <div class="page-header">
      <h1 class="page-title">景区管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加景区
      </el-button>
    </div>

    <div class="scenic-list">
      <el-table :data="scenicList" v-loading="loading">
        <el-table-column prop="name" label="景区名称" width="200" />
        <el-table-column prop="address" label="地址" width="250" />
        <el-table-column label="开放时间" width="150">
          <template #default="{ row }">
            {{ row.open_time }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '营业中' : '已关闭' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="250">
          <template #default="{ row }">
            <el-button type="primary" size="small" text @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="success" size="small" text @click="$router.push('/merchant/tickets?scenic_id=' + row.id)">
              票种管理
            </el-button>
            <el-button type="danger" size="small" text @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingScenic ? '编辑景区' : '添加景区'"
      width="600px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="景区名称">
          <el-input v-model="form.name" placeholder="请输入景区名称" />
        </el-form-item>
        <el-form-item label="地址">
          <el-input v-model="form.address" placeholder="请输入景区地址" />
        </el-form-item>
        <el-form-item label="开放时间">
          <el-input v-model="form.open_time" placeholder="例如：08:00-18:00" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input
            v-model="form.intro"
            type="textarea"
            :rows="4"
            placeholder="请输入景区简介"
          />
        </el-form-item>
        <el-form-item label="主图">
          <el-input v-model="form.main_image" placeholder="图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const showAddDialog = ref(false)
const editingScenic = ref<any>(null)

const scenicList = ref([
  {
    id: 1,
    name: '西江千户苗寨',
    address: '贵州省黔东南州雷山县西江镇',
    open_time: '08:00-22:00',
    intro: '世界最大苗族聚居村寨',
    main_image: '/images/travel/1.jpg',
    status: 1
  }
])

const form = ref({
  name: '',
  address: '',
  open_time: '',
  intro: '',
  main_image: ''
})

function handleEdit(row: any) {
  editingScenic.value = row
  form.value = { ...row }
  showAddDialog.value = true
}

async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm('确认删除该景区吗？', '提示', {
      type: 'warning'
    })
    ElMessage.success('删除成功')
    // TODO: 调用删除接口
  } catch {}
}

function handleSave() {
  ElMessage.success('保存成功')
  showAddDialog.value = false
  // TODO: 调用保存接口
}

onMounted(() => {
  // TODO: 加载景区列表
})
</script>

<style scoped>
.merchant-scenics {
  max-width: 1600px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
}

.scenic-list {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
</style>
