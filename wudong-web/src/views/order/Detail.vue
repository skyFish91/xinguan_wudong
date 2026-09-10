<template>
  <div class="order-detail-page">
    <div class="page-container" v-if="order">
      <!-- 支付成功横幅 -->
      <div v-if="justPaid" class="success-banner">
        <div class="success-icon">
          <el-icon><CircleCheckFilled /></el-icon>
        </div>
        <div class="success-text">
          <h2>预订成功！</h2>
          <p>电子票已生成，请凭下方核销码入园</p>
        </div>
      </div>

      <!-- 步骤条 -->
      <el-steps
        v-if="order.status !== 'cancelled'"
        :active="stepActive"
        align-center
        class="order-steps"
        finish-status="success"
      >
        <el-step title="提交订单" :description="order.createdAt" />
        <el-step title="支付完成" :description="order.paidAt || '待支付'" />
        <el-step title="出行使用" :description="order.usedAt || '待使用'" />
      </el-steps>

      <div class="content-grid">
        <div class="main-col">
          <!-- 电子票（已支付才显示） -->
          <section v-if="order.status === 'paid' || order.status === 'used'" class="ticket-card">
            <div class="ticket-top">
              <div class="ticket-brand">
                <span class="brand-icon">🏔️</span>
                <span class="brand-name">乌东文旅 · 电子票</span>
              </div>
              <el-tag
                :type="order.status === 'used' ? 'info' : 'success'"
                effect="dark"
                size="large"
              >
                {{ order.status === 'used' ? '已核销' : '待使用' }}
              </el-tag>
            </div>

            <div class="ticket-body">
              <div class="ticket-left">
                <h3 class="ticket-scenic">{{ order.scenicName }}</h3>
                <p class="ticket-type">{{ order.ticketName }} × {{ order.quantity }}</p>

                <div class="ticket-fields">
                  <div class="field">
                    <span class="field-label">游玩日期</span>
                    <span class="field-value">{{ order.travelDate }}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">出行人</span>
                    <span class="field-value">
                      {{ order.travelers.map(t => t.name).join('、') }}
                    </span>
                  </div>
                </div>

                <div class="verify-code-box">
                  <div class="code-label">核销码</div>
                  <div class="code-value">{{ order.verifyCode }}</div>
                  <el-button text type="primary" size="small" @click="copyCode">
                    <el-icon><CopyDocument /></el-icon>
                    复制
                  </el-button>
                </div>
              </div>

              <div class="ticket-divider">
                <span class="notch top"></span>
                <span class="dashed"></span>
                <span class="notch bottom"></span>
              </div>

              <div class="ticket-right">
                <div class="qrcode-wrap" :class="{ used: order.status === 'used' }">
                  <div class="fake-qrcode">
                    <div
                      v-for="i in 144"
                      :key="i"
                      class="qr-cell"
                      :class="{ dark: qrPattern[i - 1] }"
                    ></div>
                  </div>
                  <div v-if="order.status === 'used'" class="used-stamp">已使用</div>
                </div>
                <p class="qrcode-hint">入园时出示此二维码</p>
              </div>
            </div>

            <div class="ticket-footer">
              <el-icon><InfoFilled /></el-icon>
              <span>请携带身份证原件，与出行人信息一致方可入园</span>
            </div>
          </section>

          <!-- 待支付提醒 -->
          <section v-if="order.status === 'unpaid'" class="card unpaid-card">
            <el-result
              icon="warning"
              title="订单待支付"
              :sub-title="remainSeconds > 0
                ? `请在 ${countdownText} 内完成支付，超时将自动取消`
                : '支付已超时'"
            >
              <template #extra>
                <el-button
                  type="primary"
                  size="large"
                  :disabled="remainSeconds <= 0"
                  @click="$router.push(`/payment/${order.id}`)"
                >
                  {{ remainSeconds > 0 ? '立即支付' : '订单已超时' }}
                </el-button>
              </template>
            </el-result>
          </section>

          <!-- 已取消 -->
          <section v-if="order.status === 'cancelled'" class="card">
            <el-result
              icon="info"
              title="订单已取消"
              :sub-title="`取消时间：${order.cancelledAt || '-'}`"
            >
              <template #extra>
                <el-button type="primary" @click="rebook">重新预订</el-button>
              </template>
            </el-result>
          </section>

          <!-- 退款中 -->
          <section v-if="order.status === 'refunding'" class="card">
            <el-result
              icon="info"
              title="退款处理中"
              sub-title="预计 1-3 个工作日退回原支付账户，请耐心等待"
            />
          </section>

          <!-- 商品信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><Tickets /></el-icon>
              商品信息
            </h2>
            <div class="product-row">
              <img :src="order.image" class="product-image" @error="onImageError" />
              <div class="product-info">
                <h3>{{ order.scenicName }}</h3>
                <p class="product-spec">{{ order.ticketName }}</p>
                <p class="product-date">
                  <el-icon><Calendar /></el-icon>
                  {{ order.travelDate }}
                </p>
              </div>
              <div class="product-price">
                <div class="unit">¥{{ (order.unitPrice / 100).toFixed(2) }}</div>
                <div class="qty">× {{ order.quantity }}</div>
              </div>
            </div>
          </section>

          <!-- 出行人信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><User /></el-icon>
              出行人信息
            </h2>
            <el-table :data="order.travelers" size="default">
              <el-table-column type="index" label="#" width="60" />
              <el-table-column prop="name" label="姓名" width="140" />
              <el-table-column label="身份证号">
                <template #default="{ row }">
                  {{ maskIdCard(row.idCard) }}
                </template>
              </el-table-column>
              <el-table-column label="手机号" width="160">
                <template #default="{ row }">
                  {{ row.phone ? maskPhone(row.phone) : '-' }}
                </template>
              </el-table-column>
            </el-table>
          </section>

          <!-- 订单信息 -->
          <section class="card">
            <h2 class="card-title">
              <el-icon><Document /></el-icon>
              订单信息
            </h2>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单号">
                <span class="mono">{{ order.orderNo }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="订单状态">
                <el-tag :type="statusMeta.type">{{ statusMeta.text }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="联系人">
                {{ order.contactName }}
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">
                {{ maskPhone(order.contactPhone) }}
              </el-descriptions-item>
              <el-descriptions-item label="下单时间">
                {{ order.createdAt }}
              </el-descriptions-item>
              <el-descriptions-item label="支付时间">
                {{ order.paidAt || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="支付方式">
                {{ payMethodText }}
              </el-descriptions-item>
              <el-descriptions-item label="核销时间">
                {{ order.usedAt || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">
                {{ order.remark || '无' }}
              </el-descriptions-item>
            </el-descriptions>
          </section>
        </div>

        <!-- 右侧操作栏 -->
        <div class="side-col">
          <div class="summary-card">
            <h3 class="summary-title">费用明细</h3>

            <div class="summary-row">
              <span class="label">票款</span>
              <span class="value">¥{{ (order.totalPrice / 100).toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">服务费</span>
              <span class="value free">免费</span>
            </div>

            <el-divider />

            <div class="summary-total">
              <span class="label">
                {{ order.status === 'unpaid' ? '应付金额' : '实付金额' }}
              </span>
              <span class="total-price">¥{{ (order.totalPrice / 100).toFixed(2) }}</span>
            </div>

            <div class="action-btns">
              <el-button
                v-if="order.status === 'unpaid' && remainSeconds > 0"
                type="primary"
                size="large"
                class="full-btn"
                @click="$router.push(`/payment/${order.id}`)"
              >
                立即支付
              </el-button>

              <el-button
                v-if="order.status === 'paid'"
                type="success"
                size="large"
                class="full-btn"
                @click="simulateVerify"
              >
                模拟景区核销
              </el-button>

              <el-button
                v-if="order.status === 'used' && !hasReviewed"
                type="primary"
                size="large"
                class="full-btn"
                @click="goReview"
              >
                去评价
              </el-button>

              <el-button
                v-if="order.status === 'used' && hasReviewed"
                size="large"
                class="full-btn"
                disabled
              >
                已评价
              </el-button>

              <el-button
                v-if="order.status === 'paid'"
                size="large"
                class="full-btn"
                @click="handleRefund"
              >
                申请退款
              </el-button>

              <el-button
                v-if="order.status === 'unpaid'"
                size="large"
                class="full-btn"
                @click="handleCancel"
              >
                取消订单
              </el-button>

              <el-button text class="full-btn" @click="$router.push('/user/orders')">
                返回我的订单
              </el-button>
            </div>
          </div>

          <div class="help-card">
            <h4>需要帮助？</h4>
            <div class="help-item" @click="openChat">
              <el-icon><ChatDotRound /></el-icon>
              <span>在线客服</span>
            </div>
            <div class="help-item">
              <el-icon><Phone /></el-icon>
              <span>400-123-4567</span>
            </div>
          </div>
        </div>
      </div>
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

    <!-- 评价弹窗 -->
    <ReviewDialog
      v-if="order"
      v-model="showReviewDialog"
      target-type="ticket"
      :target-id="order.scenicId || order.targetId"
      :target-name="order.scenicName"
      :target-image="order.image"
      :order-id="order.id"
      :order-no="order.orderNo"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  CircleCheckFilled,
  CopyDocument,
  InfoFilled,
  Tickets,
  Calendar,
  User,
  Document,
  ChatDotRound,
  Phone
} from '@element-plus/icons-vue'
import { useOrderStore, type Order } from '@/stores/order'
import { useReviewStore } from '@/stores/review'
import { useChat } from '@/stores/chat'
import ReviewDialog from '@/components/ReviewDialog.vue'

const route = useRoute()
const router = useRouter()
const { getOrder, cancelOrder, applyRefund, useOrder } = useOrderStore()
const reviewStore = useReviewStore()
const { openChat } = useChat()

const order = ref<Order | undefined>()
const justPaid = ref(false)
const remainSeconds = ref(0)
const showReviewDialog = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

// 检查是否已评价
const hasReviewed = computed(() => {
  return order.value ? reviewStore.hasReviewed(order.value.id) : false
})

const statusMeta = computed(() => {
  const map: Record<string, { text: string; type: any }> = {
    unpaid: { text: '待支付', type: 'warning' },
    paid: { text: '待使用', type: 'success' },
    used: { text: '已完成', type: 'info' },
    cancelled: { text: '已取消', type: 'danger' },
    refunding: { text: '退款中', type: 'warning' },
    refunded: { text: '已退款', type: 'info' }
  }
  return map[order.value?.status || 'unpaid']
})

const stepActive = computed(() => {
  const s = order.value?.status
  if (s === 'unpaid') return 1
  if (s === 'paid' || s === 'refunding') return 2
  if (s === 'used') return 3
  return 1
})

const payMethodText = computed(() => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    unionpay: '银联支付'
  }
  return order.value?.payMethod ? map[order.value.payMethod] : '-'
})

const countdownText = computed(() => {
  const m = Math.floor(remainSeconds.value / 60)
  const s = remainSeconds.value % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// 用核销码生成稳定的伪二维码图案
const qrPattern = computed(() => {
  const seed = order.value?.verifyCode || order.value?.orderNo || 'wudong'
  const pattern: boolean[] = []
  for (let i = 0; i < 144; i++) {
    const row = Math.floor(i / 12)
    const col = i % 12
    const inCorner =
      (row < 3 && col < 3) || (row < 3 && col > 8) || (row > 8 && col < 3)
    if (inCorner) {
      const isEdge =
        row === 0 || col === 0 || row === 2 || col === 2 ||
        row === 10 || col === 11 || col === 9 || row === 11
      pattern.push(
        isEdge ||
        (row === 1 && col === 1) ||
        (row === 1 && col === 10) ||
        (row === 10 && col === 1)
      )
    } else {
      const code = seed.charCodeAt(i % seed.length)
      pattern.push((code * (i + 5)) % 3 === 0)
    }
  }
  return pattern
})

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"%3E%3Crect fill="%23e5e7eb" width="120" height="90"/%3E%3Ctext x="60" y="55" text-anchor="middle" font-size="30"%3E🏔️%3C/text%3E%3C/svg%3E'
}

function maskIdCard(id: string) {
  if (!id || id.length < 8) return id || '-'
  return `${id.slice(0, 4)}********${id.slice(-4)}`
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone || '-'
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

async function copyCode() {
  const code = order.value?.verifyCode
  if (!code) return

  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('核销码已复制')
  } catch {
    ElMessage.info(`核销码：${code}`)
  }
}

function updateCountdown() {
  if (!order.value || order.value.status !== 'unpaid') {
    if (timer) clearInterval(timer)
    return
  }
  const diff = Math.floor((order.value.payDeadline - Date.now()) / 1000)
  remainSeconds.value = Math.max(0, diff)

  if (remainSeconds.value === 0) {
    cancelOrder(order.value.id)
    order.value = getOrder(order.value.id)
    if (timer) clearInterval(timer)
  }
}

async function handleCancel() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm('确认取消该订单吗？', '取消订单', {
      type: 'warning',
      confirmButtonText: '确认取消',
      cancelButtonText: '暂不取消'
    })
    cancelOrder(order.value.id)
    order.value = getOrder(order.value.id)
    ElMessage.success('订单已取消')
  } catch {}
}

async function handleRefund() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(
      `退款将扣除 10% 手续费，实际退回 ¥${((order.value.totalPrice * 0.9) / 100).toFixed(2)}。确认申请退款吗？`,
      '申请退款',
      { type: 'warning', confirmButtonText: '确认申请', cancelButtonText: '暂不退款' }
    )
    applyRefund(order.value.id)
    order.value = getOrder(order.value.id)
    ElMessage.success('退款申请已提交，1-3 个工作日到账')
  } catch {}
}

async function simulateVerify() {
  if (!order.value) return
  try {
    await ElMessageBox.confirm(
      '此按钮用于演示景区扫码核销的效果，核销后订单转为「已完成」。确认继续吗？',
      '模拟核销',
      { type: 'info', confirmButtonText: '确认核销' }
    )
    useOrder(order.value.id)
    order.value = getOrder(order.value.id)
    ElMessage.success('核销成功，祝您游玩愉快！')
  } catch {}
}

function goReview() {
  showReviewDialog.value = true
}

function handleReviewSuccess() {
  ElMessage.success('感谢您的评价！')
  // 刷新订单数据（实际中可能需要更新订单状态）
}

function rebook() {
  if (order.value?.scenicId) {
    router.push(`/scenic/${order.value.scenicId}`)
  } else {
    router.push('/scenic')
  }
}

onMounted(() => {
  const id = String(route.params.id)
  order.value = getOrder(id)

  justPaid.value = route.query.from === 'payment'

  if (order.value?.status === 'unpaid') {
    updateCountdown()
    timer = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px 60px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.success-banner {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
}

.success-icon {
  font-size: 52px;
  line-height: 1;
}

.success-text h2 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 6px;
}

.success-text p {
  font-size: 15px;
  opacity: 0.95;
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

.unpaid-card {
  padding: 12px;
}

/* 电子票 */
.ticket-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.ticket-top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 18px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.ticket-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  font-size: 24px;
}

.brand-name {
  font-size: 17px;
  font-weight: 600;
}

.ticket-body {
  display: flex;
  align-items: stretch;
  padding: 28px;
  gap: 0;
}

.ticket-left {
  flex: 1;
  padding-right: 28px;
}

.ticket-scenic {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 8px;
}

.ticket-type {
  font-size: 15px;
  color: #667eea;
  margin-bottom: 20px;
}

.ticket-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.field {
  display: flex;
  gap: 14px;
  font-size: 14px;
}

.field-label {
  color: #909399;
  width: 70px;
  flex-shrink: 0;
}

.field-value {
  color: #2d3748;
  font-weight: 500;
}

.verify-code-box {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.code-label {
  font-size: 13px;
  color: #718096;
  flex-shrink: 0;
}

.code-value {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  letter-spacing: 1px;
}

.ticket-divider {
  position: relative;
  width: 2px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ticket-divider .dashed {
  flex: 1;
  width: 0;
  border-left: 2px dashed #e2e8f0;
  margin: 14px 0;
}

.notch {
  position: absolute;
  width: 22px;
  height: 22px;
  background: #f5f7fa;
  border-radius: 50%;
  left: -10px;
}

.notch.top {
  top: -39px;
}

.notch.bottom {
  bottom: -39px;
}

.ticket-right {
  width: 210px;
  padding-left: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qrcode-wrap {
  position: relative;
  width: 160px;
  height: 160px;
  background: white;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.qrcode-wrap.used {
  opacity: 0.45;
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

.used-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
  border: 3px solid #ef4444;
  color: #ef4444;
  font-size: 22px;
  font-weight: 800;
  padding: 6px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}

.qrcode-hint {
  font-size: 13px;
  color: #909399;
  margin-top: 12px;
  text-align: center;
}

.ticket-footer {
  background: #fffbeb;
  border-top: 1px solid #fef3c7;
  padding: 14px 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #92400e;
}

/* 商品行 */
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

.product-price .unit {
  font-size: 20px;
  font-weight: 700;
  color: #e53e3e;
}

.product-price .qty {
  font-size: 14px;
  color: #718096;
  margin-top: 4px;
}

.mono {
  font-family: 'Courier New', monospace;
}

/* 侧栏 */
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
  margin-bottom: 20px;
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

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.full-btn {
  width: 100%;
  margin-left: 0 !important;
}

.help-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.help-card h4 {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 14px;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.2s;
}

.help-item:hover {
  background: #f7fafc;
  color: #667eea;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-col {
    position: static;
  }

  .ticket-body {
    flex-direction: column;
  }

  .ticket-left {
    padding-right: 0;
    padding-bottom: 24px;
  }

  .ticket-divider {
    width: 100%;
    height: 2px;
    flex-direction: row;
  }

  .ticket-divider .dashed {
    width: auto;
    height: 0;
    flex: 1;
    border-left: none;
    border-top: 2px dashed #e2e8f0;
    margin: 0 14px;
  }

  .notch.top {
    top: -10px;
    left: -39px;
  }

  .notch.bottom {
    bottom: -10px;
    left: auto;
    right: -39px;
  }

  .ticket-right {
    width: 100%;
    padding-left: 0;
    padding-top: 24px;
  }
}
</style>
