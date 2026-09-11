<template>
  <div class="cart-page">
    <div class="page-container">
      <h1 class="page-title">
        <el-icon><ShoppingCart /></el-icon>
        购物车
      </h1>

      <div v-if="cartStore.totalCount === 0" class="empty-cart">
        <el-empty description="购物车还是空的">
          <el-button type="primary" @click="$router.push('/scenic')">
            去逛逛
          </el-button>
        </el-empty>
      </div>

      <div v-else class="cart-content">
        <!-- 购物车列表 -->
        <div class="cart-list">
          <div class="list-header">
            <el-checkbox
              v-model="allChecked"
              @change="handleSelectAll"
              :indeterminate="indeterminate"
            >
              全选
            </el-checkbox>
            <span class="header-label">商品信息</span>
            <span class="header-label">单价</span>
            <span class="header-label">数量</span>
            <span class="header-label">小计</span>
            <span class="header-label">操作</span>
          </div>

          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="cart-item"
          >
            <el-checkbox
              :model-value="item.selected"
              @change="cartStore.toggleSelected(item.id)"
            />

            <div class="item-info">
              <img :src="item.image" @error="onImageError" />
              <div class="info-text">
                <h3>{{ item.scenicName }}</h3>
                <p>{{ item.ticketName }}</p>
              </div>
            </div>

            <div class="item-price">
              ¥{{ (item.unitPrice / 100).toFixed(2) }}
            </div>

            <div class="item-quantity">
              <el-input-number
                :model-value="item.quantity"
                @change="(val) => cartStore.updateQuantity(item.id, val || 1)"
                :min="1"
                :max="99"
                size="small"
              />
            </div>

            <div class="item-subtotal">
              ¥{{ ((item.unitPrice * item.quantity) / 100).toFixed(2) }}
            </div>

            <div class="item-actions">
              <el-button
                type="danger"
                text
                size="small"
                @click="handleRemove(item.id)"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 底部结算栏 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox
              v-model="allChecked"
              @change="handleSelectAll"
              :indeterminate="indeterminate"
            >
              全选
            </el-checkbox>
            <el-button
              text
              size="small"
              @click="handleRemoveSelected"
              :disabled="cartStore.selectedCount === 0"
            >
              删除选中
            </el-button>
            <el-button
              text
              size="small"
              @click="handleClearInvalid"
            >
              清理失效商品
            </el-button>
          </div>

          <div class="footer-right">
            <div class="summary">
              <span class="summary-label">
                已选 <strong>{{ cartStore.selectedCount }}</strong> 件商品
              </span>
              <div class="summary-total">
                <span class="label">合计：</span>
                <span class="amount">¥{{ (cartStore.selectedTotal / 100).toFixed(2) }}</span>
              </div>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="cartStore.selectedCount === 0"
              @click="handleCheckout"
            >
              结算
            </el-button>
          </div>
        </div>
      </div>

      <!-- 推荐商品 -->
      <div v-if="cartStore.totalCount > 0" class="recommend-section">
        <h2 class="section-title">猜你喜欢</h2>
        <div class="recommend-list">
          <div
            v-for="item in recommendList"
            :key="item.id"
            class="recommend-item"
            @click="$router.push(`/scenic/${item.id}`)"
          >
            <img :src="item.image" @error="onImageError" />
            <div class="recommend-info">
              <h4>{{ item.name }}</h4>
              <p class="recommend-price">
                ¥<span>{{ item.price }}</span> 起
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const allChecked = computed({
  get: () => cartStore.allSelected,
  set: (val) => cartStore.toggleAll(val)
})

const indeterminate = computed(
  () =>
    cartStore.selectedCount > 0 &&
    cartStore.selectedCount < cartStore.totalCount
)

