<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>

    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="全部订单" name="all" />
      <el-tab-pane label="待支付" name="unpaid" />
      <el-tab-pane label="待使用" name="paid" />
      <el-tab-pane label="已完成" name="used" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <div class="order-list">
      <div v-if="filteredOrders.length === 0" class="empty-state">
        <el-empty description="暂无订单">
          <el-button type="primary" @click="$router.push('/scenic')">
            去逛逛
          </el-button>
        </el-empty>
      </div>

      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-header">
          <span class="order-no">订单号：{{ order.orderNo }}</span>
          <el-tag :type="getStatusType(order.status)">
            {{ getStatusText(order.status) }}
          </el-tag>
        </div>

        <div class="order-body">
          <img :src="order.image" :alt="order.scenicName" class="order-image" @error="onImageError" />
          <div class="order-info">
            <h3>{{ order.scenicName }}</h3>
            <p class="order-detail">{{ order.ticketName }} × {{ order.quantity }}</p>
            <p class="order-date">
              <el-icon><Calendar /></el-icon>
              游玩日期：{{ order.travelDate }}
            </p>
          </div>
          <div class="order-price">
            <div class="price">¥{{ (order.unitPrice / 100).toFixed(2) }}</div>
            <div class="quantity">x {{ order.quantity }}</div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-time">{{ order.createdAt }}</div>
          <div class="total">
            合计：<span class="amount">¥{{ (order.totalPrice / 100).toFixed(2) }}</span>
          </div>
          <div class="actions">
            <el-button
              v-if="order.status === 'unpaid'"
              type="primary"
              size="small"
              @click="handlePay(order)"
            >
              立即支付
            </el-button>
            <el-button
              v-if="order.status === 'unpaid'"
              size="small"
              @click="handleCancel(order)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="order.status === 'paid'"
              type="success"
              size="small"
              @click="handleView(order)"
            >
              查看电子票
            </el-button>
            <el-button
              v-if="order.status === 'paid'"
              size="small"
              @click="handleRefund(order)"
            >
              申请退款
            </el-button>
            <el-button
              v-if="order.status === 'used' && !hasReviewed(order.id)"
              type="primary"
              size="small"
              @click="handleReview(order)"
            >
              去评价
            </el-button>
            <el-button
              v-if="order.status === 'used' && hasReviewed(order.id)"
              size="small"
              disabled
            >
              已评价
            </el-button>
            <el-button
              size="small"
              @click="handleView(order)"
            >
              订单详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <ReviewDialog
      v-model="showReviewDialog"
      target-type="ticket"
      :target-id="reviewingOrder?.scenicId || reviewingOrder?.targetId || 0"
      :target-name="reviewingOrder?.scenicName || ''"
      :target-image="reviewingOrder?.image || ''"
      :order-id="reviewingOrder?.id || ''"
      :order-no="reviewingOrder?.orderNo || ''"
      @success="handleReviewSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar } from '@element-plus/icons-vue'
import { useOrderStore, type Order } from '@/stores/order'
import { useReviewStore } from '@/stores/review'
import ReviewDialog from '@/components/ReviewDialog.vue'

const router = useRouter()
const { orders, cancelOrder, applyRefund } = useOrderStore()
const reviewStore = useReviewStore()

const activeTab = ref('all')
const showReviewDialog = ref(false)
const reviewingOrder = ref<Order | null>(null)

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(o => o.status === activeTab.value)
})

function hasReviewed(orderId: string) {
  return reviewStore.hasReviewed(orderId)
}

function getStatusType(status: string) {
  const map: Record<string, any> = {
    unpaid: 'warning',
    paid: 'success',
    used: 'info',
    cancelled: 'danger',
    refunding: 'warning',
    refunded: 'info'
  }
  return map[status] || 'info'
}

function getStatusText(status: string) {
  const map: Record<string, string> = {
    unpaid: '待支付',
    paid: '待使用',
    used: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  }
  return map[status] || status
}

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"%3E%3Crect fill="%23e5e7eb" width="120" height="90"/%3E%3Ctext x="60" y="55" text-anchor="middle" font-size="30"%3E🏔️%3C/text%3E%3C/svg%3E'
}

function handlePay(order: Order) {
  router.push(`/payment/${order.id}`)
}

function handleView(order: Order) {
  router.push(`/order/${order.id}`)
}

async function handleCancel(order: Order) {
  try {
    await ElMessageBox.confirm('确认取消该订单吗？', '取消订单', {
      type: 'warning',
      confirmButtonText: '确认取消',
      cancelButtonText: '暂不取消'
    })
    cancelOrder(order.id)
    ElMessage.success('订单已取消')
  } catch {}
}

async function handleRefund(order: Order) {
  try {
    await ElMessageBox.confirm(
      `退款将扣除 10% 手续费，实际退回 ¥${((order.totalPrice * 0.9) / 100).toFixed(2)}。确认申请退款吗？`,
      '申请退款',
      { type: 'warning', confirmButtonText: '确认申请', cancelButtonText: '暂不退款' }
    )
    applyRefund(order.id)
    ElMessage.success('退款申请已提交')
  } catch {}
}

function handleReview(order: Order) {
  console.log('点击去评价', order) // 调试用
  reviewingOrder.value = order
  showReviewDialog.value = true
  console.log('showReviewDialog:', showReviewDialog.value) // 调试用
}

function handleReviewSuccess() {
  ElMessage.success('感谢您的评价！')
  reviewingOrder.value = null
}
</script>

<style scoped>
.orders-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 24px;
}

.order-tabs {
  margin-bottom: 24px;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  padding: 60px 0;
}

.order-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f7fafc;
  border-bottom: 1px solid #e5e7eb;
}

.order-no {
  font-size: 14px;
  color: #4a5568;
  font-family: 'Courier New', monospace;
}

.order-body {
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: center;
}

.order-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
}

.order-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.order-detail {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
}

.order-date {
  font-size: 14px;
  color: #718096;
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-price {
  text-align: right;
  padding-right: 20px;
}

.price {
  font-size: 22px;
  font-weight: 700;
  color: #e53e3e;
  margin-bottom: 4px;
}

.quantity {
  font-size: 14px;
  color: #718096;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f7fafc;
  border-top: 1px solid #e5e7eb;
}

.order-time {
  font-size: 13px;
  color: #909399;
}

.total {
  font-size: 14px;
  color: #4a5568;
}

.amount {
  font-size: 20px;
  font-weight: 700;
  color: #e53e3e;
  margin-left: 8px;
}

.actions {
  display: flex;
  gap: 10px;
}
</style>
