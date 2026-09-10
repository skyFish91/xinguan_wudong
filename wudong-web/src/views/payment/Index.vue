<template>
  <div class="payment-page">
    <div class="page-container" v-if="order">
      <!-- 步骤条 -->
      <el-steps :active="1" align-center class="order-steps">
        <el-step title="填写订单" description="已完成" />
        <el-step title="支付订单" description="待付款" />
        <el-step title="预订成功" description="获取电子票" />
      </el-steps>

      <!-- 已支付/已取消：直接给结果，不再展示支付表单 -->
      <div v-if="order.status !== 'unpaid'" class="result-card">
        <el-result
          :icon="order.status === 'cancelled' ? 'warning' : 'success'"
          :title="order.status === 'cancelled' ? '订单已取消' : '该订单已完成支付'"
          :sub-title="`订单号：${order.orderNo}`"
        >
          <template #extra>
            <el-button type="primary" @click="$router.push(`/order/${order.id}`)">
              查看订单详情
            </el-button>
            <el-button @click="$router.push('/user/orders')">我的订单</el-button>
          </template>
        </el-result>
      </div>

      <template v-else>
        <!-- 倒计时提醒 -->
        <div class="countdown-bar" :class="{ urgent: remainSeconds < 300 }">
          <el-icon><Clock /></el-icon>
          <span v-if="remainSeconds > 0">
            请在 <strong>{{ countdownText }}</strong> 内完成支付，超时订单将自动取消
          </span>
          <span v-else>支付已超时，订单已自动取消</span>
        </div>

        <div class="content-grid">
          <!-- 左侧：支付方式 -->
          <div class="main-col">
            <section class="card">
              <h2 class="card-title">
                <el-icon><Wallet /></el-icon>
                选择支付方式
              </h2>

              <div class="pay-methods">
                <div
                  v-for="method in payMethods"
                  :key="method.value"
                  class="pay-method"
                  :class="{ active: selectedMethod === method.value }"
                  @click="selectMethod(method.value)"
                >
                  <div class="method-icon" :style="{ background: method.color }">
                    {{ method.icon }}
                  </div>
                  <div class="method-info">
                    <div class="method-name">{{ method.name }}</div>
                    <div class="method-desc">{{ method.desc }}</div>
                  </div>
                  <el-icon v-if="selectedMethod === method.value" class="check-icon">
                    <CircleCheckFilled />
                  </el-icon>
                </div>
              </div>
            </section>

            <!-- 支付二维码 -->
            <section class="card" v-if="selectedMethod && remainSeconds > 0">
              <h2 class="card-title">
                <el-icon><Iphone /></el-icon>
                扫码支付
              </h2>

              <div class="qrcode-area">
                <div class="qrcode-box">
                  <!-- 模拟二维码：用 CSS 网格画出码点 -->
                  <div class="fake-qrcode">
                    <div
                      v-for="i in 144"
                      :key="i"
                      class="qr-cell"
                      :class="{ dark: qrPattern[i - 1] }"
                    ></div>
                  </div>
                  <div class="qrcode-logo">
                    {{ currentMethod?.icon }}
                  </div>
                </div>
                <div class="qrcode-tip">
                  <p class="tip-main">
                    请使用<strong>{{ currentMethod?.name }}</strong>扫描上方二维码
                  </p>
                  <p class="tip-sub">支付金额：
                    <span class="tip-amount">¥{{ (order.totalPrice / 100).toFixed(2) }}</span>
                  </p>
                  <el-alert type="info" :closable="false" class="demo-alert">
                    <template #title>
                      演示环境：点击下方「模拟支付成功」按钮完成付款流程
                    </template>
                  </el-alert>
                </div>
              </div>
            </section>
          </div>

          <!-- 右侧：订单摘要 -->
          <div class="side-col">
            <div class="summary-card">
              <h3 class="summary-title">订单信息</h3>

              <div class="product-mini">
                <img :src="order.image" @error="onImageError" />
                <div class="mini-info">
                  <div class="mini-name">{{ order.scenicName }}</div>
                  <div class="mini-spec">{{ order.ticketName }} × {{ order.quantity }}</div>
                </div>
              </div>

              <el-divider />

              <div class="summary-row">
                <span class="label">订单号</span>
                <span class="value mono">{{ order.orderNo }}</span>
              </div>
              <div class="summary-row">
                <span class="label">游玩日期</span>
                <span class="value">{{ order.travelDate }}</span>
              </div>
              <div class="summary-row">
                <span class="label">出行人</span>
                <span class="value">{{ order.travelers[0]?.name }} 等 {{ order.quantity }} 人</span>
              </div>
              <div class="summary-row">
                <span class="label">联系电话</span>
                <span class="value">{{ order.contactPhone }}</span>
              </div>

              <el-divider />

              <div class="summary-total">
                <span class="label">应付金额</span>
                <span class="total-price">¥{{ (order.totalPrice / 100).toFixed(2) }}</span>
              </div>

              <el-button
                type="primary"
                size="large"
                class="pay-btn"
                :loading="paying"
                :disabled="!selectedMethod || remainSeconds <= 0"
                @click="handlePay"
              >
                {{ remainSeconds > 0 ? '模拟支付成功' : '订单已超时' }}
              </el-button>

              <el-button text class="cancel-btn" @click="handleCancel">
                取消订单
              </el-button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 订单不存在 -->
    <div class="page-container" v-else>
      <el-result icon="error" title="订单不存在" sub-title="该订单可能已被删除，或链接有误">
        <template #extra>
          <el-button type="primary" @click="$router.push('/user/orders')">
            返回我的订单
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Wallet,
  Iphone,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import { useOrderStore, type Order } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const { getOrder, payOrder, cancelOrder } = useOrderStore()

