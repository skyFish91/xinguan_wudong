<template>
  <div class="topic-detail-page">
    <div class="container">
      <!-- 话题头部 -->
      <div class="topic-header card">
        <div class="topic-cover" v-if="topic.cover || topic.name">
          <img
            :src="getTopicImage(topic.name)"
            :alt="topic.name"
            onerror="this.src='https://via.placeholder.com/800x400?text=话题'"
          />
          <div class="topic-overlay">
            <div class="topic-info">
              <h1 class="topic-name"># {{ topic.name }}</h1>
              <p class="topic-desc">{{ topic.intro }}</p>
              <div class="topic-stats">
                <span>{{ formatCount(topic.postCount) }} 篇游记</span>
                <span>{{ formatCount(topic.followCount) }} 人关注</span>
              </div>
            </div>
          </div>
        </div>
        <div class="topic-actions">
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
      </div>

      <!-- 游记列表筛选 -->
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
      </div>

      <!-- 游记瀑布流 -->
      <div class="waterfall" v-if="posts.length">
        <div
          v-for="post in posts"
          :key="post.id"
          class="waterfall-item"
          @click="$router.push(`/community/post/${post.id}`)"
        >
          <div class="post-card card">
            <div class="post-image">
              <img :src="post.cover" :alt="post.title" />
              <div class="video-badge" v-if="post.videoUrl">
                <el-icon><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="post-content">
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-desc">{{ post.content }}</p>
              <div class="post-footer">
                <div class="author">
                  <el-avatar :size="28" :src="post.userAvatar" />
                  <span>{{ post.userName }}</span>
                </div>
                <div class="stats">
                  <span><el-icon><View /></el-icon> {{ formatCount(post.viewCount) }}</span>
                  <span><el-icon><Star /></el-icon> {{ formatCount(post.likeCount) }}</span>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Edit, View, Star, VideoPlay } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'

// 动态加载本地图片
const localImages = import.meta.glob('./topics_photos/*.{jpg,jpeg,png}', { eager: true })

const route = useRoute()
const topicId = ref(route.params.id)

const topic = ref({
  id: 0,
  name: '',
  description: '',
  cover: '',
  postCount: 0,
  followCount: 0,
  isFollowed: false
})

const currentTab = ref('hot')
const tabs = [
  { label: '最热', value: 'hot' },
  { label: '最新', value: 'new' }
]

const posts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

// 加载话题详情
const loadTopicDetail = async () => {
  try {
    const data = await communityApi.getTopicDetail(topicId.value)
    topic.value = data
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

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
      topicId: topicId.value,
      page: page.value,
      size: pageSize
    }

    const data = await communityApi.getTopicPosts(topicId.value, params)

    if (reset) {
      posts.value = data.list || []
    } else {
      posts.value.push(...(data.list || []))
    }

    hasMore.value = posts.value.length < (data.pagination?.total || 0)
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
  loadPosts(true)
}

// 加载更多
const loadMore = () => {
  loadPosts(false)
}

// 关注/取消关注话题
const handleFollow = async () => {
  try {
    await communityApi.followTopic(topicId.value)
    topic.value.isFollowed = !topic.value.isFollowed
    topic.value.followCount += topic.value.isFollowed ? 1 : -1
    ElMessage.success(topic.value.isFollowed ? '关注成功' : '已取消关注')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count
}

// 获取话题对应的本地图片
const getTopicImage = (topicName) => {
  for (const [path, module] of Object.entries(localImages)) {
    const fileName = path.split('/').pop().split('.').slice(0, -1).join('.')
    if (fileName === topicName) {
      return module.default || path
    }
  }
  const firstImage = Object.values(localImages)[0]
  return firstImage?.default || topic.value.cover || 'https://via.placeholder.com/800x400?text=话题'
}

onMounted(() => {
  loadTopicDetail()
  loadPosts(true)
})
</script>

<style lang="scss" scoped>
.topic-detail-page {
  min-height: 100vh;
  background: #f5f7fa;

  .topic-header {
    margin-bottom: 24px;
    padding: 0;
    overflow: hidden;

    .topic-cover {
      position: relative;
      width: 100%;
      height: 320px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .topic-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
        display: flex;
        align-items: flex-end;
        padding: 40px;

        .topic-info {
          color: #fff;

          .topic-name {
            font-size: 42px;
            font-weight: 700;
            margin-bottom: 12px;
          }

          .topic-desc {
            font-size: 16px;
            margin-bottom: 16px;
            opacity: 0.9;
          }

          .topic-stats {
            display: flex;
            gap: 24px;
            font-size: 15px;
            opacity: 0.8;
          }
        }
      }
    }

    .topic-actions {
      display: flex;
      gap: 16px;
      padding: 24px;
      background: #fff;
    }
  }

  .filter-bar {
    margin-bottom: 24px;
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

