<template>
  <div class="order-create-page">
    <div class="page-container">
      <!-- 步骤条 -->
      <el-steps :active="0" align-center class="order-steps">
        <el-step title="填写订单" description="确认信息" />
        <el-step title="支付订单" description="完成付款" />
        <el-step title="预订成功" description="获取电子票" />
      </el-steps>

      <div class="content-grid">
        <!-- 左侧：订单信息填写 -->
        <div class="main-col">
          <!-- 商品信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><Tickets /></el-icon>
              预订商品
            </h2>
            <div class="product-row">
              <img :src="booking.image" class="product-image" @error="onImageError" />
              <div class="product-info">
                <h3>{{ booking.scenicName }}</h3>
                <p class="product-spec">{{ booking.ticketName }}</p>
                <p class="product-date">
                  <el-icon><Calendar /></el-icon>
                  游玩日期：{{ booking.travelDate }}
                </p>
              </div>
              <div class="product-price">
                <div class="unit-price">¥{{ (booking.unitPrice / 100).toFixed(2) }}</div>
                <div class="quantity">× {{ booking.quantity }}</div>
              </div>
            </div>
          </section>

          <!-- 游客信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><User /></el-icon>
              出行人信息
              <span class="title-hint">（共 {{ booking.quantity }} 人）</span>
            </h2>

            <el-form ref="travelerFormRef" :model="travelerForm" label-position="top">
              <div
                v-for="(traveler, idx) in travelerForm.travelers"
                :key="idx"
                class="traveler-block"
              >
                <div class="traveler-head">
                  <span class="traveler-label">出行人 {{ idx + 1 }}</span>
                  <el-button
                    v-if="idx === 0"
                    text
                    size="small"
                    type="primary"
                    @click="fillWithSelf(idx)"
                  >
                    使用我的信息
                  </el-button>
                </div>
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item
                      label="姓名"
                      :prop="`travelers.${idx}.name`"
                      :rules="rules.name"
                    >
                      <el-input v-model="traveler.name" placeholder="请填写真实姓名" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                    <el-form-item
                      label="身份证号"
                      :prop="`travelers.${idx}.idCard`"
                      :rules="rules.idCard"
                    >
                      <el-input v-model="traveler.idCard" placeholder="用于入园核验" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item
                      label="手机号"
                      :prop="`travelers.${idx}.phone`"
                      :rules="idx === 0 ? rules.phone : []"
                    >
                      <el-input v-model="traveler.phone" placeholder="选填" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-form>

            <el-alert type="info" :closable="false" class="tip-alert">
              <template #title>
                <span>请确保信息与证件一致，入园需凭身份证核验，信息不符可能无法入园</span>
              </template>
            </el-alert>
          </section>

          <!-- 联系人信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><Phone /></el-icon>
              联系人信息
            </h2>
            <el-form ref="contactFormRef" :model="contactForm" label-width="90px">
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="联系人" prop="contactName" :rules="rules.name">
                    <el-input v-model="contactForm.contactName" placeholder="接收通知的姓名" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号" prop="contactPhone" :rules="rules.phone">
                    <el-input v-model="contactForm.contactPhone" placeholder="接收电子票短信" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="备注">
                <el-input
                  v-model="contactForm.remark"
                  type="textarea"
                  :rows="2"
                  maxlength="200"
                  show-word-limit
                  placeholder="有特殊需求可在此说明（选填）"
                />
              </el-form-item>
            </el-form>
          </section>

          <!-- 预订须知 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><WarningFilled /></el-icon>
              预订须知
            </h2>
            <ul class="notice-list">
              <li>下单后请在 30 分钟内完成支付，超时订单将自动取消</li>
              <li>未使用的门票可在游玩日期前 1 天申请退款，退款为订单金额的 90%</li>
              <li>已使用或已过期的门票不支持退款</li>
              <li>请携带身份证原件前往景区，凭电子票核销码入园</li>
              <li>如遇不可抗力（天气、疫情等）导致无法出行，可申请全额退款</li>
            </ul>
          </section>
        </div>

        <!-- 右侧：费用明细 + 提交 -->
        <div class="side-col">
          <div class="summary-card">
            <h3 class="summary-title">费用明细</h3>

            <div class="summary-row">
              <span class="label">{{ booking.ticketName }}</span>
              <span class="value">
                ¥{{ (booking.unitPrice / 100).toFixed(2) }} × {{ booking.quantity }}
              </span>
            </div>
            <div class="summary-row">
              <span class="label">服务费</span>
              <span class="value free">免费</span>
            </div>

            <el-divider />

            <div class="summary-total">
              <span class="label">应付金额</span>
              <span class="total-price">¥{{ (totalPrice / 100).toFixed(2) }}</span>
            </div>

            <el-checkbox v-model="agreed" class="agree-check">
              我已阅读并同意
              <a href="#" @click.prevent="showAgreement">《预订协议》</a>
            </el-checkbox>

            <el-button
              type="primary"
              size="large"
              class="submit-btn"
              :loading="submitting"
              @click="handleSubmit"
            >
              提交订单
            </el-button>

            <el-button text class="back-btn" @click="$router.back()">
              返回修改
            </el-button>
          </div>

          <div class="guarantee-card">
            <div class="guarantee-item">
              <el-icon><CircleCheck /></el-icon>
              <span>官方直营，正品保证</span>
            </div>
            <div class="guarantee-item">
              <el-icon><CircleCheck /></el-icon>
              <span>支付安全，信息加密</span>
            </div>
            <div class="guarantee-item">
              <el-icon><CircleCheck /></el-icon>
              <span>未使用可退，灵活改期</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Tickets,
  Calendar,
  User,
  Phone,
  WarningFilled,
  CircleCheck
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { createOrder } = useOrderStore()

