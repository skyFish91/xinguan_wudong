<template>
  <el-card>
    <div class="toolbar">
      <el-radio-group v-model="status" @change="load(1)">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="0">待审核</el-radio-button>
        <el-radio-button value="1">已通过</el-radio-button>
        <el-radio-button value="2">已驳回</el-radio-button>
      </el-radio-group>
      <div class="flex-1"></div>
      <el-tag size="small" type="info" effect="plain">共 {{ total }} 条</el-tag>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="shopName" label="店铺名" width="160" />
      <el-table-column label="模块" width="130">
        <template #default="{ row }">
          <el-tag size="small" effect="plain" :type="modalType(row.moduleType)">
            {{ moduleText(row.moduleType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="contact" label="联系人" width="110" />
      <el-table-column prop="contactPhone" label="联系电话" width="130" />
      <el-table-column prop="licenseNo" label="营业执照号" width="170" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'" size="small" effect="dark">
            {{ row.status === 0 ? '待审核' : row.status === 1 ? '已通过' : '已驳回' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <template v-if="row.status === 0">
            <el-button size="small" type="success" link @click="approve(row)">通过</el-button>
            <el-button size="small" type="danger" link @click="reject(row)">驳回</el-button>
          </template>
          <span v-else class="muted">{{ row.rejectReason || '—' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <EmptyState v-if="!loading && list.length === 0" type="data" description="暂无入驻申请" />

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
import request from '../api/request';
import EmptyState from '../components/EmptyState.vue';

const status = ref('');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);
const pageSize = 10;

function moduleText(m: string) {
  const map: Record<string, string> = { clothing: '衣·非遗好物', food: '食·餐饮美食', hotel: '住·民宿住宿', travel: '行·线路订票' };
  return map[m] || m;
}
function modalType(m: string): 'success' | 'warning' | 'primary' | 'info' | 'danger' {
  return ({ clothing: 'success', food: 'warning', hotel: 'primary', travel: 'info' } as any)[m] || 'info';
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/merchant-applies', {
      params: { status: status.value || undefined, page: page.value, pageSize },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function approve(row: any) {
  try {
    await ElMessageBox.confirm(`确定通过「${row.shopName}」的入驻申请？审核通过后该用户将成为商家。`, '提示', { type: 'warning' });
    await request.post(`/admin/merchant-applies/${row.id}/approve`);
    ElMessage.success('已通过');
    load(page.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

async function reject(row: any) {
  try {
    const { value } = await ElMessageBox.prompt('请填写驳回原因', '驳回申请');
    await request.post(`/admin/merchant-applies/${row.id}/reject`, { reason: value || '' });
    ElMessage.success('已驳回');
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
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px dashed var(--border-light);
}
.muted {
  color: var(--text-secondary);
  font-size: 12px;
}
.pager {
  margin-top: 18px;
  justify-content: flex-end;
}
</style>