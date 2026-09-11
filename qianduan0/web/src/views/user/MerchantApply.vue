<template>
  <div class="apply-page">
    <TopNav />

    <div class="wd-container wd-page">
      <header class="page-head">
        <h1 class="page-title">商家入驻申请</h1>
        <p class="page-sub">提交后由平台审核，通过后即可在商户后台管理店铺</p>
      </header>

      <!-- 申请记录 -->
      <section class="wd-section first" v-if="applies.length">
        <div class="wd-section-head">
          <h2 class="wd-section-title">我的申请记录</h2>
          <span class="wd-section-more">{{ applies.length }} 条</span>
        </div>

        <div class="apply-list">
          <article v-for="a in applies" :key="a.id" class="wd-card apply-row">
            <div class="apply-main">
              <div class="apply-top">
                <span class="shop-name">{{ a.shopName }}</span>
                <span class="module-chip">{{ moduleText(a.moduleType) }}</span>
              </div>
              <p v-if="a.rejectReason" class="reject">驳回原因：{{ a.rejectReason }}</p>
            </div>
            <el-tag
              :type="a.status === 1 ? 'success' : a.status === 2 ? 'danger' : 'warning'"
              size="small"
            >
              {{ a.status === 0 ? '审核中' : a.status === 1 ? '已通过' : '已驳回' }}
            </el-tag>
          </article>
        </div>
      </section>

      <!-- 申请表单 -->
      <section class="wd-section" :class="{ first: !applies.length }">
        <div class="wd-section-head">
          <h2 class="wd-section-title">填写申请信息</h2>
        </div>

        <div class="wd-card form-card">
          <el-form :model="form" label-width="110px" class="form">
            <el-form-item label="店铺名称">
              <el-input v-model="form.shopName" class="input" placeholder="如：乌东苗绣坊" />
            </el-form-item>
            <el-form-item label="经营模块">
              <el-select v-model="form.moduleType" class="input">
                <el-option label="衣 · 非遗好物" value="clothing" />
                <el-option label="食 · 餐饮美食" value="food" />
                <el-option label="住 · 民宿住宿" value="hotel" />
                <el-option label="行 · 线路订票" value="travel" />
              </el-select>
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="form.contact" placeholder="请填写负责人姓名" class="input" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" placeholder="用于接收审核结果" class="input" />
            </el-form-item>
            <el-form-item label="营业执照号">
              <el-input v-model="form.licenseNo" class="input" />
            </el-form-item>
            <el-form-item label="补充材料">
              <el-input
                v-model="form.materials"
                type="textarea"
                :rows="3"
                placeholder="其他资质说明（选填）"
                class="input"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="large" :loading="submitting" @click="submit">
                提交申请
              </el-button>
              <el-button size="large" @click="$router.back()">返回</el-button>
            </el-form-item>
          </el-form>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';

const router = useRouter();
const applies = ref<any[]>([]);
const submitting = ref(false);
const form = reactive({
  shopName: '',
  moduleType: 'clothing',
  contact: '',
  contactPhone: '',
  licenseNo: '',
  materials: '',
});

function moduleText(m: string) {
  const map: Record<string, string> = {
    clothing: '衣·非遗好物',
    food: '食·餐饮美食',
    hotel: '住·民宿住宿',
    travel: '行·线路订票',
  };
  return map[m] || m;
}

async function loadApplies() {
  try {
    applies.value = await request.get('/merchant/my-apply');
  } catch {
    // 已提示
  }
}

async function submit() {
  if (!form.shopName.trim() || !form.contact.trim() || !form.contactPhone.trim() || !form.licenseNo.trim()) {
    ElMessage.warning('请填写完整申请信息');
    return;
  }
  submitting.value = true;
  try {
    await request.post('/merchant/apply', { ...form });
    ElMessage.success('申请已提交，请等待平台审核');
    router.push('/user');
  } catch {
    // 已提示
  } finally {
    submitting.value = false;
  }
}

onMounted(loadApplies);
</script>

<style scoped>
.apply-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.page-head {
  padding-bottom: var(--wd-s6);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.wd-section.first {
  margin-top: 0;
}

.apply-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s3);
}
.apply-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  padding: var(--wd-s4) var(--wd-s5);
}
.apply-main {
  min-width: 0;
}
.apply-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.shop-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--wd-text-1);
}
.module-chip {
  padding: 2px 11px;
  border-radius: var(--wd-r-pill);
  font-size: 12px;
  color: var(--wd-indigo);
  background: #eef2f9;
}
.reject {
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--wd-brand);
}

.form-card {
  padding: var(--wd-s6);
}
.form {
  max-width: 620px;
}
.input {
  max-width: 400px;
}

@media (max-width: 640px) {
  .input {
    max-width: 100%;
  }
}
</style>
