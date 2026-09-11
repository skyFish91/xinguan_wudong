<template>
  <div class="search-page">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 搜索框 -->
      <div class="search-hero">
        <h1 class="hero-title">搜索乌东</h1>
        <p class="hero-sub">游记、话题、旅人，一次搜个遍</p>

        <div class="search-box glass-strong">
          <el-input
            v-model="keyword"
            size="large"
            placeholder="试试「梯田」「银饰」「长桌宴」…"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleClear"
          >
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 未搜索：历史 + 热搜 -->
      <template v-if="!searched">
        <div class="wd-card panel" v-if="searchHistory.length">
          <div class="panel-head">
            <h3 class="panel-title">搜索历史</h3>
            <el-button text size="small" @click="clearHistory">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
          <div class="chip-wrap">
            <span
              v-for="(item, index) in searchHistory"
              :key="index"
              class="history-chip"
              @click="searchHistoryItem(item)"
            >
              {{ item }}
              <el-icon class="chip-close" @click.stop="removeHistory(index)"><Close /></el-icon>
            </span>
          </div>
        </div>

        <div class="wd-card panel" v-if="hotSearches.length">
          <div class="panel-head">
            <h3 class="panel-title">热门搜索</h3>
            <el-icon class="panel-icon"><TrendCharts /></el-icon>
          </div>
          <div class="hot-list">
            <div
              v-for="(item, index) in hotSearches"
              :key="index"
              class="hot-item"
              @click="searchHistoryItem(item.keyword)"
            >
              <span :class="['hot-rank', { top: index < 3 }]">{{ index + 1 }}</span>
              <span class="hot-keyword">{{ item.keyword }}</span>
              <el-icon v-if="item.trend === 'up'" class="trend up"><CaretTop /></el-icon>
              <el-icon v-if="item.trend === 'down'" class="trend down"><CaretBottom /></el-icon>
            </div>
          </div>
        </div>
      </template>

      <!-- 已搜索：结果区 -->
      <template v-else>
        <!-- Tab 切换（液态玻璃吸顶） -->
        <div class="result-bar glass-strong">
          <div class="result-tabs">
            <div
              v-for="tab in tabs"
              :key="tab.value"
              :class="['result-tab', { active: currentTab === tab.value }]"
              @click="switchTab(tab.value)"
            >
              {{ tab.label }}
              <span class="tab-count" v-if="getTabCount(tab.value)">{{ getTabCount(tab.value) }}</span>
            </div>
          </div>
          <span class="result-summary">
            “{{ keyword }}” 共找到 {{ formatCount(totalAll) }} 条结果
          </span>
        </div>

        <!-- 加载中 -->
        <div v-if="loading && !getCurrentList().length" class="wd-waterfall">
          <SkeletonCard v-for="i in 8" :key="`s${i}`" variant="waterfall" cover="160px" />
        </div>

        <!-- 游记结果（瀑布流） -->
        <div v-else-if="currentTab === 'posts' && posts.length" class="wd-waterfall">
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
            </div>
            <div class="wd-card-body">
              <h3 class="wd-title clamp-2" v-html="highlightKeyword(post.title)"></h3>
              <p class="post-desc clamp-2" v-html="highlightKeyword(post.content)"></p>
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

        <!-- 话题结果 -->
        <div v-else-if="currentTab === 'topics' && topics.length" class="result-list">
          <div
            v-for="(topic, i) in topics"
            :key="topic.id"
            class="wd-card wd-card-hover row-card wd-rise"
            :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
            @click="$router.push(`/community/topic/${topic.id}`)"
          >
            <div class="row-thumb">
              <img :src="img(topic.cover, topic.name, true)" :alt="topic.name" @error="imgError" />
            </div>
            <div class="row-main">
              <h3 class="row-title" v-html="highlightKeyword('# ' + topic.name)"></h3>
              <p class="row-desc clamp-2">{{ topic.intro || topic.description || '暂无简介' }}</p>
              <div class="row-meta">
                <span>{{ formatCount(topic.postCount) }} 篇游记</span>
                <span class="dot"></span>
                <span>{{ formatCount(topic.followCount) }} 人关注</span>
              </div>
            </div>
            <el-button
              class="row-action"
              :type="topic.isFollowed ? '' : 'primary'"
              round
              @click.stop="handleFollowTopic(topic)"
            >
              {{ topic.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>

        <!-- 用户结果 -->
        <div v-else-if="currentTab === 'users' && users.length" class="result-list">
          <div
            v-for="(user, i) in users"
            :key="user.id"
            class="wd-card wd-card-hover row-card wd-rise"
            :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
            @click="$router.push(`/community/user/${user.id}`)"
          >
            <el-avatar :size="60" :src="user.avatar" class="row-avatar">
              {{ (user.nickname || '旅').slice(0, 1) }}
            </el-avatar>
            <div class="row-main">
              <h3 class="row-title" v-html="highlightKeyword(user.nickname)"></h3>
              <p class="row-desc clamp-2">{{ user.bio || '这个人很懒，什么都没写' }}</p>
              <div class="row-meta">
                <span>{{ formatCount(user.postCount) }} 游记</span>
                <span class="dot"></span>
                <span>{{ formatCount(user.followerCount) }} 粉丝</span>
              </div>
            </div>
            <el-button
              class="row-action"
              :type="user.isFollowed ? '' : 'primary'"
              round
              @click.stop="handleFollowUser(user)"
            >
              {{ user.isFollowed ? '已关注' : '关注' }}
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="wd-card">
          <EmptyState
            variant="search"
            title="没有找到相关内容"
            desc="换个说法试试，比如只写关键词「梯田」「银饰」，或从热门话题进入。"
          >
            <el-button @click="handleClear">返回</el-button>
            <router-link to="/community"><el-button type="primary">去社区逛逛</el-button></router-link>
          </EmptyState>
        </div>

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore && getCurrentList().length">
          <el-button size="large" :loading="loading" @click="loadMore">
            {{ loading ? '加载中…' : '加载更多' }}
          </el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import PageBack from '../../components/PageBack.vue';
import SkeletonCard from '../../components/SkeletonCard.vue';
import EmptyState from '../../components/EmptyState.vue';
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Star, VideoPlay, Delete, Close, Search, TrendCharts, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
import { img, imgError } from '../../utils/media'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.q || '')
const currentTab = ref('posts')
const tabs = [
  { label: '游记', value: 'posts' },
  { label: '话题', value: 'topics' },
  { label: '用户', value: 'users' },
]

const posts = ref([])
const topics = ref([])
const users = ref([])
const postsTotal = ref(0)
const topicsTotal = ref(0)
const usersTotal = ref(0)

const loading = ref(false)
const searched = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

const searchHistory = ref([])
const hotSearches = ref([
  { keyword: '乌东古镇', trend: 'up' },
  { keyword: '苗族银饰', trend: 'up' },
  { keyword: '梯田摄影', trend: 'down' },
  { keyword: '长桌宴', trend: '' },
  { keyword: '蜡染体验', trend: 'up' },
])

const totalAll = computed(() => postsTotal.value + topicsTotal.value + usersTotal.value)

// 瀑布流高度：按 id 稳定错落
const HEIGHTS = [180, 240, 200, 270, 190, 230, 210, 250]
const postHeight = (post) => HEIGHTS[(Number(post.id) || 0) % HEIGHTS.length]

const getTabCount = (tab) => {
  switch (tab) {
    case 'posts': return postsTotal.value
    case 'topics': return topicsTotal.value
    case 'users': return usersTotal.value
    default: return 0
  }
}

const getCurrentList = () => {
  switch (currentTab.value) {
    case 'posts': return posts.value
    case 'topics': return topics.value
    case 'users': return users.value
    default: return []
  }
}

const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  saveHistory(keyword.value)
  router.push({ query: { q: keyword.value } })

  searched.value = true
  page.value = 1
  posts.value = []
  topics.value = []
  users.value = []

  await searchAll()
}

