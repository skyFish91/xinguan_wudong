<template>
  <div class="pay-page">
    <div class="wd-container pay-back"><PageBack /></div>
    <div class="pay-wrap">
      <!-- 骨架屏 -->
      <div v-if="loading" class="wd-skel-card pay-card">
        <div class="wd-skel-body">
          <div class="wd-skeleton wd-skel-title"></div>
          <div class="wd-skeleton wd-skel-line skel-qr"></div>
          <div class="wd-skeleton wd-skel-text"></div>
          <div class="wd-skeleton wd-skel-line skel-btn"></div>
        </div>
      </div>

      <div v-else-if="payInfo" class="wd-card pay-card">
        <!-- 头部 -->
        <div class="pay-head">
          <div class="pay-badge">
            <el-icon><Wallet /></el-icon>
          </div>
          <h2 class="pay-title">收银台</h2>
          <p class="pay-sub">演示环境 · 模拟微信扫码支付</p>
        </div>

        <!-- 金额 -->
        <div class="amount-block">
          <span class="amount-label">应付金额</span>
          <div class="amount">
            <span class="symbol">¥</span>
            <span class="value">{{ payInfo.amount }}</span>
          </div>
          <div class="order-no">订单号 {{ payInfo.orderNo }}</div>
        </div>

        <!-- 二维码 -->
        <div class="qr-wrap">
          <div class="qrcode">
            <div class="qr-grid">
              <div
                v-for="i in 144"
                :key="i"
                class="qr-cell"
                :class="{ dark: qrPattern[i % qrPattern.length] === '1' }"
              />
            </div>
            <div class="qr-logo">
              <el-icon><Wallet /></el-icon>
            </div>
          </div>
          <p class="qr-tip">请用微信扫描二维码完成支付</p>
          <p class="qr-content">{{ payInfo.qrcodeContent }}</p>
        </div>

        <!-- 操作 -->
        <div class="pay-actions">
          <el-button type="success" size="large" class="pay-btn" :loading="paying" @click="mockScan">
            模拟扫码支付
          </el-button>
          <el-button size="large" @click="$router.push('/orders')">暂不支付</el-button>
        </div>

        <p class="pay-note">支付完成后可在「我的订单」查看订单状态</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Wallet } from '@element-plus/icons-vue';
import PageBack from '../../components/PageBack.vue';
import request from '../../api/request';

const route = useRoute();
const router = useRouter();
const payInfo = ref<any>(null);
const paying = ref(false);
const loading = ref(true);
// 固定伪随机二维码图案（仅装饰）
const qrPattern =
  '1010011101010110010110100101101001011010010110100101101110010110100101101001011010010110100101101110010110100101101001011010010110100101';

async function init() {
  loading.value = true;
  try {
    const st: any = await request.get('/pay/status', { params: { orderId: route.params.orderId } });
    if (st.paid) {
      ElMessage.info('该订单已支付');
      router.replace('/orders');
      return;
    }
    payInfo.value = await request.post('/pay/create', null, {
      params: { orderId: route.params.orderId },
    });
  } catch {
    // 已提示，回订单页
    router.replace('/orders');
  } finally {
    loading.value = false;
  }
}

async function mockScan() {
  paying.value = true;
  try {
    await request.post('/pay/mock-scan', null, { params: { payNo: payInfo.value.payNo } });
    ElMessage.success('支付成功');
    router.replace('/orders');
  } catch {
    // 已提示
  } finally {
    paying.value = false;
  }
}

onMounted(init);
</script>

<style scoped>
.pay-page {
  min-height: 100vh;
}

/* 返回条：与卡片同宽，别贴到浏览器边缘 */
.pay-back {
  padding-top: var(--wd-s6);
}

.pay-wrap {
  display: flex;
  justify-content: center;
  padding: var(--wd-s3) var(--wd-gutter) var(--wd-s10);
}

.pay-card {
  width: 100%;
  max-width: 440px;
  padding: var(--wd-s7) var(--wd-s6) var(--wd-s6);
  text-align: center;
}

/* 头部 */
.pay-head {
  padding-bottom: var(--wd-s5);
  border-bottom: 1px solid var(--wd-border);
}
.pay-badge {
  width: 52px;
  height: 52px;
  margin: 0 auto var(--wd-s3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--wd-r-md);
  font-size: 26px;
  color: #fff;
  background: linear-gradient(140deg, #34a853, #1e7a45);
  box-shadow: 0 8px 22px rgba(30, 122, 69, 0.28);
}
.pay-title {
  font-size: 21px;
  font-weight: 800;
  color: var(--wd-text-1);
}
.pay-sub {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 金额 */
.amount-block {
  padding: var(--wd-s5) 0 var(--wd-s4);
}
.amount-label {
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
  margin-top: 6px;
}
.amount .symbol {
  font-size: 20px;
  font-weight: 700;
  color: var(--wd-brand);
}
.amount .value {
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--wd-brand);
  font-variant-numeric: tabular-nums;
}
.order-no {
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--wd-text-4);
  font-variant-numeric: tabular-nums;
}

/* 二维码 */
.qr-wrap {
  padding: var(--wd-s5) 0 var(--wd-s5);
}
.qrcode {
  position: relative;
  width: 184px;
  height: 184px;
  margin: 0 auto var(--wd-s4);
  padding: 12px;
  border-radius: var(--wd-r-md);
  border: 1px solid var(--wd-border);
  background: #fff;
  box-shadow: var(--wd-sh-2);
}
.qr-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1px;
  width: 100%;
  height: 100%;
}
.qr-cell {
  background: #fff;
}
.qr-cell.dark {
  background: #22242c;
}
.qr-logo {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--wd-r-xs);
  font-size: 20px;
  color: #1e7a45;
  background: #fff;
  border: 3px solid #fff;
  box-shadow: 0 0 0 1px var(--wd-border);
}
.qr-tip {
  font-size: 13px;
  color: var(--wd-text-2);
}
.qr-content {
  margin-top: 6px;
  font-size: 11px;
  color: var(--wd-text-4);
  word-break: break-all;
}

/* 操作 */
.pay-actions {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s3);
  padding-top: var(--wd-s4);
  border-top: 1px solid var(--wd-border);
}
.pay-btn {
  width: 100%;
  --el-button-bg-color: #1e7a45;
  --el-button-border-color: #1e7a45;
  --el-button-hover-bg-color: #34a853;
  --el-button-hover-border-color: #34a853;
  --el-button-active-bg-color: #176036;
  box-shadow: 0 6px 18px rgba(30, 122, 69, 0.24);
}
.pay-note {
  margin-top: var(--wd-s4);
  font-size: 12px;
  color: var(--wd-text-4);
}

/* 骨架 */
.skel-qr {
  height: 184px;
  width: 184px;
  margin: var(--wd-s5) auto;
  border-radius: var(--wd-r-md);
}
.skel-btn {
  height: 44px;
  margin-top: var(--wd-s4);
}
</style>