const recommendList = ref([
  {
    id: 1,
    name: '西江千户苗寨',
    image: '/images/travel/1.jpg',
    price: 90
  },
  {
    id: 2,
    name: '镇远古城',
    image: '/images/travel/2.jpg',
    price: 60
  },
  {
    id: 3,
    name: '荔波小七孔',
    image: '/images/travel/3.jpg',
    price: 110
  },
  {
    id: 4,
    name: '梵净山',
    image: '/images/travel/4.jpg',
    price: 100
  }
])

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="100" y="80" text-anchor="middle" font-size="40"%3E🏔️%3C/text%3E%3C/svg%3E'
}

function handleSelectAll(checked: boolean) {
  cartStore.toggleAll(checked)
}

async function handleRemove(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    cartStore.removeItem(id)
    ElMessage.success('已删除')
  } catch {}
}

async function handleRemoveSelected() {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${cartStore.selectedCount} 件商品吗？`,
      '批量删除',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
    cartStore.removeSelected()
    ElMessage.success('已删除')
  } catch {}
}

function handleClearInvalid() {
  ElMessage.info('暂无失效商品')
}

function handleCheckout() {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: '/cart' } })
    return
  }

  const selected = cartStore.selectedItems

  if (selected.length === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  // 检查是否有未选择日期的商品
  const noDate = selected.filter(item => !item.travelDate)
  if (noDate.length > 0) {
    ElMessage.warning('部分商品未选择游玩日期，请返回修改')
    return
  }

  // 批量结算功能：这里简化处理，只支持单个商品下单
  // 完整实现需要后端支持批量订单创建
  if (selected.length === 1) {
    const item = selected[0]
    router.push({
      path: '/order/create',
      query: {
        type: item.targetType,
        targetId: String(item.targetId),
        scenicId: String(item.scenicId || ''),
        scenicName: item.scenicName,
        ticketName: item.ticketName,
        image: item.image,
        unitPrice: String(item.unitPrice),
        quantity: String(item.quantity),
        travelDate: item.travelDate || ''
      }
    })
    // 下单后从购物车移除
    cartStore.removeItem(item.id)
  } else {
    ElMessage.info('批量下单功能开发中，请单独结算')
  }
}
</script>

<style scoped>
.cart-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px 80px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.empty-cart {
  background: white;
  border-radius: 16px;
  padding: 60px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.list-header {
  display: grid;
  grid-template-columns: 50px 1fr 120px 160px 120px 80px;
  gap: 20px;
  align-items: center;
  padding: 20px 24px;
  background: #f7fafc;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.header-label {
  text-align: center;
}

.cart-item {
  display: grid;
  grid-template-columns: 50px 1fr 120px 160px 120px 80px;
  gap: 20px;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f3f5;
  transition: background 0.2s;
}

.cart-item:hover {
  background: #fafbfc;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.item-info img {
  width: 100px;
  height: 75px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.info-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
}

.info-text p {
  font-size: 14px;
  color: #667eea;
}

.item-price {
  font-size: 18px;
  font-weight: 600;
  color: #e53e3e;
  text-align: center;
}

.item-quantity {
  display: flex;
  justify-content: center;
}

.item-subtotal {
  font-size: 20px;
  font-weight: 700;
  color: #e53e3e;
  text-align: center;
}

.item-actions {
  display: flex;
  justify-content: center;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.summary-label {
  font-size: 14px;
  color: #4a5568;
}

.summary-label strong {
  color: #e53e3e;
  font-size: 16px;
}

.summary-total {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.summary-total .label {
  font-size: 16px;
  color: #4a5568;
}

.summary-total .amount {
  font-size: 28px;
  font-weight: 800;
  color: #e53e3e;
}

.recommend-section {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
}

.recommend-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.recommend-item {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #e5e7eb;
}

.recommend-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.recommend-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.recommend-info {
  padding: 14px;
}

.recommend-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
}

.recommend-price {
  font-size: 14px;
  color: #e53e3e;
}

.recommend-price span {
  font-size: 20px;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .list-header,
  .cart-item {
    grid-template-columns: 50px 1fr 100px 120px 100px 60px;
    gap: 10px;
  }

  .recommend-list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