const submitting = ref(false)
const agreed = ref(false)
const travelerFormRef = ref()
const contactFormRef = ref()

// 从路由 query 读取下单参数
const booking = reactive({
  targetType: (route.query.type as 'ticket' | 'route') || 'ticket',
  targetId: Number(route.query.targetId) || 0,
  scenicId: Number(route.query.scenicId) || undefined,
  scenicName: (route.query.scenicName as string) || '未知景区',
  ticketName: (route.query.ticketName as string) || '标准票',
  image: (route.query.image as string) || '/images/travel/1.jpg',
  unitPrice: Number(route.query.unitPrice) || 0,
  quantity: Number(route.query.quantity) || 1,
  travelDate: (route.query.travelDate as string) || ''
})

const totalPrice = computed(() => booking.unitPrice * booking.quantity)

const travelerForm = reactive({
  travelers: Array.from({ length: booking.quantity }, () => ({
    name: '',
    idCard: '',
    phone: ''
  }))
})

const contactForm = reactive({
  contactName: '',
  contactPhone: '',
  remark: ''
})

const rules = {
  name: [
    { required: true, message: '请填写姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度为 2-20 个字符', trigger: 'blur' }
  ],
  idCard: [
    { required: true, message: '请填写身份证号', trigger: 'blur' },
    {
      pattern: /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/,
      message: '身份证号格式不正确',
      trigger: 'blur'
    }
  ],
  phone: [
    { required: true, message: '请填写手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="100" y="80" text-anchor="middle" font-size="40"%3E🏔️%3C/text%3E%3C/svg%3E'
}

function fillWithSelf(idx: number) {
  const info = userStore.userInfo
  if (!info) {
    ElMessage.warning('请先登录后再使用此功能')
    return
  }
  travelerForm.travelers[idx].name = info.username || ''
  travelerForm.travelers[idx].phone = info.phone || ''
  ElMessage.success('已填入账号信息，请补全身份证号')
}

function showAgreement() {
  ElMessageBox.alert(
    '1. 本平台仅提供门票预订服务，实际游览服务由景区提供。\n' +
      '2. 请如实填写出行人信息，因信息错误导致无法入园的损失由用户承担。\n' +
      '3. 退改规则详见「预订须知」。\n' +
      '4. 用户个人信息仅用于订票核验，平台不会向第三方泄露。',
    '预订协议',
    { confirmButtonText: '我已了解' }
  )
}

async function handleSubmit() {
  if (!agreed.value) {
    ElMessage.warning('请先阅读并同意预订协议')
    return
  }

  if (!booking.travelDate) {
    ElMessage.warning('缺少游玩日期，请返回重新选择')
    return
  }

  try {
    await travelerFormRef.value.validate()
    await contactFormRef.value.validate()
  } catch {
    ElMessage.warning('请完整填写出行人和联系人信息')
    return
  }

  submitting.value = true

  try {
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 600))

    const order = createOrder({
      targetType: booking.targetType,
      targetId: booking.targetId,
      scenicId: booking.scenicId,
      scenicName: booking.scenicName,
      ticketName: booking.ticketName,
      image: booking.image,
      unitPrice: booking.unitPrice,
      quantity: booking.quantity,
      travelDate: booking.travelDate,
      travelers: travelerForm.travelers.map(t => ({ ...t })),
      contactName: contactForm.contactName,
      contactPhone: contactForm.contactPhone,
      remark: contactForm.remark
    })

    ElMessage.success('订单创建成功，请在 30 分钟内完成支付')
    router.push(`/payment/${order.id}`)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 校验必要参数
  if (!booking.targetId || !booking.unitPrice) {
    ElMessage.error('下单信息不完整，请重新选择商品')
    setTimeout(() => router.push('/scenic'), 1200)
    return
  }

  // 预填联系人为当前登录用户
  if (userStore.userInfo) {
    contactForm.contactName = userStore.userInfo.username || ''
    contactForm.contactPhone = userStore.userInfo.phone || ''
  }
})
</script>