const handleClear = () => {
  keyword.value = ''
  searched.value = false
  posts.value = []
  topics.value = []
  users.value = []
  router.push({ query: {} })
}

const searchAll = async () => {
  loading.value = true
  try {
    const params = { keyword: keyword.value, page: page.value, pageSize }
    const [postsData, topicsData, usersData] = await Promise.all([
      communityApi.search({ ...params, type: 'post' }),
      communityApi.search({ ...params, type: 'topic' }),
      communityApi.search({ ...params, type: 'user' }),
    ])
    posts.value = postsData.list || []
    topics.value = topicsData.list || []
    users.value = usersData.list || []
    postsTotal.value = postsData.total || posts.value.length
    topicsTotal.value = topicsData.total || topics.value.length
    usersTotal.value = usersData.total || users.value.length
    hasMore.value = false
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

const switchTab = async (tab) => {
  currentTab.value = tab
  if (!searched.value) return
  // 首次搜索已拉全量三类，切 Tab 无需再请求
  hasMore.value = false
}

const loadTabContent = async (reset = false) => {
  if (loading.value) return
  loading.value = true
  try {
    if (reset) page.value = 1
    const params = {
      keyword: keyword.value,
      type: currentTab.value === 'posts' ? 'post' : currentTab.value.slice(0, -1),
      page: page.value,
      pageSize,
    }
    const data = await communityApi.search(params)
    const list = data.list || []
    switch (currentTab.value) {
      case 'posts':
        reset ? (posts.value = list) : posts.value.push(...list)
        postsTotal.value = data.total || 0
        hasMore.value = posts.value.length < postsTotal.value
        break
      case 'topics':
        reset ? (topics.value = list) : topics.value.push(...list)
        topicsTotal.value = data.total || 0
        hasMore.value = topics.value.length < topicsTotal.value
        break
      case 'users':
        reset ? (users.value = list) : users.value.push(...list)
        usersTotal.value = data.total || 0
        hasMore.value = users.value.length < usersTotal.value
        break
    }
    page.value++
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const loadMore = () => loadTabContent(false)

const handleFollowTopic = async (topic) => {
  try {
    await communityApi.followTopic(topic.id)
    topic.isFollowed = !topic.isFollowed
    topic.followCount = Math.max(0, (topic.followCount || 0) + (topic.isFollowed ? 1 : -1))
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleFollowUser = async (user) => {
  try {
    if (user.isFollowed) {
      await communityApi.unfollowUser(user.id)
      user.isFollowed = false
      user.followerCount = Math.max(0, (user.followerCount || 0) - 1)
    } else {
      await communityApi.followUser(user.id)
      user.isFollowed = true
      user.followerCount = (user.followerCount || 0) + 1
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

/** 高亮关键词：先转义再包裹，避免把用户输入当 HTML 执行 */
const highlightKeyword = (text) => {
  if (!text) return ''
  const safe = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const kw = keyword.value.trim()
  if (!kw) return safe
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return safe.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="hl">$1</mark>')
}

const loadHistory = () => {
  const history = localStorage.getItem('search_history')
  if (history) {
    try {
      searchHistory.value = JSON.parse(history) || []
    } catch {
      searchHistory.value = []
    }
  }
}

const saveHistory = (kw) => {
  const index = searchHistory.value.indexOf(kw)
  if (index > -1) searchHistory.value.splice(index, 1)
  searchHistory.value.unshift(kw)
  if (searchHistory.value.length > 10) searchHistory.value = searchHistory.value.slice(0, 10)
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

const removeHistory = (index) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

const clearHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search_history')
}

const searchHistoryItem = (item) => {
  keyword.value = item
  handleSearch()
}

const formatCount = (count) => {
  const n = Number(count) || 0
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n
}

onMounted(() => {
  loadHistory()
  if (keyword.value) handleSearch()
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* Hero */
.search-hero {
  padding: var(--wd-s6) 0 var(--wd-s7);
  text-align: center;
}
.hero-title {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.hero-sub {
  margin-top: 10px;
  font-size: 14px;
  color: var(--wd-text-3);
}
.search-box {
  max-width: 640px;
  margin: var(--wd-s6) auto 0;
  padding: 10px 12px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-2);
}
.search-box :deep(.el-input__wrapper) {
  box-shadow: none;
  background: transparent;
}
.search-box :deep(.el-input-group__append) {
  border: none;
  background: transparent;
  box-shadow: none;
}

/* 面板（历史/热搜） */
.panel {
  padding: var(--wd-s5) var(--wd-s6);
  margin-bottom: var(--wd-s5);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--wd-s4);
}
.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.panel-icon {
  color: var(--wd-text-4);
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.history-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--wd-r-pill);
  font-size: 13px;
  color: var(--wd-text-2);
  background: #f1f3f7;
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.history-chip:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
  transform: translateY(-2px);
}
.chip-close {
  font-size: 12px;
  color: var(--wd-text-4);
}
.chip-close:hover {
  color: var(--wd-brand);
}

.hot-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px;
}
.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--wd-r-xs);
  cursor: pointer;
  transition: background 0.24s var(--wd-ease);
}
.hot-item:hover {
  background: #f7f9fc;
}
.hot-rank {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--wd-r-xs);
  font-size: 13px;
  font-weight: 700;
  color: var(--wd-text-3);
  background: #f1f3f7;
}
.hot-rank.top {
  color: #fff;
  background: linear-gradient(135deg, var(--wd-brand-400), var(--wd-brand-600));
}
.hot-keyword {
  flex: 1;
  font-size: 14.5px;
  color: var(--wd-text-2);
}
.hot-item:hover .hot-keyword {
  color: var(--wd-brand);
}
.trend.up {
  color: var(--wd-brand-400);
}
.trend.down {
  color: #1e7a45;
}

/* 结果栏 */
.result-bar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s4);
  margin-bottom: var(--wd-s6);
  padding: 10px 16px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.result-tabs {
  display: flex;
  gap: 4px;
}
.result-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--wd-r-pill);
  font-size: 15px;
  color: var(--wd-text-2);
  cursor: pointer;
  transition: all 0.26s var(--wd-ease);
}
.result-tab:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.result-tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
}
.tab-count {
  padding: 0 7px;
  border-radius: var(--wd-r-pill);
  font-size: 11.5px;
  background: rgba(255, 255, 255, 0.28);
}
.result-tab:not(.active) .tab-count {
  color: var(--wd-text-3);
  background: #f1f3f7;
}
.result-summary {
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 游记卡片 */
.post-card .video-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}
.post-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--wd-text-3);
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

