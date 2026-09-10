<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">乌东文旅平台登录</h2>
      <el-form :model="form" label-width="0" @keyup.enter="onLogin">
        <el-form-item>
          <el-input v-model="form.phone" placeholder="手机号" maxlength="11" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="full" :loading="loading" @click="onLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div class="links">
        <router-link to="/register">注册新账号</router-link>
        <router-link to="/">返回首页</router-link>
      </div>
      <el-divider />
      <div class="demo-tips">
        演示账号：<br />
        游客 13800000001 / user123<br />
        商家 13800000002 / merchant123<br />
        管理员 13800000000 / admin123
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '../api/request';
import { useUserStore } from '../stores/user';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const form = reactive({ phone: '', password: '' });
const loading = ref(false);

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
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50, #34495e);
}
.login-card {
  width: 380px;
  padding: 20px;
}
.title {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}
.full {
  width: 100%;
}
.links {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}
.demo-tips {
  font-size: 12px;
  color: #999;
  line-height: 1.8;
}
</style>
