<template>
  <div class="community-page">
    <TopNav />

    <div class="page-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">社区分享</h1>
        <p class="page-description">记录旅行故事 · 分享旅途见闻</p>
      </div>

      <!-- 话题标签 -->
      <div class="topics-section" v-if="topics.length">
        <div class="topics-list">
          <div
            v-for="t in topics"
            :key="t.id"
            class="topic-tag"
            :class="{ active: currentTopic === t.id }"
            @click="onTopic(t)"
          >
            {{ t.name }}
          </div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="tab-buttons">
          <div
            class="tab-button"
            :class="{ active: tab === 'all' }"
            @click="tab = 'all'; load(1)"
          >
            最新
          </div>
          <div
            class="tab-button"
            :class="{ active: tab === 'hot' }"
            @click="tab = 'hot'; load(1)"
          >
            热门
          </div>
          <div
            class="tab-button"
            :class="{ active: tab === 'follow' }"
            @click="tab = 'follow'; load(1)"
          >
            关注
          </div>
        </div>
        <el-button type="primary" class="publish-btn" @click="$router.push('/community/publish')">
          发布游记
        </el-button>
      </div>

      <!-- 帖子列表 -->
      <el-empty v-if="!loading && !list.length" description="暂无游记" />

      <div v-else class="posts-list">
        <div
          v-for="p in list"
          :key="p.id"
          class="post-card"
          @click="$router.push(`/community/${p.id}`)"
        >
          <div v-if="firstImage(p.images)" class="post-image-wrapper">
            <img :src="firstImage(p.images)" class="post-image" />
          </div>

          <div class="post-content-wrapper">
            <div class="post-header">
              <h3 class="post-title">
                <span v-if="p.isHot" class="hot-badge">热门</span>
                {{ p.title }}
              </h3>
            </div>

            <div class="post-excerpt">{{ p.content }}</div>

            <div class="post-footer">
              <div class="author-info">
                <div class="author-avatar">
                  {{ (p.author?.nickname || `用户${p.userId}`).charAt(0) }}
                </div>
                <div class="author-detail">
                  <span class="author-name">{{ p.author?.nickname || `用户${p.userId}` }}</span>
                  <span class="post-time">{{ formatTime(p.publishedAt || p.createdAt) }}</span>
                </div>
              </div>

              <div class="post-stats">
                <span class="stat-item">{{ p.likeCount }} 赞</span>
                <span class="stat-item">{{ p.commentCount }} 评论</span>
                <span class="stat-item">{{ p.viewCount }} 浏览</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination-wrapper">
        <el-pagination
          layout="prev, pager, next, jumper, total"
          :total="total"
          :page-size="pageSize"
          :current-page="page"
          @current-change="load"
        />
      </div>
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
    const data: any = await request.get('/app/note/list', {
      params: {
        sort: tab.value === 'hot' ? 'hot' : 'new',
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
    topics.value = await request.get('/app/topic/list');
  } catch {
    // 已提示
  }
  load(1);
});
</script>

<style scoped>
.community-page {
  background: #ffffff;
  min-height: 100vh;
}

/* 页面容器 */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

/* 页面标题 */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 400;
  color: #333;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.page-description {
  font-size: 14px;
  color: #999;
  font-weight: 300;
}

/* 话题区域 */
.topics-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e5e5;
}

.topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.topic-tag {
  padding: 6px 16px;
  background: #f9f9f9;
  border: 1px solid transparent;
  border-radius: 2px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-tag:hover {
  background: #f0f0f0;
  color: #333;
}

.topic-tag.active {
  background: #8b7355;
  border-color: #8b7355;
  color: #fff;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.tab-buttons {
  display: flex;
  gap: 16px;
}

.tab-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: color 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #333;
}

.tab-button.active {
  color: #333;
  border-bottom-color: #8b7355;
  font-weight: 500;
}

.publish-btn {
  border-radius: 4px;
  padding: 0 24px;
}

/* 帖子列表 */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.post-card {
  display: flex;
  gap: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  padding: 16px;
  border: 1px solid transparent;
  border-radius: 4px;
}

.post-card:hover {
  transform: translateY(-2px);
  border-color: #e5e5e5;
  background: #fafafa;
}

.post-image-wrapper {
  width: 280px;
  height: 200px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f9f9f9;
  border-radius: 4px;
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.post-card:hover .post-image {
  transform: scale(1.05);
}

.post-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}

.post-header {
  margin-bottom: 12px;
}

.post-title {
  font-size: 18px;
  font-weight: 400;
  color: #333;
  line-height: 1.4;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hot-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  background: #8b7355;
  color: #fff;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.post-excerpt {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: auto;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e5e5;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #8b7355;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  flex-shrink: 0;
}

.author-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 13px;
  color: #999;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 48px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 4px;
  margin: 0 4px;
  min-width: 32px;
}

:deep(.el-pagination .el-pager li.is-active) {
  background: #8b7355;
  color: #fff;
}

:deep(.el-pagination button) {
  border-radius: 4px;
}

/* 响应式 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .tab-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .publish-btn {
    width: 100%;
  }

  .post-card {
    flex-direction: column;
    gap: 16px;
  }

  .post-image-wrapper {
    width: 100%;
    height: 200px;
  }
}
</style>