/* 话题 / 用户行卡片 */
.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-s4);
}
.row-card {
  display: flex;
  align-items: center;
  gap: var(--wd-s5);
  padding: var(--wd-s4) var(--wd-s5);
}
.row-thumb {
  flex-shrink: 0;
  width: 128px;
  height: 92px;
  border-radius: var(--wd-r-sm);
  overflow: hidden;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.row-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--wd-ease);
}
.row-card:hover .row-thumb img {
  transform: scale(1.06);
}
.row-avatar {
  flex-shrink: 0;
}
.row-main {
  flex: 1;
  min-width: 0;
}
.row-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--wd-text-1);
  transition: color var(--wd-dur) var(--wd-ease);
}
.row-card:hover .row-title {
  color: var(--wd-brand);
}
.row-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--wd-text-3);
}
.row-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 12.5px;
  color: var(--wd-text-4);
}
.row-meta .dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--wd-border-strong);
}
.row-action {
  flex-shrink: 0;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 0;
}

:deep(mark.hl) {
  padding: 0 2px;
  border-radius: 4px;
  color: var(--wd-brand);
  font-weight: 700;
  background: var(--wd-brand-soft);
}

@media (max-width: 760px) {
  .result-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--wd-r-lg);
  }
  .row-card {
    flex-wrap: wrap;
  }
  .row-thumb {
    width: 96px;
    height: 72px;
  }
}
</style>
