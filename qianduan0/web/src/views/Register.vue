<template>
  <AuthShell
    title="创建账号"
    subtitle="三步之后，就能收藏好物、预订民宿、分享游记"
    visual-title="从一次注册开始，走进苗乡"
    visual-desc="加入乌东，收藏非遗好物、预订山间民宿，把旅途见闻写进社区。"
  >
    <el-form :model="form" label-position="top">
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" size="large">
          <template #prefix><el-icon><Iphone /></el-icon></template>
        </el-input>
      </el-form-item>

      <el-form-item label="短信验证码">
        <div class="code-row">
          <el-input v-model="form.smsCode" placeholder="测试环境填 123456" size="large">
            <template #prefix><el-icon><Message /></el-icon></template>
          </el-input>
          <el-button size="large" :disabled="counting > 0" @click="sendCode">
            {{ counting > 0 ? `${counting}s` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="给自己取个名字" size="large" />
      </el-form-item>

      <el-form-item label="密码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="至少 6 位"
          show-password
          size="large"
        >
          <template #prefix><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>

      <el-form-item label="确认密码">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          size="large"
        >
          <template #prefix><el-icon><Lock /></el-icon></template>
        </el-input>
      </el-form-item>

      <el-button type="primary" size="large" class="full" :loading="loading" @click="onRegister">
        注册
      </el-button>
    </el-form>

    <div class="links">
      <router-link to="/login">已有账号，去登录</router-link>
      <router-link to="/">返回首页</router-link>
    </div>
  </AuthShell>
</template>

<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Iphone, Lock, Message } from '@element-plus/icons-vue';
import AuthShell from '../components/AuthShell.vue';
import request from '../api/request';

const router = useRouter();
const form = reactive({ phone: '', smsCode: '', nickname: '', password: '', confirmPassword: '' });
const loading = ref(false);
const counting = ref(0);
let timer: any = null;

async function sendCode() {
  if (!/^1\d{10}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  try {
    await request.post('/auth/sms-code', { phone: form.phone });
    ElMessage.success('验证码已发送（测试环境为 123456）');
    counting.value = 60;
    timer = setInterval(() => {
      counting.value -= 1;
      if (counting.value <= 0) clearInterval(timer);
    }, 1000);
  } catch {
    // 已提示
  }
}

async function onRegister() {
  if (!/^1\d{10}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的手机号');
    return;
  }
  if (!form.nickname) {
    ElMessage.warning('请输入昵称');
    return;
  }
  if (form.password.length < 6) {
    ElMessage.warning('密码至少 6 位');
    return;
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次密码不一致');
    return;
  }
  loading.value = true;
  try {
    await request.post('/auth/register', {
      phone: form.phone,
      smsCode: form.smsCode,
      nickname: form.nickname,
      password: form.password,
    });
    ElMessage.success('注册成功，请登录');
    router.push('/login');
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped>
.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}

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
</style>
