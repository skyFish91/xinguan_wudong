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
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-side">
      <div class="form-card">
        <div class="form-head">
          <div class="form-badge">
            <MiaoPattern :size="40" />
          </div>
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
import bgSvg from '../assets/login-bg.jpg';

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
/* 设计 Token - 与前端官网统一 */
:root {
  --indigo-darker: #0F1B2E;
  --indigo-dark: #1B2A4A;
  --indigo-medium: #24405E;
  --silver-white: #F3F5F7;
  --silver-grey: #C0C7D0;
  --mist-white: #F7F4EE;
  --cinnabar-red: #B33A2E;
  --wood-brown: #6B4F3A;
  --ink-black: #171512;
}

.login-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #1B2A4A 0%, #24405E 50%, #2D5270 100%);
}

/* --- 左侧品牌区 --- */
.brand-side {
  flex: 0 0 60%;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景渐变遮罩 - 从左到右从深到透明 */
.brand-side::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(90deg, transparent 0%, #F7F4EE 100%);
  z-index: 5;
  pointer-events: none;
}

.bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.85;
}

.brand-content {
  position: relative;
  text-align: center;
  color: var(--silver-white);
  padding: 48px;
  max-width: 500px;
  z-index: 10;
}

.brand-icon {
  color: var(--silver-white);
  margin-bottom: 24px;
  opacity: 0.9;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

.brand-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 48px;
  font-weight: 600;
  margin: 0;
  letter-spacing: 12px;
  color: var(--silver-white);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

.brand-subtitle {
  font-size: 16px;
  color: var(--silver-white);
  opacity: 0.85;
  margin-top: 16px;
  letter-spacing: 4px;
  font-weight: 300;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.brand-desc {
  font-size: 15px;
  line-height: 2;
  color: var(--silver-white);
  opacity: 0.75;
  margin-top: 32px;
  letter-spacing: 2px;
  font-weight: 300;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.brand-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 40px;
}

.brand-tag {
  padding: 8px 20px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: 13px;
  color: var(--silver-white);
  letter-spacing: 1px;
  font-weight: 400;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.brand-tag:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

/* --- 右侧表单区 --- */
.form-side {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px;
  background: var(--mist-white);
  position: relative;
}

.form-card {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid var(--silver-grey);
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 4px 24px rgba(15, 27, 46, 0.08);
}

.form-head {
  margin-bottom: 40px;
  text-align: center;
}

.form-badge {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--cinnabar-red);
  margin: 0 auto 24px;
  border: 2px solid var(--cinnabar-red);
  opacity: 0.8;
  position: relative;
}

.form-badge::before {
  content: '';
  position: absolute;
  inset: -6px;
  border: 1px solid var(--silver-grey);
  opacity: 0.4;
  border-radius: 10px;
}

.form-head h2 {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 24px;
  margin: 0 0 12px;
  color: var(--indigo-dark);
  font-weight: 600;
  letter-spacing: 2px;
}

.form-sub {
  margin: 0;
  color: var(--wood-brown);
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* Element Plus 表单样式覆盖 */
:deep(.el-input__wrapper) {
  background: var(--mist-white);
  border: 1px solid var(--silver-grey);
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s ease;
  padding: 12px 16px;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--indigo-medium);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--indigo-medium);
  box-shadow: 0 0 0 3px rgba(192, 199, 208, 0.3);
  background: #ffffff;
}

:deep(.el-input__inner) {
  color: var(--ink-black);
  font-size: 15px;
}

:deep(.el-input__inner::placeholder) {
  color: var(--wood-brown);
  opacity: 0.5;
}

.btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  letter-spacing: 4px;
  font-weight: 500;
  background: var(--cinnabar-red);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(179, 58, 46, 0.25);
}

.btn:hover {
  background: #9A2F24;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(179, 58, 46, 0.35);
}

.btn:active {
  transform: translateY(0);
}

:deep(.el-divider__text) {
  background: #ffffff;
}

.divider-text {
  font-size: 13px;
  color: var(--wood-brown);
  letter-spacing: 1px;
}

.tips {
  font-size: 13px;
  color: var(--wood-brown);
  line-height: 1.8;
  margin-top: 8px;
}

.tip-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 6px;
  transition: background 0.2s ease;
}

.tip-row:hover {
  background: var(--mist-white);
}

.tip-row.admin .tip-label {
  color: var(--cinnabar-red);
  font-weight: 600;
}

.tip-label {
  display: inline-block;
  min-width: 80px;
  color: var(--wood-brown);
  font-size: 13px;
  opacity: 0.8;
}

.tip-row code {
  font-family: 'SF Mono', Monaco, Consolas, 'Courier New', monospace;
  font-size: 12px;
  color: var(--indigo-dark);
  background: rgba(27, 42, 74, 0.08);
  padding: 4px 10px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.copyright {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: var(--wood-brown);
  opacity: 0.6;
  letter-spacing: 0.5px;
}

@media (max-width: 1024px) {
  .brand-side {
    flex: 0 0 50%;
  }
  .form-side {
    flex: 0 0 50%;
  }
}

@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }
  .brand-side {
    flex: 0 0 200px;
    padding: 24px;
  }
  .brand-side::after {
    display: none;
  }
  .brand-title {
    font-size: 36px;
    letter-spacing: 8px;
  }
  .brand-subtitle {
    font-size: 14px;
  }
  .brand-desc {
    font-size: 13px;
  }
  .brand-tag-row {
    display: none;
  }
  .form-side {
    flex: 1;
    padding: 24px;
  }
  .form-card {
    padding: 32px 24px;
  }
}
</style>