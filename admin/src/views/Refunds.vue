<template>
  <el-card>
    <div class="toolbar">
      <el-radio-group v-model="status" @change="load(1)">
        <el-radio-button value="">全部</el-radio-button>
        <el-radio-button value="0">
          待审核
          <el-badge v-if="statusCount[0]" :value="statusCount[0]" class="badge" />
        </el-radio-button>
        <el-radio-button value="1">已通过</el-radio-button>
        <el-radio-button value="2">已驳回</el-radio-button>
      </el-radio-group>
      <div class="flex-1"></div>
      <el-tag size="small" type="info" effect="plain">共 {{ total }} 条</el-tag>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="refundNo" label="退款单号" width="170" />
      <el-table-column prop="orderNo" label="订单号" width="170" />
      <el-table-column label="订单类型" width="100">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ orderTypeText(row.orderType) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userNickname" label="申请人" width="110" />
      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          <span class="money">¥{{ row.amount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="原因" />
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
            <el-button size="small" type="success" link @click="handle(row, true)">同意退款</el-button>
            <el-button size="small" type="danger" link @click="handle(row, false)">驳回</el-button>
          </template>
          <span v-else class="muted">{{ row.handleNote || '—' }}</span>
        </template>
      </el-table-column>
    </el-table>

    <EmptyState v-if="!loading && list.length === 0" type="data" description="暂无退款记录" />

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
const statusCount = ref<Record<number, number>>({});

function orderTypeText(t: string) {
  const map: Record<string, string> = { goods: '实物商品', meal: '餐位预订', hotel: '住宿预订', ticket: '门票', route: '路线' };
  return map[t] || t;
}

async function load(p = 1) {
  page.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/refunds', {
      params: { status: status.value || undefined, page: page.value, pageSize },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
    // 计算各状态数量（简单近似）
    if (!status.value) {
      const all: any = await request.get('/admin/refunds', { params: { status: 0, pageSize: 999 } });
      statusCount.value = { 0: all.total || 0 };
    }
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function handle(row: any, approve: boolean) {
  const tip = approve ? '同意退款将回补库存并原路退款，确定？' : '确定驳回该退款申请？';
  try {
    const { value } = await ElMessageBox.prompt(tip, '审批', {
      inputPlaceholder: approve ? '处理备注（选填）' : '驳回原因',
    });
    await request.post(`/admin/refunds/${row.id}/handle`, { approve, note: value || '' });
    ElMessage.success('已处理');
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
.badge {
  margin-left: 4px;
}
.money {
  color: var(--color-danger);
  font-weight: 600;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
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