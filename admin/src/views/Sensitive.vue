<template>
  <el-card>
    <div class="toolbar">
      <el-input v-model="word" placeholder="输入敏感词" class="search" :prefix-icon="Search" @keyup.enter="addWord" />
      <el-button type="primary" @click="addWord">添加敏感词</el-button>
    </div>

    <div class="word-stat">
      <el-tag size="small" type="info" effect="plain">共 {{ words.length }} 个敏感词</el-tag>
    </div>

    <div class="words">
      <el-tag
        v-for="w in words"
        :key="w.id"
        closable
        effect="dark"
        type="danger"
        class="word-tag"
        @close="removeWord(w)"
      >
        {{ w.word }}
      </el-tag>
    </div>

    <EmptyState v-if="!words.length" type="data" description="暂无敏感词" />

    <div class="tip">
      <el-icon><InfoFilled /></el-icon>
      用户发布游记/评论时命中敏感词将自动进入人工审核。
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, InfoFilled } from '@element-plus/icons-vue';
import request from '../api/request';
import EmptyState from '../components/EmptyState.vue';

const words = ref<any[]>([]);
const word = ref('');

async function load() {
  try {
    words.value = await request.get('/admin/sensitive-words');
  } catch {
    // 已提示
  }
}

async function addWord() {
  if (!word.value.trim()) {
    ElMessage.warning('请输入敏感词');
    return;
  }
  try {
    await request.post('/admin/sensitive-words/add', { word: word.value.trim() });
    ElMessage.success('已添加');
    word.value = '';
    load();
  } catch {
    // 已提示
  }
}

async function removeWord(w: any) {
  try {
    await ElMessageBox.confirm(`确定删除敏感词「${w.word}」？`, '提示', { type: 'warning' });
    await request.post(`/admin/sensitive-words/${w.id}/delete`);
    ElMessage.success('已删除');
    load();
  } catch (e: any) {
    // 取消或已提示
  }
}

onMounted(load);
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
  width: 280px;
}
.word-stat {
  margin-bottom: 14px;
}
.words {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: 60px;
}
.word-tag {
  font-size: 13px;
  padding: 0 14px;
  height: 32px;
  line-height: 32px;
}
.tip {
  margin-top: 20px;
  padding: 12px 16px;
  background: var(--color-accent-soft);
  border-radius: var(--radius-base);
  color: var(--text-regular);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.tip .el-icon {
  color: var(--color-accent);
}
</style>