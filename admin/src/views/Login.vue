<template>
  <div class="login-page">
    <!-- 左侧品牌展示区 -->
    <div class="brand-side">
      <img :src="bgSvg" class="bg-img" alt="苗寨" />
      <div class="brand-content">
        <MiaoPattern :size="64" class="brand-icon" />
        <h1 class="brand-title">乌东文旅</h1>
        <div class="brand-subtitle">苗寨数字文旅管理平台</div>
        <div class="brand-desc">
          银饰千年 · 苗绣万里<br/>
          数据贯通 · 决策有数
        </div>
        <div class="brand-tag-row">
          <span class="brand-tag">用户管理</span>
          <span class="brand-tag">商家审核</span>
          <span class="brand-tag">订单总览</span>
          <span class="brand-tag">运营管理</span>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-side">
      <div class="form-card">
        <div class="form-head">
          <h2>欢迎登录</h2>
          <p class="form-sub">请使用平台分配的账号登录后台</p>
        </div>
        <el-form :model="form" label-width="0" size="large" @keyup.enter="submit">
          <el-form-item>
            <el-input v-model="form.phone" placeholder="手机号" :prefix-icon="Phone" clearable />
          </el-form-item>
          <el-form-item>
            <el-input v-model="form.password" type="password" placeholder="密码" :prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" class="btn" :loading="loading" @click="submit">登 录</el-button>
          </el-form-item>
        </el-form>
        <el-divider><span class="divider-text">演示账号</span></el-divider>
        <div class="tips">
          <div class="tip-row admin">
            <span class="tip-label">平台管理员</span>
            <code>13800000000 / admin123</code>
          </div>
          <div class="tip-row">
            <span class="tip-label">衣商家</span>
            <code>13800000002 / merchant123</code>
          </div>
          <div class="tip-row">
            <span class="tip-label">食商家</span>
            <code>13800000003 / merchant123</code>
          </div>
          <div class="tip-row">
            <span class="tip-label">住商家</span>
            <code>13800000004 / merchant123</code>
          </div>
          <div class="tip-row">
            <span class="tip-label">行商家</span>
            <code>13800000005 / merchant123</code>
          </div>
        </div>
      </div>
      <div class="copyright">© 2026 乌东文旅 · 演示版本</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Phone, Lock } from '@element-plus/icons-vue';
import request from '../api/request';
import { useUserStore } from '../stores/user';
import MiaoPattern from '../components/MiaoPattern.vue';
import bgSvg from '../assets/login-bg.svg';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);
const form = reactive({ phone: '', password: '' });

async function submit() {
  if (!form.phone || !form.password) {
    ElMessage.warning('请输入账号密码');
    return;
  }
  loading.value = true;
  try {
    const data: any = await request.post('/auth/login', { phone: form.phone, password: form.password });
    userStore.setLogin(data.accessToken, data.userInfo || null);
    const profile: any = await request.get('/auth/profile');
    userStore.setLogin(userStore.token, profile);
    const redirect = String(route.query.redirect || '/');
    router.push(redirect);
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  background: var(--bg-page);
}

/* --- 左侧品牌区 --- */
.brand-side {
  flex: 1.2;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.brand-content {
  position: relative;
  text-align: center;
  color: #fff;
  padding: 40px;
  max-width: 480px;
}
.brand-icon {
  color: rgba(255,255,255,0.85);
  margin-bottom: 16px;
}
.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0;
  letter-spacing: 8px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
}
.brand-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.85);
  margin-top: 8px;
  letter-spacing: 3px;
}
.brand-desc {
  font-size: 16px;
  line-height: 1.9;
  color: rgba(255,255,255,0.92);
  margin-top: 32px;
  letter-spacing: 4px;
}
.brand-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 28px;
}
.brand-tag {
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  font-size: 12px;
  color: #fff;
  backdrop-filter: blur(8px);
}

/* --- 右侧表单区 --- */
.form-side {
  width: 480px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 50px;
  background: var(--bg-card);
  position: relative;
}
.form-card {
  width: 100%;
}
.form-head {
  margin-bottom: 32px;
}
.form-head h2 {
  font-size: 26px;
  margin: 0 0 8px;
  color: var(--text-primary);
  font-weight: 600;
}
.form-sub {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}
.btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  letter-spacing: 4px;
}
.divider-text {
  font-size: 12px;
  color: var(--text-secondary);
  letter-spacing: 1px;
}
.tips {
  font-size: 13px;
  color: var(--text-regular);
  line-height: 1.9;
}
.tip-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
  transition: background 0.15s ease;
}
.tip-row:hover {
  background: var(--bg-page);
}
.tip-row.admin .tip-label {
  color: var(--color-danger);
  font-weight: 600;
}
.tip-label {
  display: inline-block;
  min-width: 70px;
  color: var(--text-secondary);
  font-size: 12px;
}
.tip-row code {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  color: var(--color-secondary);
  background: var(--color-secondary-soft);
  padding: 2px 8px;
  border-radius: 4px;
}
.copyright {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: var(--text-placeholder);
}

@media (max-width: 900px) {
  .brand-side { display: none; }
  .form-side { width: 100%; }
}
</style>