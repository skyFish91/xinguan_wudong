<template>
  <div class="merchant-tickets">
    <div class="page-header">
      <h1 class="page-title">票种管理</h1>
      <el-button type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加票种
      </el-button>
    </div>

    <!-- 景区筛选 -->
    <div class="filter-bar">
      <el-select v-model="selectedScenic" placeholder="选择景区" @change="handleScenicChange">
        <el-option label="全部景区" :value="0" />
        <el-option
          v-for="scenic in scenicList"
          :key="scenic.id"
          :label="scenic.name"
          :value="scenic.id"
        />
      </el-select>
    </div>

    <!-- 票种列表 -->
    <div class="ticket-list">
      <el-row :gutter="20">
        <el-col
          v-for="ticket in ticketList"
          :key="ticket.id"
          :span="8"
        >
          <el-card class="ticket-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="ticket-name">{{ ticket.name }}</span>
                <el-tag :type="ticket.status === 1 ? 'success' : 'danger'" size="small">
                  {{ ticket.status === 1 ? '在售' : '停售' }}
                </el-tag>
              </div>
            </template>

            <div class="ticket-info">
              <div class="info-row">
                <span class="label">市场价：</span>
                <span class="value market-price">¥{{ (ticket.market_price / 100).toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <span class="label">销售价：</span>
                <span class="value sale-price">¥{{ (ticket.price / 100).toFixed(2) }}</span>
              </div>
              <div class="info-row">
                <span class="label">当日库存：</span>
                <span class="value" :class="{ 'low-stock': ticket.stock < 50 }">
                  {{ ticket.stock }} 张
                </span>
              </div>
              <div class="info-row">
                <span class="label">今日已售：</span>
                <span class="value sold">{{ ticket.sold || 0 }} 张</span>
              </div>
              <div class="info-row">
                <span class="label">有效期：</span>
                <span class="value small">{{ ticket.valid_rule }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button size="small" @click="handleStock(ticket)">
                <el-icon><Setting /></el-icon>
                设置库存
              </el-button>
              <el-button type="primary" size="small" text @click="handleEdit(ticket)">
                编辑
              </el-button>
              <el-button
                :type="ticket.status === 1 ? 'danger' : 'success'"
                size="small"
                text
                @click="handleToggleStatus(ticket)"
              >
                {{ ticket.status === 1 ? '停售' : '上架' }}
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="ticketList.length === 0" description="暂无票种数据" />
    </div>

    <!-- 添加/编辑票种对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingTicket ? '编辑票种' : '添加票种'"
      width="600px"
    >
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="所属景区" prop="scenic_id">
          <el-select v-model="form.scenic_id" placeholder="请选择景区">
            <el-option
              v-for="scenic in scenicList"
              :key="scenic.id"
              :label="scenic.name"
              :value="scenic.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="票种名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：成人票、学生票" />
        </el-form-item>
        <el-form-item label="市场价" prop="market_price">
          <el-input-number
            v-model="form.market_price"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="市场价"
          />
          <span style="margin-left: 10px; color: #909399">元</span>
        </el-form-item>
        <el-form-item label="销售价" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :step="0.01"
            :precision="2"
            placeholder="销售价"
          />
          <span style="margin-left: 10px; color: #909399">元</span>
        </el-form-item>
        <el-form-item label="有效期规则" prop="valid_rule">
          <el-input v-model="form.valid_rule" placeholder="例如：当日有效" />
        </el-form-item>
        <el-form-item label="是否需身份证">
          <el-switch v-model="form.need_id_card" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveTicket" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>

    <!-- 设置库存对话框 -->
    <el-dialog v-model="showStockDialog" title="设置库存" width="500px">
      <el-form label-width="100px">
        <el-form-item label="票种名称">
          <span>{{ stockForm.name }}</span>
        </el-form-item>
        <el-form-item label="选择日期">
          <el-date-picker
            v-model="stockForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :disabled-date="disabledDate"
          />
        </el-form-item>
        <el-form-item label="每日库存">
          <el-input-number
            v-model="stockForm.dailyStock"
            :min="0"
            :max="99999"
            placeholder="设置每日库存数量"
          />
          <span style="margin-left: 10px; color: #909399">张</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showStockDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveStock" :loading="saving">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Setting } from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const showStockDialog = ref(false)
const editingTicket = ref<any>(null)
const formRef = ref()

const selectedScenic = ref(0)

const scenicList = ref([
  {
    id: 1,
    name: '西江千户苗寨'
  }
])

const ticketList = ref([
  {
    id: 1,
    scenic_id: 1,
    name: '成人票',
    market_price: 11000,
    price: 9000,
    valid_rule: '当日有效',
    need_id_card: true,
    status: 1,
    stock: 500,
    sold: 86
  },
  {
    id: 2,
    scenic_id: 1,
    name: '学生票',
    market_price: 5500,
    price: 4500,
    valid_rule: '当日有效，需学生证',
    need_id_card: true,
    status: 1,
    stock: 300,
    sold: 42
  },
  {
    id: 3,
    scenic_id: 1,
    name: '儿童票',
    market_price: 5500,
    price: 4500,
    valid_rule: '当日有效，1.2-1.5米儿童',
    need_id_card: false,
    status: 1,
    stock: 200,
    sold: 28
  }
])

const form = ref({
  scenic_id: null,
  name: '',
  market_price: 0,
  price: 0,
  valid_rule: '',
  need_id_card: false
})

const stockForm = ref({
  ticket_id: null,
  name: '',
  dateRange: [],
  dailyStock: 0
})

const rules = {
  scenic_id: [{ required: true, message: '请选择景区', trigger: 'change' }],
  name: [{ required: true, message: '请输入票种名称', trigger: 'blur' }],
  market_price: [{ required: true, message: '请输入市场价', trigger: 'blur' }],
  price: [{ required: true, message: '请输入销售价', trigger: 'blur' }],
  valid_rule: [{ required: true, message: '请输入有效期规则', trigger: 'blur' }]
}

function handleScenicChange() {
  // TODO: 根据景区筛选票种
  ElMessage.info('筛选功能开发中')
}

function handleEdit(ticket: any) {
  editingTicket.value = ticket
  form.value = {
    scenic_id: ticket.scenic_id,
    name: ticket.name,
    market_price: ticket.market_price / 100,
    price: ticket.price / 100,
    valid_rule: ticket.valid_rule,
    need_id_card: ticket.need_id_card
  }
  showAddDialog.value = true
}

function handleStock(ticket: any) {
  stockForm.value = {
    ticket_id: ticket.id,
    name: ticket.name,
    dateRange: [],
    dailyStock: ticket.stock
  }
  showStockDialog.value = true
}

async function handleToggleStatus(ticket: any) {
  try {
    const action = ticket.status === 1 ? '停售' : '上架'
    await ElMessageBox.confirm(`确认${action}该票种吗？`, '提示', {
      type: 'warning'
    })
    ticket.status = ticket.status === 1 ? 0 : 1
    ElMessage.success(`${action}成功`)
    // TODO: 调用后端接口
  } catch {}
}

async function handleSaveTicket() {
  try {
    await formRef.value.validate()
    saving.value = true

    // TODO: 调用后端接口保存
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('保存成功')
    showAddDialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function handleSaveStock() {
  if (!stockForm.value.dateRange || stockForm.value.dateRange.length === 0) {
    ElMessage.warning('请选择日期范围')
    return
  }

  saving.value = true
  try {
    // TODO: 调用后端接口设置库存
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('库存设置成功')
    showStockDialog.value = false
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

function disabledDate(date: Date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

onMounted(() => {
  // TODO: 加载景区列表和票种列表
})
</script>

<style scoped>
.merchant-tickets {
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

.filter-bar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.ticket-list {
  min-height: 400px;
}

.ticket-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.ticket-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-name {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.ticket-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  color: #718096;
}

.value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.market-price {
  text-decoration: line-through;
  color: #a0aec0;
}

.sale-price {
  color: #f59e0b;
  font-size: 20px;
}

.low-stock {
  color: #ef4444;
}

.sold {
  color: #10b981;
}

.small {
  font-size: 13px;
  font-weight: normal;
}

.card-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}
</style>
