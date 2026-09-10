<template>
  <div>
    <TopNav />
    <div class="page">
      <h2>订单支付</h2>

      <el-card v-if="order.id" class="order-card">
        <div class="order-info">
          <div class="info-row">
            <span class="label">订单号：</span>
            <span>{{ order.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单类型：</span>
            <span>{{ orderTypeText }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单金额：</span>
            <span class="amount">¥{{ order.totalAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">实付金额：</span>
            <span class="amount highlight">¥{{ order.payAmount }}</span>
          </div>
        </div>

        <el-divider />

        <div class="pay-methods">
          <div class="method-title">选择支付方式</div>
          <el-radio-group v-model="payMethod" class="method-group">
            <el-radio :value="1" size="large">
              <div class="method-item">
                <span class="method-name">💳 微信支付</span>
                <span class="method-desc">推荐使用微信支付</span>
              </div>
            </el-radio>
            <el-radio :value="2" size="large">
              <div class="method-item">
                <span class="method-name">💰 支付宝</span>
                <span class="method-desc">支持花呗分期</span>
              </div>
            </el-radio>
            <el-radio :value="3" size="large">
              <div class="method-item">
                <span class="method-name">💵 余额支付</span>
                <span class="method-desc">账户余额：¥0.00</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <div class="pay-actions">
          <el-button size="large" @click="$router.back()">取消支付</el-button>
          <el-button type="danger" size="large" :loading="paying" @click="doPay">
            确认支付 ¥{{ order.payAmount }}
          </el-button>
        </div>
      </el-card>

      <el-card v-else class="loading-card">
        <el-skeleton :rows="5" animated />
      </el-card>

      <!-- 支付成功弹窗 -->
      <el-dialog v-model="showSuccess" title="支付成功" width="400px" :close-on-click-modal="false">
        <div class="success-content">
          <div class="success-icon">✓</div>
          <div class="success-text">支付成功！</div>
          <div class="success-desc">订单号：{{ order.orderNo }}</div>
        </div>
        <template #footer>
          <el-button @click="$router.push('/')">返回首页</el-button>
          <el-button type="primary" @click="$router.push('/orders')">查看订单</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const route = useRoute();
const router = useRouter();
const order = ref<any>({});
const payMethod = ref(1);
const paying = ref(false);
const showSuccess = ref(false);

const orderTypeText = computed(() => {
  const typeMap: Record<string, string> = {
    goods: '商品订单',
    meal: '餐位预订',
    hotel: '住宿预订',
    ticket: '门票订单',
    route: '路线套餐'
  };
  return typeMap[order.value.orderType] || '其他';
});

async function load() {
  try {
    const userId = JSON.parse(localStorage.getItem('userInfo') || '{}').id;
    order.value = await request.get(`/orders/${route.params.orderId}`, {
      params: { userId }
    });
    if (order.value.status !== 0) {
      ElMessage.warning('该订单不是待支付状态');
      router.push('/orders');
    }
  } catch {
    router.push('/orders');
  }
}

async function doPay() {
  paying.value = true;
  try {
    // 模拟支付流程
    await request.post('/pay/unified', {
      orderId: order.value.id,
      payMethod: payMethod.value,
      amount: order.value.payAmount
    });

    // 模拟支付成功回调
    setTimeout(async () => {
      try {
        await request.post('/pay/callback', {
          orderId: order.value.id,
          tradeNo: 'MOCK' + Date.now(),
          status: 1
        });
        showSuccess.value = true;
        window.dispatchEvent(new Event('cart-changed'));
      } catch {
        // 已提示
      }
    }, 1500);
  } catch {
    paying.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.order-card {
  margin-top: 20px;
}
.order-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.info-row {
  display: flex;
  align-items: center;
  font-size: 15px;
}
.label {
  color: #666;
  width: 100px;
}
.amount {
  color: #c0392b;
  font-weight: bold;
  font-size: 16px;
}
.amount.highlight {
  font-size: 24px;
}
.pay-methods {
  margin-top: 20px;
}
.method-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}
.method-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}
.method-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
}
.method-name {
  font-size: 15px;
  font-weight: 600;
}
.method-desc {
  font-size: 13px;
  color: #999;
}
.pay-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 16px;
}
.loading-card {
  margin-top: 20px;
  padding: 30px;
}
.success-content {
  text-align: center;
  padding: 20px;
}
.success-icon {
  width: 80px;
  height: 80px;
  line-height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #67c23a;
  color: #fff;
  font-size: 48px;
  font-weight: bold;
}
.success-text {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}
.success-desc {
  color: #666;
  font-size: 14px;
}
</style>