const order = ref<Order | undefined>()
const selectedMethod = ref<'wechat' | 'alipay' | 'unionpay' | ''>('')
const paying = ref(false)
const remainSeconds = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const payMethods = [
  {
    value: 'wechat' as const,
    name: '微信支付',
    desc: '推荐使用微信扫码支付',
    icon: '💬',
    color: 'linear-gradient(135deg, #09bb07 0%, #07a006 100%)'
  },
  {
    value: 'alipay' as const,
    name: '支付宝',
    desc: '支持花呗分期付款',
    icon: '🅰️',
    color: 'linear-gradient(135deg, #1677ff 0%, #0e5fd8 100%)'
  },
  {
    value: 'unionpay' as const,
    name: '银联支付',
    desc: '支持各大银行储蓄卡/信用卡',
    icon: '💳',
    color: 'linear-gradient(135deg, #e60012 0%, #c1000f 100%)'
  }
]

const currentMethod = computed(() =>
  payMethods.find(m => m.value === selectedMethod.value)
)

// 生成稳定的伪二维码图案（12×12 网格）
const qrPattern = computed(() => {
  const seed = order.value?.orderNo || 'wudong'
  const pattern: boolean[] = []
  for (let i = 0; i < 144; i++) {
    const row = Math.floor(i / 12)
    const col = i % 12
    // 三个角画定位块，模仿真实二维码
    const inCorner =
      (row < 3 && col < 3) || (row < 3 && col > 8) || (row > 8 && col < 3)
    if (inCorner) {
      const isEdge =
        row === 0 || col === 0 || row === 2 || col === 2 ||
        row === 10 || col === 11 || col === 9 || row === 11
      pattern.push(isEdge || (row === 1 && col === 1) ||
        (row === 1 && col === 10) || (row === 10 && col === 1))
    } else {
      // 用订单号字符做伪随机
      const code = seed.charCodeAt(i % seed.length)
      pattern.push((code * (i + 7)) % 3 === 0)
    }
  }
  return pattern
})

