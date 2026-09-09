<template>
  <div>
    <TopNav />
    <div class="page">
      <!-- 话题 -->
      <div class="topics" v-if="topics.length">
        <el-tag
          v-for="t in topics"
          :key="t.id"
          :effect="currentTopic === t.id ? 'dark' : 'plain'"
          :type="currentTopic === t.id ? 'danger' : 'info'"
          class="topic-tag"
          @click="onTopic(t)"
        >
          #{{ t.name }}
        </el-tag>
      </div>

      <div class="toolbar">
        <el-radio-group v-model="tab" @change="load(1)">
          <el-radio-button value="all">最新</el-radio-button>
          <el-radio-button value="hot">热门</el-radio-button>
          <el-radio-button value="follow">关注</el-radio-button>
        </el-radio-group>
        <el-button type="primary" class="publish-btn" @click="$router.push('/community/publish')">发布游记</el-button>
      </div>

      <el-empty v-if="!loading && !list.length" description="暂无游记" />
      <div v-for="p in list" :key="p.id" class="post" @click="$router.push(`/community/${p.id}`)">
        <img v-if="firstImage(p.images)" :src="firstImage(p.images)" class="post-img" />
        <div class="post-main">
          <div class="post-title">
            <el-tag v-if="p.isHot" size="small" type="danger" class="hot-tag">热门</el-tag>
            {{ p.title }}
          </div>
          <div class="post-content">{{ p.content }}</div>
          <div class="post-meta">
            <span>{{ p.author?.nickname || `用户${p.userId}` }}</span>
            <span>{{ formatTime(p.publishedAt || p.createdAt) }}</span>
            <span v-if="p.topicId">#话题</span>
            <span class="counts">赞 {{ p.likeCount }} · 评论 {{ p.commentCount }} · 浏览 {{ p.viewCount }}</span>
          </div>
        </div>
      </div>

      <el-pagination
        v-if="total > pageSize"
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        class="pager"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import TopNav from '../../components/TopNav.vue';
import request from '../../api/request';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const userStore = useUserStore();
const topics = ref<any[]>([]);
const currentTopic = ref<number>(0);
const tab = ref('all');
const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = 10;
const loading = ref(false);

function firstImage(images: string) {
  try {
    const arr = JSON.parse(images || '[]');
    return arr.length ? arr[0] : '';
  } catch {
    return '';
  }
}

function formatTime(t: string) {
  return t ? String(t).replace('T', ' ').slice(0, 16) : '';
}

function onTopic(t: any) {
  currentTopic.value = currentTopic.value === t.id ? 0 : t.id;
  load(1);
}

async function load(p = 1) {
  page.value = p;
  if (tab.value === 'follow' && !userStore.isLogin) {
    ElMessage.warning('请先登录后查看关注内容');
    tab.value = 'all';
  }
  loading.value = true;
  try {
    const data: any = await request.get('/community/posts', {
      params: {
        tab: tab.value === 'follow' ? 'follow' : tab.value === 'hot' ? 'hot' : undefined,
        topicId: currentTopic.value || undefined,
        page: page.value,
        pageSize,
      },
    });
    list.value = data.list || [];
    total.value = data.total || 0;
  } catch (err: any) {
    // 关注 tab 未登录时后端会报错
    if (tab.value === 'follow' && !userStore.isLogin) {
      ElMessage.warning('请先登录后查看关注内容');
      tab.value = 'all';
    }
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    topics.value = await request.get('/community/topics');
  } catch {
    // 已提示
  }
  load(1);
});
</script>

<style scoped>
.page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.topics {
  margin-bottom: 14px;
}
.topic-tag {
  margin-right: 8px;
  cursor: pointer;
}
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.publish-btn {
  margin-left: auto;
}
.post {
  display: flex;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
}
.post:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.post-img {
  width: 160px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
.post-main {
  flex: 1;
  overflow: hidden;
}
.post-title {
  font-weight: 600;
  font-size: 15px;
}
.hot-tag {
  margin-right: 6px;
}
.post-content {
  color: #666;
  font-size: 13px;
  margin-top: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.post-meta {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 14px;
}
.counts {
  margin-left: auto;
}
.pager {
  margin-top: 20px;
  justify-content: center;
}
</style>
