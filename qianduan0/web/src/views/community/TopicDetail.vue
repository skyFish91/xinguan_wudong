<template>
  <div class="topic-detail-page">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 话题头图 + 玻璃浮层 -->
      <header class="topic-hero wd-card">
        <div class="hero-media">
          <img :src="img(topic.cover, topic.name, true)" :alt="topic.name" @error="imgError" />
          <div class="hero-overlay">
            <div class="hero-info">
              <h1 class="hero-name"># {{ topic.name }}</h1>
              <p class="hero-desc" v-if="topic.intro || topic.description">
                {{ topic.intro || topic.description }}
              </p>
              <div class="hero-stats">
                <span class="stat-item">
                  <strong>{{ formatCount(topic.postCount) }}</strong> 篇游记
                </span>
                <span class="stat-item">
                  <strong>{{ formatCount(topic.followCount) }}</strong> 人关注
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-actions">
          <el-button
            :type="topic.isFollowed ? '' : 'primary'"
            round
            size="large"
            @click="handleFollow"
          >
            <el-icon v-if="!topic.isFollowed"><Plus /></el-icon>
            {{ topic.isFollowed ? '已关注' : '关注话题' }}
          </el-button>
          <el-button round size="large" @click="$router.push('/community/publish')">
            <el-icon><Edit /></el-icon>
            发布游记
          </el-button>
        </div>
      </header>

      <!-- 排序栏 -->
      <div class="sort-bar glass-strong">
        <div class="sort-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.value"
            :class="['sort-tab', { active: currentTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <span class="sort-hint">共 {{ formatCount(topic.postCount) }} 篇</span>
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
          @click="$router.push(`/community/post/${post.id}`)"
        >
          <div class="wd-media" :style="{ height: postHeight(post) + 'px' }">
            <img :src="img(post.cover, post.title)" :alt="post.title" @error="imgError" />
            <div class="video-badge wd-chip" v-if="post.videoUrl">
              <el-icon><VideoPlay /></el-icon> 视频
            </div>
          </div>

          <div class="wd-card-body">
            <h3 class="wd-title clamp-2">{{ post.title }}</h3>
            <p class="post-desc clamp-2" v-if="post.content">{{ post.content }}</p>

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
      <div v-else-if="!loading" class="wd-card">
        <EmptyState
          title="这个话题下还没有游记"
          desc="由你来写下第一篇，让更多人看到这里的风景。"
        >
          <el-button type="primary" @click="$router.push('/community/publish')">发布游记</el-button>
        </EmptyState>
      </div>

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && posts.length">
        <el-button size="large" :loading="loading" @click="loadMore">
          {{ loading ? '加载中…' : '加载更多' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import PageBack from '../../components/PageBack.vue';
import SkeletonCard from '../../components/SkeletonCard.vue'
import EmptyState from '../../components/EmptyState.vue'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Edit, View, Star, VideoPlay } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
import { img, imgError } from '../../utils/media'

const route = useRoute()
const topicId = ref(route.params.id)

const topic = ref({
  id: 0,
  name: '',
  intro: '',
  description: '',
  cover: '',
  postCount: 0,
  followCount: 0,
  isFollowed: false,
})

const currentTab = ref('hot')
const tabs = [
  { label: '最热', value: 'hot' },
  { label: '最新', value: 'new' },
]

const posts = ref([])
const loading = ref(true)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

// 瀑布流高度：按 id 稳定错落
const HEIGHTS = [190, 250, 210, 280, 200, 240, 220, 260]
const postHeight = (post) => HEIGHTS[(Number(post.id) || 0) % HEIGHTS.length]

const loadTopicDetail = async () => {
  try {
    topic.value = await communityApi.getTopicDetail(topicId.value)
  } catch (error) {
    ElMessage.error('加载话题失败')
  }
}

const loadPosts = async (reset = false) => {
  if (loading.value && !reset) return
  loading.value = true
  try {
    if (reset) {
      page.value = 1
      posts.value = []
    }
    const data = await communityApi.getTopicPosts(topicId.value, {
      topicId: topicId.value,
      page: page.value,
      size: pageSize,
      sort: currentTab.value,
    })
    if (reset) posts.value = data.list || []
    else posts.value.push(...(data.list || []))
    hasMore.value = posts.value.length < (data.total || data.pagination?.total || 0)
    page.value++
  } catch (error) {
    ElMessage.error('加载游记失败')
  } finally {
    loading.value = false
  }
}

const switchTab = (tab) => {
  currentTab.value = tab
  loadPosts(true)
}

const loadMore = () => loadPosts(false)

const handleFollow = async () => {
  try {
    await communityApi.followTopic(topicId.value)
    topic.value.isFollowed = !topic.value.isFollowed
    topic.value.followCount = Math.max(
      0,
      (topic.value.followCount || 0) + (topic.value.isFollowed ? 1 : -1)
    )
    ElMessage.success(topic.value.isFollowed ? '关注成功' : '已取消关注')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const formatCount = (count) => {
  const n = Number(count) || 0
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n
}

onMounted(async () => {
  await loadTopicDetail()
  loadPosts(true)
})
</script>

<style scoped>
.topic-detail-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

/* 话题头图 */
.topic-hero {
  margin-bottom: var(--wd-s6);
}
.hero-media {
  position: relative;
  height: 320px;
  overflow: hidden;
  background: linear-gradient(120deg, #eef1f6, #e6eaf2);
}
.hero-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  background: linear-gradient(180deg, rgba(16, 18, 24, 0.05) 0%, rgba(16, 18, 24, 0.72) 100%);
}
.hero-info {
  padding: var(--wd-s8) var(--wd-s7) var(--wd-s7);
  color: #fff;
}
.hero-name {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.35);
}
.hero-desc {
  max-width: 720px;
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}
.hero-stats {
  display: flex;
  gap: var(--wd-s6);
  margin-top: var(--wd-s4);
}
.stat-item {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.82);
}
.stat-item strong {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.hero-actions {
  display: flex;
  gap: var(--wd-s3);
  padding: var(--wd-s4) var(--wd-s6);
}

/* 排序栏 */
.sort-bar {
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
.sort-tabs {
  display: flex;
  gap: 4px;
}
.sort-tab {
  padding: 8px 20px;
  border-radius: var(--wd-r-pill);
  font-size: 15px;
  color: var(--wd-text-2);
  cursor: pointer;
  transition: all 0.26s var(--wd-ease);
}
.sort-tab:hover {
  color: var(--wd-brand);
  background: var(--wd-brand-soft);
}
.sort-tab.active {
  color: #fff;
  font-weight: 600;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 6px 18px rgba(var(--wd-brand-rgb), 0.24);
}
.sort-hint {
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--wd-text-4);
}

/* 卡片 */
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

.load-more {
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 0;
}

@media (max-width: 760px) {
  .hero-media {
    height: 220px;
  }
  .hero-name {
    font-size: 26px;
  }
  .hero-info {
    padding: var(--wd-s5) var(--wd-s5) var(--wd-s4);
  }
  .sort-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--wd-r-lg);
  }
}
</style>
