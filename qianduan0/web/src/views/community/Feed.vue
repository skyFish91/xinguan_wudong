<template>
  <div class="feed-page">
    <TopNav />

    <div class="wd-container wd-page">
      <!-- 页头 -->
      <header class="page-head">
        <h1 class="page-title">游记广场</h1>
        <p class="page-sub">按最新或热度浏览，也可以跟着话题一路读下去</p>
      </header>

      <!-- 操作栏（液态玻璃吸顶） -->
      <div class="action-bar glass-strong">
        <div class="tab-group">
          <div
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab-item', { active: currentTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <el-button type="primary" @click="goPublish">
          <el-icon><Edit /></el-icon>
          发布游记
        </el-button>
      </div>

      <!-- 热门话题 -->
      <div class="topic-bar glass" v-if="topics.length">
        <span class="topic-label">热门话题</span>
        <span
          v-for="topic in topics"
          :key="topic.id"
          class="topic-pill"
          :class="{ active: selectedTopic === topic.id }"
          @click="filterByTopic(topic.id)"
        >
          # {{ topic.name || '未命名话题' }}
        </span>
        <span v-if="selectedTopic" class="topic-reset" @click="filterByTopic(selectedTopic)">
          清除筛选
        </span>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading && !posts.length" class="wd-waterfall">
        <SkeletonCard v-for="i in 8" :key="`s${i}`" variant="waterfall" cover="170px" />
      </div>

      <!-- 瀑布流 -->
      <div v-else-if="posts.length" class="wd-waterfall">
        <article
          v-for="(post, i) in posts"
          :key="post.id"
          class="wd-card wd-card-hover post-card wd-rise"
          :style="{ animationDelay: `${Math.min(i, 10) * 45}ms` }"
          @click="goToDetail(post.id)"
        >
          <div class="wd-media" :style="{ height: postHeight(post) + 'px' }">
            <img :src="img(post.cover, post.title)" :alt="post.title" @error="imgError" />
            <div class="video-badge wd-chip" v-if="post.videoUrl">
              <el-icon><VideoPlay /></el-icon> 视频
            </div>
            <div class="poi-badge wd-chip wd-chip-indigo" v-if="post.poiName">
              <el-icon><Location /></el-icon>
              <span class="poi-text">{{ post.poiName }}</span>
            </div>
          </div>

          <div class="wd-card-body">
            <h3 class="wd-title clamp-2">{{ post.title || '无标题' }}</h3>
            <p class="post-desc clamp-2" v-if="post.content">{{ post.content }}</p>

            <div class="post-topics" v-if="post.topics && post.topics.length">
              <span v-for="t in post.topics.slice(0, 2)" :key="t.id" class="mini-tag"># {{ t.name }}</span>
            </div>

            <div class="post-footer">
              <div class="author">
                <el-avatar :size="24" :src="post.userAvatar">{{ (post.userName || '旅').slice(0, 1) }}</el-avatar>
                <span class="author-name clamp-1">{{ post.userName }}</span>
              </div>
              <div class="stats">
                <span><el-icon><View /></el-icon> {{ formatCount(post.viewCount) }}</span>
                <span><el-icon><Star /></el-icon> {{ formatCount(post.likeCount) }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          :variant="selectedTopic ? 'search' : 'default'"
          :title="selectedTopic ? '这个话题下还没有游记' : '还没有人分享'"
          :desc="selectedTopic
            ? '换个话题看看，或者由你来写下第一篇。'
            : '成为第一个记录乌东的人吧——一张图、一段话都算数。'"
        >
          <el-button type="primary" @click="goPublish">写第一篇游记</el-button>
          <el-button v-if="selectedTopic" @click="filterByTopic(selectedTopic)">查看全部</el-button>
        </EmptyState>
      </div>

      <!-- 分页 -->
      <div class="pager-wrap" v-if="total > pageSize && posts.length">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadPosts"
        />
      </div>
    </div>

    <PublishDialog v-model="showPublish" @success="handlePublishSuccess" />
  </div>
</template>

<script setup>
import TopNav from '../../components/TopNav.vue';
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, View, Star, VideoPlay, Location } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
import SkeletonCard from '../../components/SkeletonCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { img, imgError } from '../../utils/media'
import PublishDialog from './components/PublishDialog.vue'