<style scoped>
.order-create-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px 60px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.order-steps {
  background: white;
  padding: 30px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  align-items: start;
}

.main-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-hint {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
}

.product-row {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
}

.product-image {
  width: 120px;
  height: 90px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.product-spec {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
}

.product-date {
  font-size: 14px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-price {
  text-align: right;
}

.unit-price {
  font-size: 22px;
  font-weight: 700;
  color: #e53e3e;
}

.quantity {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.traveler-block {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 16px;
}

.traveler-block:last-of-type {
  margin-bottom: 0;
}

.traveler-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.traveler-label {
  font-size: 15px;
  font-weight: 600;
  color: #4a5568;
}

.tip-alert {
  margin-top: 16px;
}

.notice-list {
  list-style: none;
  padding: 0;
}

.notice-list li {
  position: relative;
  padding: 10px 0 10px 22px;
  font-size: 14px;
  line-height: 1.7;
  color: #4a5568;
  border-bottom: 1px dashed #edf2f7;
}

.notice-list li:last-child {
  border-bottom: none;
}

.notice-list li::before {
  content: '•';
  position: absolute;
  left: 6px;
  color: #667eea;
  font-weight: bold;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 90px;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.summary-title {
  font-size: 17px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 18px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;
}

.summary-row .label {
  color: #718096;
}

.summary-row .value {
  color: #2d3748;
  font-weight: 500;
}

.summary-row .value.free {
  color: #10b981;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 18px;
}

.summary-total .label {
  font-size: 15px;
  color: #4a5568;
  font-weight: 600;
}

.total-price {
  font-size: 30px;
  font-weight: 800;
  color: #e53e3e;
}

.agree-check {
  margin-bottom: 16px;
}

.agree-check a {
  color: #667eea;
  text-decoration: none;
}

.agree-check a:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 600;
}

.back-btn {
  width: 100%;
  margin-top: 10px;
}

.guarantee-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guarantee-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4a5568;
}

.guarantee-item .el-icon {
  color: #10b981;
  font-size: 16px;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
  }
}
</style>
