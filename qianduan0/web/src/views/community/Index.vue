<template>
  <div class="community-page">
    <div class="container">
      <!-- 顶部筛选 -->
      <div class="filter-bar">
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
            @keyup.enter="handleSearch"
          />
          <el-button type="primary" round @click="$router.push('/community/publish')">
            <el-icon><Edit /></el-icon>
            发布游记
          </el-button>
        </div>
      </div>

      <!-- 话题标签（热门话题） -->
      <div class="topic-bar" v-if="hotTopics.length">
        <div class="topic-tags">
          <span class="topic-label">热门话题：</span>
          <el-tag
            v-for="topic in hotTopics"
            :key="topic.id"
            type="info"
            class="topic-tag"
            @click="goToTopic(topic.id)"
            style="cursor: pointer;"
          >
            # {{ topic.name }}
          </el-tag>
        </div>
      </div>

      <!-- 瀑布流 -->
      <div class="waterfall" v-if="posts.length">
        <div
          v-for="post in posts"
          :key="post.id"
          class="waterfall-item"
          @click="$router.push(`/community/${post.id}`)"
        >
          <div class="post-card card">
            <div class="post-image">
              <img :src="post.cover" :alt="post.title" />
              <!-- 视频标识 -->
              <div class="video-badge" v-if="post.videoUrl">
                <el-icon><VideoPlay /></el-icon>
              </div>
              <!-- 关联地点 -->
              <div class="poi-badge" v-if="post.poiName">
                <el-icon><Location /></el-icon>
                {{ post.poiName }}
              </div>
            </div>
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-desc">{{ post.content }}</p>
              <!-- 话题标签 -->
              <div class="post-topics" v-if="post.topics && post.topics.length">
                <el-tag
                  v-for="topic in post.topics.slice(0, 3)"
                  :key="topic.id"
                  size="small"
                  type="info"
                  class="topic-mini"
                >
                  # {{ topic.name }}
                </el-tag>
              </div>
              <div class="post-footer">
                <div class="author">
                  <el-avatar :size="28" :src="post.userAvatar" />
                  <span>{{ post.userName }}</span>
                </div>
                <div class="stats">
                  <span><el-icon><View /></el-icon> {{ formatCount(post.viewCount) }}</span>
                  <span><el-icon><Star /></el-icon> {{ formatCount(post.likeCount) }}</span>
                  <span><el-icon><ChatDotRound /></el-icon> {{ formatCount(post.commentCount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <el-empty v-if="!loading && !posts.length" description="暂无内容" />

      <!-- 加载更多 -->
      <div class="load-more" v-if="hasMore && posts.length">
        <el-button @click="loadMore" :loading="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </el-button>
      </div>
    </div>

    <!-- 发布游记对话框 -->
    <PublishDialog v-model="showPublishDialog" @success="handlePublishSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Edit, View, Star, ChatDotRound, VideoPlay, Location } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
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
  background: #f5f7fa;

  .filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 20px 32px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .filter-tabs {
      display: flex;
      gap: 32px;

      .filter-tab {
        font-size: 16px;
        color: #666;
        cursor: pointer;
        padding: 8px 0;
        position: relative;
        transition: color 0.3s;

        &:hover {
          color: #667eea;
        }

        &.active {
          color: #667eea;
          font-weight: 600;

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 1px;
          }
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 16px;
      align-items: center;

      .search-input {
        width: 240px;
      }
    }
  }

  .topic-bar {
    margin-bottom: 24px;
    padding: 16px 24px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .topic-tags {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;

      .topic-label {
        color: #999;
        font-size: 14px;
      }

      .topic-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }

  .waterfall {
    columns: 4;
    column-gap: 24px;

    @media (max-width: 1200px) {
      columns: 3;
    }

    .waterfall-item {
      break-inside: avoid;
      margin-bottom: 24px;
    }

    .post-card {
      cursor: pointer;
      overflow: hidden;
      padding: 0;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .post-image {
        position: relative;
        width: 100%;
        overflow: hidden;

        img {
          width: 100%;
          display: block;
          transition: transform 0.3s;
        }

        .video-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.6);
          color: #fff;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .poi-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(102, 126, 234, 0.9);
          color: #fff;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          max-width: calc(100% - 24px);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      &:hover .post-image img {
        transform: scale(1.1);
      }

      .post-content {
        padding: 16px;

        .post-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .post-desc {
          font-size: 14px;
          color: #999;
          margin-bottom: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .post-topics {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;

          .topic-mini {
            border: none;
            background: #f0f2f5;
          }
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .author {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;
          }

          .stats {
            display: flex;
            gap: 12px;
            font-size: 14px;
            color: #999;

            span {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }

  .load-more {
    text-align: center;
    padding: 40px 0;
  }
}
</style>

