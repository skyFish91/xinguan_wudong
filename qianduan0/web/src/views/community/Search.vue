<template>
  <div class="search-page">
    <div class="container">
      <!-- 搜索框 -->
      <div class="search-header card">
        <el-input
          v-model="keyword"
          size="large"
          placeholder="搜索游记、话题、用户..."
          prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- Tab 切换 -->
      <div class="search-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          :class="['search-tab', { active: currentTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          {{ tab.label }}
          <span class="tab-count" v-if="getTabCount(tab.value) > 0">
            ({{ formatCount(getTabCount(tab.value)) }})
          </span>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div class="search-content">
        <!-- 游记结果 -->
        <div v-if="currentTab === 'posts'">
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
                  <div class="video-badge" v-if="post.videoUrl">
                    <el-icon><VideoPlay /></el-icon>
                  </div>
                </div>
                <div class="post-content">
                  <h3 class="post-title" v-html="highlightKeyword(post.title)"></h3>
                  <p class="post-desc" v-html="highlightKeyword(post.content)"></p>
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
        </div>

        <!-- 话题结果 -->
        <div v-if="currentTab === 'topics'">
          <div class="topic-list" v-if="topics.length">
            <div
              v-for="topic in topics"
              :key="topic.id"
              class="topic-item card"
              @click="$router.push(`/community/topic/${topic.id}`)"
            >
              <div class="topic-cover">
                <img :src="topic.cover" :alt="topic.name" />
              </div>
              <div class="topic-info">
                <h3 class="topic-name" v-html="highlightKeyword('# ' + topic.name)"></h3>
                <p class="topic-desc">{{ topic.description }}</p>
                <div class="topic-stats">
                  <span>{{ formatCount(topic.postCount) }} 篇游记</span>
                  <span>{{ formatCount(topic.followCount) }} 人关注</span>
                </div>
              </div>
              <div class="topic-action">
                <el-button
                  :type="topic.isFollowed ? '' : 'primary'"
                  round
                  @click.stop="handleFollowTopic(topic)"
                >
                  {{ topic.isFollowed ? '已关注' : '关注' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户结果 -->
        <div v-if="currentTab === 'users'">
          <div class="user-list" v-if="users.length">
            <div
              v-for="user in users"
              :key="user.id"
              class="user-item card"
              @click="$router.push(`/community/user/${user.id}`)"
            >
              <el-avatar :size="64" :src="user.avatar" />
              <div class="user-info">
                <h3 class="user-name" v-html="highlightKeyword(user.nickname)"></h3>
                <p class="user-bio">{{ user.bio || '这个人很懒，什么都没写' }}</p>
                <div class="user-stats">
                  <span>{{ formatCount(user.postCount) }} 游记</span>
                  <span>{{ formatCount(user.followerCount) }} 粉丝</span>
                </div>
              </div>
              <div class="user-action">
                <el-button
                  :type="user.isFollowed ? '' : 'primary'"
                  round
                  @click.stop="handleFollowUser(user)"
                >
                  {{ user.isFollowed ? '已关注' : '关注' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && !searched"
          description="输入关键词开始搜索"
          :image-size="120"
        />
        <el-empty
          v-if="!loading && searched && getCurrentList().length === 0"
          description="没有找到相关内容"
          :image-size="120"
        />

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore && getCurrentList().length">
          <el-button @click="loadMore" :loading="loading">
            {{ loading ? '加载中...' : '加载更多' }}
          </el-button>
        </div>
      </div>

      <!-- 搜索历史 -->
      <div class="search-history card" v-if="!searched && searchHistory.length">
        <div class="history-header">
          <h3>搜索历史</h3>
          <el-button text @click="clearHistory">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
        <div class="history-tags">
          <el-tag
            v-for="(item, index) in searchHistory"
            :key="index"
            closable
            @close="removeHistory(index)"
            @click="searchHistoryItem(item)"
            class="history-tag"
          >
            {{ item }}
          </el-tag>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div class="hot-search card" v-if="!searched && hotSearches.length">
        <div class="hot-header">
          <h3>热门搜索</h3>
          <el-icon><TrendCharts /></el-icon>
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
            <el-icon v-if="item.trend === 'up'" color="#f56c6c"><CaretTop /></el-icon>
            <el-icon v-if="item.trend === 'down'" color="#67c23a"><CaretBottom /></el-icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Star, VideoPlay, Delete, TrendCharts, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const keyword = ref(route.query.q || '')
const currentTab = ref('posts')
const tabs = [
  { label: '游记', value: 'posts' },
  { label: '话题', value: 'topics' },
  { label: '用户', value: 'users' }
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
  { keyword: '蜡染体验', trend: 'up' }
])

// 获取 Tab 数量
const getTabCount = (tab) => {
  switch (tab) {
    case 'posts':
      return postsTotal.value
    case 'topics':
      return topicsTotal.value
    case 'users':
      return usersTotal.value
    default:
      return 0
  }
}

// 获取当前列表
const getCurrentList = () => {
  switch (currentTab.value) {
    case 'posts':
      return posts.value
    case 'topics':
      return topics.value
    case 'users':
      return users.value
    default:
      return []
  }
}

// 执行搜索
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  // 保存搜索历史
  saveHistory(keyword.value)

  // 更新 URL
  router.push({ query: { q: keyword.value } })

  // 执行搜索
  searched.value = true
  page.value = 1
  posts.value = []
  topics.value = []
  users.value = []

  await searchAll()
}

// 清空搜索
const handleClear = () => {
  keyword.value = ''
  searched.value = false
  posts.value = []
  topics.value = []
  users.value = []
  router.push({ query: {} })
}

// 搜索全部类型
const searchAll = async () => {
  loading.value = true
  try {
    const params = {
      keyword: keyword.value,
      page: page.value,
      pageSize
    }

    // 并行搜索三种类型
    const [postsData, topicsData, usersData] = await Promise.all([
      communityApi.search({ ...params, type: 'post' }),
      communityApi.search({ ...params, type: 'topic' }),
      communityApi.search({ ...params, type: 'user' })
    ])

    posts.value = postsData.list || []
    topics.value = topicsData.list || []
    users.value = usersData.list || []

    postsTotal.value = postsData.total || 0
    topicsTotal.value = topicsData.total || 0
    usersTotal.value = usersData.total || 0

    hasMore.value = false // 首次搜索不支持加载更多（需要切换 Tab）
  } catch (error) {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 切换 Tab
const switchTab = async (tab) => {
  currentTab.value = tab
  if (!searched.value) return

  page.value = 1
  await loadTabContent(true)
}

// 加载 Tab 内容
const loadTabContent = async (reset = false) => {
  if (loading.value) return

  loading.value = true
  try {
    if (reset) {
      page.value = 1
    }

    const params = {
      keyword: keyword.value,
      type: currentTab.value === 'posts' ? 'post' : currentTab.value.slice(0, -1), // posts -> post
      page: page.value,
      pageSize
    }

    const data = await communityApi.search(params)

    switch (currentTab.value) {
      case 'posts':
        if (reset) {
          posts.value = data.list || []
        } else {
          posts.value.push(...(data.list || []))
        }
        postsTotal.value = data.total || 0
        hasMore.value = posts.value.length < postsTotal.value
        break
      case 'topics':
        if (reset) {
          topics.value = data.list || []
        } else {
          topics.value.push(...(data.list || []))
        }
        topicsTotal.value = data.total || 0
        hasMore.value = topics.value.length < topicsTotal.value
        break
      case 'users':
        if (reset) {
          users.value = data.list || []
        } else {
          users.value.push(...(data.list || []))
        }
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

// 加载更多
const loadMore = () => {
  loadTabContent(false)
}

// 关注话题
const handleFollowTopic = async (topic) => {
  try {
    await communityApi.followTopic(topic.id)
    topic.isFollowed = !topic.isFollowed
    topic.followCount += topic.isFollowed ? 1 : -1
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 关注用户
const handleFollowUser = async (user) => {
  try {
    if (user.isFollowed) {
      await communityApi.unfollowUser(user.id)
      user.isFollowed = false
      user.followerCount--
    } else {
      await communityApi.followUser(user.id)
      user.isFollowed = true
      user.followerCount++
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 高亮关键词
const highlightKeyword = (text) => {
  if (!keyword.value || !text) return text
  const regex = new RegExp(`(${keyword.value})`, 'gi')
  return text.replace(regex, '<span style="color: #667eea; font-weight: 600;">$1</span>')
}

// 搜索历史管理
const loadHistory = () => {
  const history = localStorage.getItem('search_history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

const saveHistory = (keyword) => {
  // 去重
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  // 添加到最前
  searchHistory.value.unshift(keyword)
  // 最多保留 10 条
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  // 保存到本地
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

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count || 0
}

onMounted(() => {
  loadHistory()
  // 如果有关键词，自动搜索
  if (keyword.value) {
    handleSearch()
  }
})
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 0;

  .search-header {
    margin-bottom: 24px;
    padding: 32px;

    :deep(.el-input-group__append) {
      background: #667eea;
      color: #fff;
      border: none;

      .el-button {
        color: #fff;
      }
    }
  }

  .search-tabs {
    display: flex;
    gap: 48px;
    padding: 16px 32px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 24px;

    .search-tab {
      font-size: 16px;
      color: #666;
      cursor: pointer;
      padding: 8px 0;
      position: relative;
      transition: color 0.3s;

      .tab-count {
        font-size: 14px;
        color: #999;
        margin-left: 4px;
      }

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

  .search-content {
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

    .topic-list {
      display: grid;
      gap: 16px;

      .topic-item {
        display: flex;
        gap: 20px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .topic-cover {
          width: 120px;
          height: 90px;
          border-radius: 8px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .topic-info {
          flex: 1;

          .topic-name {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .topic-desc {
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .topic-stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #999;
          }
        }

        .topic-action {
          display: flex;
          align-items: center;
        }
      }
    }

    .user-list {
      display: grid;
      gap: 16px;

      .user-item {
        display: flex;
        gap: 20px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .user-info {
          flex: 1;

          .user-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .user-bio {
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .user-stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #999;
          }
        }

        .user-action {
          display: flex;
          align-items: center;
        }
      }
    }

    .load-more {
      text-align: center;
      padding: 40px 0;
    }
  }

  .search-history {
    margin-bottom: 24px;
    padding: 24px;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .history-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .history-tag {
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
        }
      }
    }
  }

  .hot-search {
    padding: 24px;

    .hot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        font-weight: 600;
      }
    }

    .hot-list {
      .hot-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        border-radius: 8px;
        transition: background 0.3s;

        &:hover {
          background: #f7f8fa;
        }

        .hot-rank {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #999;
          background: #f0f2f5;
          border-radius: 4px;

          &.top {
            background: linear-gradient(135deg, #f56c6c 0%, #ff8a56 100%);
            color: #fff;
          }
        }

        .hot-keyword {
          flex: 1;
          font-size: 15px;
        }
      }
    }
  }
}
</style>

