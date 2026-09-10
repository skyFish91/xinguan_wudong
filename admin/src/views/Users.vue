<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索手机号/昵称" class="search" clearable :prefix-icon="Search" @keyup.enter="load(1)" />
      <el-select v-model="role" placeholder="全部角色" clearable class="select" @change="load(1)">
        <el-option label="普通用户" value="user" />
        <el-option label="商家" value="merchant" />
        <el-option label="管理员" value="admin" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="load(1)">查询</el-button>
      <div class="flex-1"></div>
      <el-tag size="small" type="info" effect="plain">共 {{ total }} 条</el-tag>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="头像" width="70">
        <template #default="{ row }">
          <CartoonAvatar :size="36" :variant="avatarVariant(row)" />
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="140" />
      <el-table-column prop="nickname" label="昵称" min-width="120" />
      <el-table-column label="角色" width="100">
        <template #default="{ row }">
          <el-tag :type="roleTagType(row.role)" size="small" effect="dark">{{ roleText(row.role) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="plain">
            {{ row.status === 1 ? '● 正常' : '● 已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="region" label="地区" width="120" />
      <el-table-column prop="createdAt" label="注册时间" width="160">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.role !== 'admin'"
            size="small"
            :type="row.status === 1 ? 'danger' : 'success'"
            link
            @click="toggleStatus(row)"
          >
            {{ row.status === 1 ? '禁用' : '解禁' }}
          </el-button>
          <span v-else class="text-placeholder">—</span>
        </template>
      </el-table-column>
    </el-table>

    <EmptyState v-if="!loading && list.length === 0" type="data" description="暂无用户数据" />

    <el-pagination
      layout="prev, pager, next, total"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      class="pager"
      @current-change="load"
    />
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import request from '../api/request';
import EmptyState from '../components/EmptyState.vue';
import CartoonAvatar from '../components/CartoonAvatar.vue';

const keyword = ref('');
const role = ref('');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const pageSize = 10;

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}
function roleText(r: string) {
  return r === 'admin' ? '管理员' : r === 'merchant' ? '商家' : '用户';
}
function roleTagType(r: string): 'danger' | 'warning' | 'info' {
  return r === 'admin' ? 'danger' : r === 'merchant' ? 'warning' : 'info';
}
function avatarVariant(row: any) {
  if (row.role === 'admin') return 'admin';
  if (row.role === 'merchant') return 'food';
  return 'user';
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/users', {
      params: { keyword: keyword.value || undefined, role: role.value || undefined, page: page.value, pageSize },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function toggleStatus(row: any) {
  const target = row.status === 1 ? 0 : 1;
  const tip = target === 0 ? '确定禁用该用户？' : '确定解禁该用户？';
  try {
    await ElMessageBox.confirm(tip, '提示', { type: 'warning' });
    await request.post(`/admin/users/${row.id}/status`, { status: target, banUntil: target === 0 ? '2099-01-01 00:00:00' : '' });
    ElMessage.success('操作成功');
    load(page.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

onMounted(() => load(1));
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-light);
}
.search {
  width: 240px;
}
.select {
  width: 140px;
}
.text-placeholder {
  color: var(--text-placeholder);
}
.pager {
  margin-top: 18px;
  justify-content: flex-end;
}
</style>