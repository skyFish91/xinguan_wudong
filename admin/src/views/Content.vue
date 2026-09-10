<template>
  <el-card>
    <el-tabs v-model="tab" @tab-change="reload">
      <!-- 帖子审核 -->
      <el-tab-pane label="游记审核" name="posts">
        <div class="toolbar">
          <el-select v-model="postStatus" placeholder="全部状态" clearable class="select" @change="loadPosts(1)">
            <el-option label="待审核" value="0" />
            <el-option label="已过审" value="1" />
            <el-option label="已驳回" value="2" />
          </el-select>
          <el-input v-model="postKeyword" placeholder="搜索标题/内容" class="search" clearable @keyup.enter="loadPosts(1)" />
          <el-button type="primary" @click="loadPosts(1)">查询</el-button>
          <div class="flex-1"></div>
          <el-tag size="small" type="info" effect="plain">共 {{ postTotal }} 条</el-tag>
        </div>
        <el-table :data="posts" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="title" label="标题" min-width="200" />
          <el-table-column label="作者" width="110">
            <template #default="{ row }">{{ row.author?.nickname || row.userId }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'warning'" size="small" effect="dark">
                {{ row.status === 0 ? '待审核' : row.status === 1 ? '已过审' : '已驳回' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 0">
                <el-button size="small" type="success" link @click="auditPost(row, true)">通过</el-button>
                <el-button size="small" type="danger" link @click="auditPost(row, false)">驳回</el-button>
              </template>
              <el-button size="small" type="warning" link @click="toggleHot(row)">{{ row.isHot ? '取消热门' : '设为热门' }}</el-button>
              <el-button size="small" type="danger" link @click="deletePost(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <EmptyState v-if="!loading && posts.length === 0" type="data" description="暂无游记" />
        <el-pagination
          layout="prev, pager, next, total"
          :total="postTotal"
          :page-size="10"
          :current-page="postPage"
          class="pager"
          @current-change="loadPosts"
        />
      </el-tab-pane>

      <!-- 评论 -->
      <el-tab-pane label="评论管理" name="comments">
        <el-table :data="comments" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="用户" width="110">
            <template #default="{ row }">{{ row.user?.nickname || row.userId }}</template>
          </el-table-column>
          <el-table-column prop="content" label="内容" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small" effect="dark">
                {{ row.status === 1 ? '正常' : '已隐藏' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link :type="row.status === 1 ? 'danger' : 'success'" @click="toggleComment(row)">
                {{ row.status === 1 ? '隐藏' : '恢复' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <EmptyState v-if="!loading && comments.length === 0" type="data" description="暂无评论" />
        <el-pagination
          layout="prev, pager, next, total"
          :total="commentTotal"
          :page-size="10"
          :current-page="commentPage"
          class="pager"
          @current-change="loadComments"
        />
      </el-tab-pane>

      <!-- 举报 -->
      <el-tab-pane label="举报处理" name="reports">
        <el-table :data="reports" v-loading="loading" stripe>
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column label="举报人" width="110">
            <template #default="{ row }">{{ row.reporter || row.reportUserId }}</template>
          </el-table-column>
          <el-table-column label="对象" width="160">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ row.targetType }} #{{ row.targetId }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="原因" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small" effect="dark">
                {{ row.status === 0 ? '待处理' : '已处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 0">
                <el-button size="small" type="danger" link @click="handleReport(row, true)">下架内容</el-button>
                <el-button size="small" type="success" link @click="handleReport(row, false)">驳回举报</el-button>
              </template>
              <span v-else class="muted">{{ row.handleNote || '—' }}</span>
            </template>
          </el-table-column>
        </el-table>
        <EmptyState v-if="!loading && reports.length === 0" type="data" description="暂无举报" />
        <el-pagination
          layout="prev, pager, next, total"
          :total="reportTotal"
          :page-size="10"
          :current-page="reportPage"
          class="pager"
          @current-change="loadReports"
        />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../api/request';
import EmptyState from '../components/EmptyState.vue';

const tab = ref('posts');
const loading = ref(false);

// 帖子
const postStatus = ref('');
const postKeyword = ref('');
const posts = ref<any[]>([]);
const postTotal = ref(0);
const postPage = ref(1);

// 评论
const comments = ref<any[]>([]);
const commentTotal = ref(0);
const commentPage = ref(1);

// 举报
const reports = ref<any[]>([]);
const reportTotal = ref(0);
const reportPage = ref(1);

async function loadPosts(p = 1) {
  postPage.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/community/posts', {
      params: { status: postStatus.value || undefined, keyword: postKeyword.value || undefined, page: postPage.value, pageSize: 10 },
    });
    posts.value = data.list || [];
    postTotal.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function auditPost(row: any, approve: boolean) {
  try {
    await request.post(`/admin/community/posts/${row.id}/audit`, { approve });
    ElMessage.success(approve ? '已通过' : '已驳回');
    loadPosts(postPage.value);
  } catch {
    // 已提示
  }
}

async function toggleHot(row: any) {
  try {
    await request.post(`/admin/community/posts/${row.id}/hot`, { isHot: !row.isHot });
    ElMessage.success(row.isHot ? '已取消热门' : '已设为热门');
    loadPosts(postPage.value);
  } catch {
    // 已提示
  }
}

async function deletePost(row: any) {
  try {
    await ElMessageBox.confirm(`确定删除游记「${row.title}」？`, '提示', { type: 'warning' });
    await request.post(`/admin/community/posts/${row.id}/delete`);
    ElMessage.success('已删除');
    loadPosts(postPage.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

async function loadComments(p = 1) {
  commentPage.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/community/comments', {
      params: { page: commentPage.value, pageSize: 10 },
    });
    comments.value = data.list || [];
    commentTotal.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function toggleComment(row: any) {
  try {
    await request.post(`/admin/community/comments/${row.id}/status`, { status: row.status === 1 ? 0 : 1 });
    ElMessage.success(row.status === 1 ? '已隐藏' : '已恢复');
    loadComments(commentPage.value);
  } catch {
    // 已提示
  }
}

async function loadReports(p = 1) {
  reportPage.value = p;
  loading.value = true;
  try {
    const data: any = await request.get('/admin/community/reports', {
      params: { page: reportPage.value, pageSize: 10 },
    });
    reports.value = data.list || [];
    reportTotal.value = data.total || 0;
  } catch {
    // 已提示
  } finally {
    loading.value = false;
  }
}

async function handleReport(row: any, accept: boolean) {
  try {
    const { value } = await ElMessageBox.prompt(accept ? '下架理由（必填）' : '驳回理由（选填）', '处理举报', {
      inputValidator: (v) => (accept ? !!v : true),
    });
    await request.post(`/admin/community/reports/${row.id}/handle`, { accept, note: value || '' });
    ElMessage.success('已处理');
    loadReports(reportPage.value);
  } catch (e: any) {
    // 取消或已提示
  }
}

function reload() {
  if (tab.value === 'posts') loadPosts(1);
  if (tab.value === 'comments') loadComments(1);
  if (tab.value === 'reports') loadReports(1);
}

onMounted(() => {
  loadPosts(1);
  loadComments(1);
});
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
.select { width: 140px; }
.search { width: 240px; }
.muted {
  color: var(--text-secondary);
  font-size: 12px;
}
.pager {
  margin-top: 18px;
  justify-content: flex-end;
}
</style>