const router = useRouter()

const loading = ref(true)
const posts = ref([])
const topics = ref([])
const currentTab = ref('latest')
const selectedTopic = ref(null)
const showPublish = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const tabs = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'hot' },
]

// 瀑布流高度：按 id 稳定错落
const HEIGHTS = [190, 250, 210, 280, 200, 240, 220, 260]
const postHeight = (post) => HEIGHTS[(Number(post.id) || 0) % HEIGHTS.length]

const loadPosts = async () => {
  loading.value = true
  try {
    const res = await communityApi.getFeed({
      page: page.value,
      pageSize: pageSize.value,
      topicId: selectedTopic.value,
      sort: currentTab.value,
    })
    posts.value = res.list || []
    total.value = res.total || res.pagination?.total || posts.value.length
  } catch (error) {
    ElMessage.error('加载游记失败')
    posts.value = []
  } finally {
    loading.value = false
  }
}

const loadTopics = async () => {
  try {
    const res = await communityApi.getTopics()
    topics.value = (res.list || []).slice(0, 8)
  } catch (error) {
    console.error('加载话题失败:', error)
  }
}

const switchTab = (tab) => {
  currentTab.value = tab
  page.value = 1
  loadPosts()
}

const filterByTopic = (topicId) => {
  selectedTopic.value = selectedTopic.value === topicId ? null : topicId
  page.value = 1
  loadPosts()
}

const goToDetail = (id) => router.push(`/community/post/${id}`)
const goPublish = () => router.push('/community/publish')

const handlePublishSuccess = () => {
  showPublish.value = false
  page.value = 1
  loadPosts()
  ElMessage.success('发布成功！')
}

const formatCount = (count) => {
  const n = Number(count) || 0
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n
}

onMounted(() => {
  loadTopics()
  loadPosts()
})
</script>

<style scoped>
.feed-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* 页头 */
.page-head {
  padding-bottom: var(--wd-s5);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

/* 操作栏 */
.action-bar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--wd-s4);
  margin-bottom: var(--wd-s5);
  padding: 10px 16px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.tab-group {
  display: flex;
  gap: 4px;
}
.tab-item {
  padding: 8px 20px;
  border-radius: var(--wd-r-pill);
  font-size: 15px;
  color: var(--wd-text-2);
  cursor: pointer;
  transition: all 0.26s var(--wd-ease);
}
.tab-item:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.tab-item.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
}

/* 热门话题 */
.topic-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--wd-s6);
  padding: 12px 18px;
  border-radius: var(--wd-r-md);
}
.topic-label {
  margin-right: 4px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wd-text-4);
}
.topic-pill {
  padding: 6px 14px;
  border-radius: var(--wd-r-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--wd-text-2);
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--wd-border);
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.topic-pill:hover {
  transform: translateY(-2px);
  color: var(--wd-brand);
  border-color: rgba(var(--wd-brand-rgb), 0.28);
  box-shadow: var(--wd-sh-1);
}
.topic-pill.active {
  color: #fff;
  background: var(--wd-brand);
  border-color: var(--wd-brand);
}
.topic-reset {
  margin-left: 4px;
  font-size: 12.5px;
  color: var(--wd-text-4);
  cursor: pointer;
}
.topic-reset:hover {
  color: var(--wd-brand);
}

/* 卡片 */
.post-card .video-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}
.post-card .poi-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  max-width: calc(100% - 24px);
}
.poi-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.post-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--wd-text-3);
}
.post-topics {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.mini-tag {
  padding: 3px 10px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  color: var(--wd-indigo);
  background: #eef2f9;
}
.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--wd-border);
}
.post-footer .author {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.author-name {
  max-width: 90px;
}
.post-footer .stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--wd-text-4);
}
.post-footer .stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.pager-wrap {
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 0;
}

@media (max-width: 760px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--wd-r-lg);
  }
}
</style>
