<template>
  <div class="user-profile-page">
    <div class="container">
      <!-- 用户信息卡片 -->
      <div class="profile-header card">
        <div class="profile-cover" :style="{ backgroundImage: `url(${user.coverImage || defaultCover})` }">
          <div class="cover-overlay"></div>
        </div>
        <div class="profile-main">
          <el-avatar :size="120" :src="user.avatar" class="profile-avatar" />
          <div class="profile-info">
            <div class="user-name-row">
              <h1 class="user-name">{{ user.nickname }}</h1>
              <el-tag v-if="user.level" type="warning" size="large">
                Lv{{ user.level }}
              </el-tag>
            </div>
            <p class="user-bio" v-if="user.bio">{{ user.bio }}</p>
            <div class="user-stats">
              <div class="stat-item" @click="showFollowDialog('following')">
                <div class="stat-value">{{ formatCount(user.followingCount) }}</div>
                <div class="stat-label">关注</div>
              </div>
              <div class="stat-item" @click="showFollowDialog('followers')">
                <div class="stat-value">{{ formatCount(user.followerCount) }}</div>
                <div class="stat-label">粉丝</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ formatCount(user.likedCount) }}</div>
                <div class="stat-label">获赞</div>
              </div>
            </div>
          </div>
          <div class="profile-actions" v-if="!isMyProfile">
            <el-button
              :type="user.isFollowed ? '' : 'primary'"
              round
              size="large"
              @click="handleFollow"
            >
              <el-icon v-if="!user.isFollowed"><Plus /></el-icon>
              {{ user.isFollowed ? '已关注' : '关注' }}
            </el-button>
            <el-button round size="large" @click="handleMessage">
              <el-icon><ChatDotRound /></el-icon>
              私信
            </el-button>
          </div>
          <div class="profile-actions" v-else>
            <el-button round size="large" @click="$router.push('/user/settings')">
              <el-icon><Setting /></el-icon>
              编辑资料
            </el-button>
          </div>
        </div>
      </div>

      <!-- Tab 切换 -->
      <div class="profile-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          :class="['profile-tab', { active: currentTab === tab.value }]"
          @click="switchTab(tab.value)"
        >
          <span>{{ tab.label }}</span>
          <span class="tab-count">({{ getTabCount(tab.value) }})</span>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="profile-content">
        <!-- 游记列表 -->
        <div class="waterfall" v-if="currentTab === 'posts' && posts.length">
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
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-stats">
                  <span><el-icon><View /></el-icon> {{ formatCount(post.viewCount) }}</span>
                  <span><el-icon><Star /></el-icon> {{ formatCount(post.likeCount) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 收藏列表 -->
        <div class="waterfall" v-if="currentTab === 'favorites' && favorites.length">
          <div
            v-for="post in favorites"
            :key="post.id"
            class="waterfall-item"
            @click="$router.push(`/community/${post.id}`)"
          >
            <div class="post-card card">
              <div class="post-image">
                <img :src="post.cover" :alt="post.title" />
              </div>
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-author">
                  <el-avatar :size="24" :src="post.userAvatar" />
                  <span>{{ post.userName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 点赞列表 -->
        <div class="waterfall" v-if="currentTab === 'likes' && likes.length">
          <div
            v-for="post in likes"
            :key="post.id"
            class="waterfall-item"
            @click="$router.push(`/community/${post.id}`)"
          >
            <div class="post-card card">
              <div class="post-image">
                <img :src="post.cover" :alt="post.title" />
              </div>
              <div class="post-content">
                <h3 class="post-title">{{ post.title }}</h3>
                <div class="post-author">
                  <el-avatar :size="24" :src="post.userAvatar" />
                  <span>{{ post.userName }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && getCurrentList().length === 0"
          :description="getEmptyText()"
        />

        <!-- 加载更多 -->
        <div class="load-more" v-if="hasMore && getCurrentList().length">
          <el-button @click="loadMore" :loading="loading">
            {{ loading ? '加载中...' : '加载更多' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 关注/粉丝列表对话框 -->
    <el-dialog
      v-model="showFollowList"
      :title="followListType === 'following' ? '关注列表' : '粉丝列表'"
      width="600px"
    >
      <div class="follow-list">
        <div
          v-for="item in followList"
          :key="item.id"
          class="follow-item"
        >
          <div class="follow-user" @click="$router.push(`/community/user/${item.id}`)">
            <el-avatar :size="48" :src="item.avatar" />
            <div class="follow-user-info">
              <div class="follow-user-name">{{ item.nickname }}</div>
              <div class="follow-user-bio">{{ item.bio || '这个人很懒，什么都没写' }}</div>
            </div>
          </div>
          <el-button
            v-if="item.id !== user.id"
            :type="item.isFollowed ? '' : 'primary'"
            round
            size="small"
            @click="handleFollowUser(item)"
          >
            {{ item.isFollowed ? '已关注' : '关注' }}
          </el-button>
        </div>
      </div>
      <el-empty v-if="!followList.length" description="暂无数据" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, ChatDotRound, Setting, View, Star, VideoPlay } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const userId = ref(route.params.id)

const defaultCover = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=300&fit=crop'

const user = ref({
  id: 0,
  nickname: '',
  avatar: '',
  bio: '',
  coverImage: '',
  level: 0,
  followingCount: 0,
  followerCount: 0,
  likedCount: 0,
  postCount: 0,
  favoriteCount: 0,
  likeCount: 0,
  isFollowed: false
})

const currentTab = ref('posts')
const tabs = [
  { label: '游记', value: 'posts' },
  { label: '收藏', value: 'favorites' },
  { label: '点赞', value: 'likes' }
]

const posts = ref([])
const favorites = ref([])
const likes = ref([])
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = 20

const showFollowList = ref(false)
const followListType = ref('following') // 'following' | 'followers'
const followList = ref([])

// 是否是自己的主页
const isMyProfile = computed(() => {
  return userStore.userInfo?.id === Number(userId.value)
})

// 获取当前 Tab 的数量
const getTabCount = (tab) => {
  switch (tab) {
    case 'posts':
      return user.value.postCount
    case 'favorites':
      return user.value.favoriteCount
    case 'likes':
      return user.value.likeCount
    default:
      return 0
  }
}

// 获取当前列表
const getCurrentList = () => {
  switch (currentTab.value) {
    case 'posts':
      return posts.value
    case 'favorites':
      return favorites.value
    case 'likes':
      return likes.value
    default:
      return []
  }
}

// 获取空状态文本
const getEmptyText = () => {
  switch (currentTab.value) {
    case 'posts':
      return 'TA还没有发布游记'
    case 'favorites':
      return 'TA还没有收藏内容'
    case 'likes':
      return 'TA还没有点赞内容'
    default:
      return '暂无内容'
  }
}

// 加载用户信息
const loadUserProfile = async () => {
  try {
    const data = await communityApi.getUserProfile(userId.value)
    user.value = data
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

// 加载内容列表
const loadContent = async (reset = false) => {
  if (loading.value) return

  loading.value = true
  try {
    if (reset) {
      page.value = 1
    }

    const params = {
      userId: userId.value,
      page: page.value,
      pageSize
    }

    let data
    switch (currentTab.value) {
      case 'posts':
        data = await communityApi.getFeed({ ...params, authorId: userId.value })
        if (reset) {
          posts.value = data.list || []
        } else {
          posts.value.push(...(data.list || []))
        }
        break
      case 'favorites':
        // TODO: 实现收藏列表 API
        data = { list: [], total: 0 }
        if (reset) {
          favorites.value = data.list || []
        } else {
          favorites.value.push(...(data.list || []))
        }
        break
      case 'likes':
        // TODO: 实现点赞列表 API
        data = { list: [], total: 0 }
        if (reset) {
          likes.value = data.list || []
        } else {
          likes.value.push(...(data.list || []))
        }
        break
    }

    hasMore.value = getCurrentList().length < (data.total || 0)
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
  loadContent(true)
}

// 加载更多
const loadMore = () => {
  loadContent(false)
}

// 关注/取消关注用户
const handleFollow = async () => {
  try {
    if (user.value.isFollowed) {
      await communityApi.unfollowUser(userId.value)
      user.value.isFollowed = false
      user.value.followerCount--
      ElMessage.success('已取消关注')
    } else {
      await communityApi.followUser(userId.value)
      user.value.isFollowed = true
      user.value.followerCount++
      ElMessage.success('关注成功')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 私信
const handleMessage = () => {
  ElMessage.info('私信功能开发中')
}

// 显示关注/粉丝列表
const showFollowDialog = async (type) => {
  followListType.value = type
  showFollowList.value = true

  try {
    // TODO: 实现关注/粉丝列表 API
    followList.value = []
  } catch (error) {
    ElMessage.error('加载失败')
  }
}

// 关注/取消关注列表中的用户
const handleFollowUser = async (item) => {
  try {
    if (item.isFollowed) {
      await communityApi.unfollowUser(item.id)
      item.isFollowed = false
    } else {
      await communityApi.followUser(item.id)
      item.isFollowed = true
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 格式化数字
const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count || 0
}

onMounted(() => {
  loadUserProfile()
  loadContent(true)
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 0;

  .profile-header {
    margin-bottom: 32px;
    padding: 0;
    overflow: hidden;

    .profile-cover {
      position: relative;
      width: 100%;
      height: 200px;
      background-size: cover;
      background-position: center;

      .cover-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
      }
    }

    .profile-main {
      position: relative;
      padding: 0 40px 32px;
      display: flex;
      gap: 32px;

      .profile-avatar {
        margin-top: -60px;
        border: 4px solid #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .profile-info {
        flex: 1;
        padding-top: 20px;

        .user-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .user-name {
            font-size: 28px;
            font-weight: 700;
          }
        }

        .user-bio {
          color: #666;
          font-size: 15px;
          margin-bottom: 20px;
        }

        .user-stats {
          display: flex;
          gap: 40px;

          .stat-item {
            cursor: pointer;
            text-align: center;
            transition: transform 0.3s;

            &:hover {
              transform: translateY(-2px);

              .stat-value {
                color: #667eea;
              }
            }

            .stat-value {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 4px;
              transition: color 0.3s;
            }

            .stat-label {
              font-size: 14px;
              color: #999;
            }
          }
        }
      }

      .profile-actions {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        padding-top: 20px;
      }
    }
  }

  .profile-tabs {
    display: flex;
    gap: 48px;
    padding: 0 32px 16px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 24px;

    .profile-tab {
      font-size: 16px;
      color: #666;
      cursor: pointer;
      padding: 16px 0;
      position: relative;
      transition: color 0.3s;
      display: flex;
      align-items: center;
      gap: 6px;

      .tab-count {
        font-size: 14px;
        color: #999;
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

  .profile-content {
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
            margin-bottom: 12px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .post-stats {
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

          .post-author {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #666;
          }
        }
      }
    }

    .load-more {
      text-align: center;
      padding: 40px 0;
    }
  }

  .follow-list {
    max-height: 500px;
    overflow-y: auto;

    .follow-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .follow-user {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
        cursor: pointer;

        &:hover .follow-user-name {
          color: #667eea;
        }

        .follow-user-info {
          flex: 1;

          .follow-user-name {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
            transition: color 0.3s;
          }

          .follow-user-bio {
            font-size: 14px;
            color: #999;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>