const countdownText = computed(() => {
  const m = Math.floor(remainSeconds.value / 60)
  const s = remainSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"%3E%3Crect fill="%23e5e7eb" width="120" height="90"/%3E%3Ctext x="60" y="55" text-anchor="middle" font-size="30"%3E🏔️%3C/text%3E%3C/svg%3E'
}

function selectMethod(method: 'wechat' | 'alipay' | 'unionpay') {
  selectedMethod.value = method
}

function updateCountdown() {
  if (!order.value) return
  const diff = Math.floor((order.value.payDeadline - Date.now()) / 1000)
  remainSeconds.value = Math.max(0, diff)

  if (remainSeconds.value === 0 && order.value.status === 'unpaid') {
    // 超时自动取消
    cancelOrder(order.value.id)
    order.value = getOrder(order.value.id)
    ElMessage.warning('支付超时，订单已自动取消')
    if (timer) clearInterval(timer)
  }
}

async function handlePay() {
  if (!order.value || !selectedMethod.value) return

  paying.value = true
  try {
    // 模拟支付网关处理
    await new Promise(resolve => setTimeout(resolve, 1200))

    const updated = payOrder(order.value.id, selectedMethod.value)
    order.value = updated

    if (timer) clearInterval(timer)

    ElMessage.success('支付成功！电子票已生成')
    router.push(`/order/${order.value?.id}?from=payment`)
  } finally {
    paying.value = false
  }
}

async function handleCancel() {
  if (!order.value) return

  try {
    await ElMessageBox.confirm(
      '取消后需重新下单，确认取消该订单吗？',
      '取消订单',
      { type: 'warning', confirmButtonText: '确认取消', cancelButtonText: '继续支付' }
    )

    cancelOrder(order.value.id)
    order.value = getOrder(order.value.id)
    if (timer) clearInterval(timer)

    ElMessage.success('订单已取消')
    router.push('/user/orders')
  } catch {
    // 用户选择继续支付
  }
}

onMounted(() => {
  const id = String(route.params.orderId)
  order.value = getOrder(id)

  if (!order.value) return

  if (order.value.status === 'unpaid') {
    selectedMethod.value = 'wechat'
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.payment-page {
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

.result-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.countdown-bar {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: #9a3412;
}

.countdown-bar.urgent {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fecaca;
  color: #991b1b;
  animation: blink 2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}

.countdown-bar strong {
  font-size: 18px;
  font-family: 'Courier New', monospace;
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

.pay-methods {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.pay-method {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s;
}

.pay-method:hover {
  border-color: #c7d2fe;
  background: #fafbff;
}

.pay-method.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(118, 75, 162, 0.06) 100%);
}

.method-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 13px;
  color: #909399;
}

.check-icon {
  font-size: 24px;
  color: #667eea;
}

.qrcode-area {
  display: flex;
  gap: 36px;
  align-items: center;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.qrcode-box {
  position: relative;
  width: 200px;
  height: 200px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.fake-qrcode {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(12, 1fr);
  width: 100%;
  height: 100%;
  gap: 1px;
}

.qr-cell {
  background: transparent;
  border-radius: 1px;
}

.qr-cell.dark {
  background: #1a202c;
}

.qrcode-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.qrcode-tip {
  flex: 1;
}

.tip-main {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 10px;
}

.tip-sub {
  font-size: 15px;
  color: #718096;
  margin-bottom: 16px;
}

.tip-amount {
  font-size: 24px;
  font-weight: 700;
  color: #e53e3e;
}

.demo-alert {
  margin-top: 12px;
}

.side-col {
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

.product-mini {
  display: flex;
  gap: 12px;
  align-items: center;
}

.product-mini img {
  width: 64px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
}

.mini-info {
  flex: 1;
}

.mini-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.mini-spec {
  font-size: 13px;
  color: #718096;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 0;
  font-size: 14px;
  gap: 12px;
}

.summary-row .label {
  color: #718096;
  flex-shrink: 0;
}

.summary-row .value {
  color: #2d3748;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}

.summary-row .value.mono {
  font-family: 'Courier New', monospace;
  font-size: 13px;
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

.pay-btn {
  width: 100%;
  height: 48px;
  font-size: 17px;
  font-weight: 600;
}

.cancel-btn {
  width: 100%;
  margin-top: 10px;
  color: #909399;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
  }

  .qrcode-area {
    flex-direction: column;
    text-align: center;
  }
}
</style>
