<template>
  <div class="community-page">
    <TopNav />
    <div class="container">
      <!-- 页头 -->
      <header class="page-head">
        <h1 class="page-title">社区分享</h1>
        <p class="page-sub">旅人的真实记录——路线、避坑、光影与小店</p>
      </header>

      <!-- 筛选栏（液态玻璃吸顶） -->
      <div class="filter-bar glass-strong">
        <div class="filter-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.value"
            :class="['filter-tab', { active: currentTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <div class="filter-actions">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索游记、话题"
            prefix-icon="Search"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" @click="$router.push('/community/publish')">
            <el-icon><Edit /></el-icon>
            发布游记
          </el-button>
        </div>
      </div>

      <!-- 热门话题 -->
      <div class="topic-bar glass" v-if="hotTopics.length">
        <span class="topic-label">热门话题</span>
        <span
          v-for="topic in hotTopics"
          :key="topic.id"
          class="topic-pill"
          :class="{ active: selectedTopicId === topic.id }"
          @click="goToTopic(topic.id)"
        >
          # {{ topic.name }}
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
          @click="$router.push(`/community/${post.id}`)"
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
            <h3 class="wd-title clamp-2">{{ post.title }}</h3>
            <p class="post-desc clamp-2">{{ post.content }}</p>

            <div class="post-topics" v-if="post.topics && post.topics.length">
              <span v-for="topic in post.topics.slice(0, 2)" :key="topic.id" class="mini-tag">
                # {{ topic.name }}
              </span>
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
          variant="search"
          title="还没有人分享"
          desc="成为第一个记录乌东的人吧——一张图、一段话都算数。"
        >
          <router-link to="/community/publish">
            <el-button type="primary">写第一篇游记</el-button>
          </router-link>
        </EmptyState>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && posts.length">
        <el-button size="large" :loading="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </el-button>
      </div>
      <div class="list-end" v-else-if="posts.length">— 已经到底啦 —</div>
    </div>

    <!-- 发布游记对话框 -->
    <PublishDialog v-model="showPublishDialog" @success="handlePublishSuccess" />
  </div>
</template>

<script setup>
import TopNav from '../../components/TopNav.vue';
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, View, Star, ChatDotRound, VideoPlay, Location } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
import SkeletonCard from '../../components/SkeletonCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { img, imgError } from '../../utils/media'
import PublishDialog from './components/PublishDialog.vue'

const $router = useRouter()

const currentTab = ref('hot')
const tabs = [
  { label: '推荐', value: 'hot' },
  { label: '最新', value: 'new' },
  { label: '关注', value: 'follow' }
]

const posts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

const searchKeyword = ref('')
const selectedTopicId = ref(null)
const hotTopics = ref([])
const showPublishDialog = ref(false)

// 瀑布流高度：按 id 稳定错落，模拟小红书的高低节奏
const HEIGHTS = [190, 250, 210, 280, 200, 240, 220, 260]
const postHeight = (post) => HEIGHTS[(Number(post.id) || 0) % HEIGHTS.length]

// 加载游记列表
const loadPosts = async (reset = false) => {
  if (loading.value) return

  loading.value = true
  try {
    if (reset) {
      page.value = 1
      posts.value = []
    }

    const params = {
      sort: currentTab.value,
      page: page.value,
      pageSize,
      topicId: selectedTopicId.value,
      keyword: searchKeyword.value
    }

    const data = await communityApi.getFeed(params)

    if (reset) {
      posts.value = data.list || []
    } else {
      posts.value.push(...(data.list || []))
    }

    hasMore.value = posts.value.length < (data.total || 0)
    page.value++
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 切换 Tab
const switchTab = (tab) => {
  currentTab.value = tab
  selectedTopicId.value = null
  loadPosts(true)
}

// 搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    $router.push({ path: '/community/search', query: { q: searchKeyword.value } })
  }
}

// 按话题筛选
const filterByTopic = (topicId) => {
  if (selectedTopicId.value === topicId) {
    selectedTopicId.value = null
    loadPosts(true)
  } else {
    // 跳转到话题详情页
    $router.push(`/community/topic/${topicId}`)
  }
}

// 跳转话题详情页
const goToTopic = (topicId) => {
  $router.push(`/community/topic/${topicId}`)
}

// 加载更多
const loadMore = () => {
  loadPosts(false)
}

// 加载热门话题
const loadHotTopics = async () => {
  try {
    const data = await communityApi.getTopics()
    hotTopics.value = (data.list || []).slice(0, 8)
  } catch (error) {
    console.error('加载话题失败', error)
  }
}

// 发布成功
const handlePublishSuccess = () => {
  ElMessage.success('发布成功')
  loadPosts(true)
}

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
}

onMounted(() => {
  loadPosts(true)
  loadHotTopics()
})
</script>

<style lang="scss" scoped>
.community-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s10);
}

/* 页头 */
.page-head {
  padding: var(--wd-s7) 0 var(--wd-s5);
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

/* 筛选栏 */
.filter-bar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: var(--wd-s5);
  padding: 10px 16px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);

  .filter-tabs {
    display: flex;
    gap: 4px;

    .filter-tab {
      padding: 8px 18px;
      border-radius: var(--wd-r-pill);
      font-size: 15px;
      color: var(--wd-text-2);
      cursor: pointer;
      transition: all 0.26s var(--wd-ease);

      &:hover {
        color: var(--wd-brand);
        background: var(--wd-brand-soft);
      }

      &.active {
        color: #fff;
        font-weight: 600;
        background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
        box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
      }
    }
  }

  .filter-actions {
    display: flex;
    gap: 12px;
    align-items: center;

    .search-input {
      width: 240px;
    }
  }
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--wd-text-4);
  text-transform: uppercase;
  margin-right: 4px;
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

  &:hover {
    transform: translateY(-2px);
    color: var(--wd-brand);
    border-color: rgba(var(--wd-brand-rgb), 0.28);
    box-shadow: var(--wd-sh-1);
  }

  &.active {
    color: #fff;
    background: var(--wd-brand);
    border-color: var(--wd-brand);
  }
}

/* 帖子卡片 */
.post-card {
  .video-badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }
  .poi-badge {
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

  .author {
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
  .stats {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    font-size: 12px;
    color: var(--wd-text-4);

    span {
      display: flex;
      align-items: center;
      gap: 3px;
    }
  }
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: var(--wd-s8) 0 var(--wd-s3);
}
.list-end {
  text-align: center;
  padding: var(--wd-s7) 0;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

@media (max-width: 900px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--wd-r-lg);
  }
  .filter-bar .filter-actions .search-input {
    width: 100%;
  }
}
</style>
