<template>
  <AuthShell
    eyebrow="WUDONG · MIAO TOURISM"
    title="欢迎回来"
    subtitle="登录后即可下单、订票、发布游记"
    visual-title="云雾深处的苗寨日常"
    visual-desc="梯田、长桌宴、蜡染与银饰——把乌东的好物与风景，装进一次旅程。"
    :visual-image="PHOTO_LARGE.terraces"
  >
    <el-form :model="form" label-position="top" @keyup.enter="onLogin">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" size="large">
          <template #prefix><el-icon><Iphone /></el-icon></template>
        </el-input>
      </el-form-item>

      <el-form-item label="密码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          size="large"
        >
          <template #prefix><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>

      <el-button type="primary" size="large" class="full" :loading="loading" @click="onLogin">
        登录
      </el-button>
    </el-form>

    <div class="links">
      <router-link to="/register">注册新账号</router-link>
      <router-link to="/">返回首页</router-link>
    </div>

    <div class="demo-box">
      <div class="demo-title">演示账号（点击可自动填入）</div>
      <div class="demo-grid">
        <button v-for="d in demoAccounts" :key="d.phone" class="demo-item" @click="fill(d)">
          <span class="demo-role">{{ d.role }}</span>
          <span class="demo-phone">{{ d.phone }}</span>
          <span class="demo-pwd">{{ d.password }}</span>
        </button>
      </div>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Iphone, Lock } from '@element-plus/icons-vue';
import AuthShell from '../components/AuthShell.vue';
import request from '../api/request';
import { PHOTO_LARGE } from '../utils/media';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const form = reactive({ phone: '', password: '' });
const loading = ref(false);

const demoAccounts = [
  { role: '游客', phone: '13800000001', password: 'user123' },
  { role: '商家', phone: '13800000002', password: 'merchant123' },
  { role: '管理员', phone: '13800000000', password: 'admin123' },
];

function fill(d: { phone: string; password: string }) {
  form.phone = d.phone;
  form.password = d.password;
}

async function onLogin() {
  if (!form.phone || !form.password) {
    ElMessage.warning('请输入手机号和密码');
    return;
  }
  loading.value = true;
  try {
    const res: any = await request.post('/auth/login', form);
    userStore.setLogin(res.accessToken, null);
    // 拉取用户信息
    try {
      const profile: any = await request.get('/auth/profile');
      userStore.setUserInfo(profile);
    } catch {
      // 信息拉取失败不影响登录
    }
    ElMessage.success('登录成功');
    router.push((route.query.redirect as string) || '/');
  } catch {
    // 错误已提示
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.full {
  width: 100%;
  margin-top: var(--wd-s2);
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: var(--wd-s4);
  font-size: 13px;
  color: var(--wd-text-3);
}
.links a {
  text-decoration: none;
  transition: color 0.24s var(--wd-ease);
}
.links a:hover {
  color: var(--wd-brand);
}

.demo-box {
  margin-top: var(--wd-s6);
  padding: var(--wd-s4);
  border-radius: var(--wd-r-sm);
  background: var(--wd-brand-soft);
  border: 1px dashed var(--wd-brand-200);
}
.demo-title {
  margin-bottom: var(--wd-s3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--wd-brand-400);
}
.demo-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.demo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 12px;
  border-radius: var(--wd-r-xs);
  border: 1px solid transparent;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-size: 12.5px;
  transition: all 0.22s var(--wd-ease);
}
.demo-item:hover {
  border-color: var(--wd-brand-200);
  transform: translateX(2px);
  box-shadow: var(--wd-sh-1);
}
.demo-role {
  flex-shrink: 0;
  padding: 1px 9px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  color: var(--wd-brand);
  background: var(--wd-brand-tint);
}
.demo-phone {
  color: var(--wd-text-1);
  font-variant-numeric: tabular-nums;
}
.demo-pwd {
  margin-left: auto;
  color: var(--wd-text-4);
  font-variant-numeric: tabular-nums;
}
</style>
