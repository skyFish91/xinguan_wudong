<template>
  <div class="user-page">
    <!-- 个人信息卡片 -->
    <div class="container">
      <div class="user-profile card">
        <el-avatar :size="120" :src="userInfo.avatarUrl" />
        <div class="user-info">
          <h2 class="user-name">{{ userInfo.nickName || '用户' }}</h2>
          <p class="user-desc">{{ userInfo.description || '暂无个人介绍' }}</p>
          <div class="user-stats">
            <div class="stat">
              <span class="stat-number">{{ userStats.postCount }}</span>
              <span class="stat-label">游记</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ userStats.likeCount }}</span>
              <span class="stat-label">点赞</span>
            </div>
            <div class="stat">
              <span class="stat-number">{{ userStats.collectCount }}</span>
              <span class="stat-label">收藏</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 标签栏 -->
      <div class="tabs">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-item', { active: activeTab === tab.value }]"
          @click="handleTabChange(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 我的游记 -->
      <div v-if="activeTab === 'posts'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="myPosts.length" class="post-grid">
          <el-card
            v-for="post in myPosts"
            :key="post.id"
            shadow="hover"
            :body-style="{ padding: '0' }"
            class="post-card"
            @click="$router.push(`/community/post/${post.id}`)"
          >
            <img
              v-if="post.cover"
              :src="post.cover"
              style="width: 100%; height: 200px; object-fit: cover"
            />
            <div style="padding: 15px">
              <h3>{{ post.title || '无标题' }}</h3>
              <div class="stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无游记" />
      </div>

      <!-- 点赞的游记 -->
      <div v-if="activeTab === 'likes'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="likedPosts.length" class="post-grid">
          <el-card
            v-for="post in likedPosts"
            :key="post.id"
            shadow="hover"
            :body-style="{ padding: '0' }"
            class="post-card"
            @click="$router.push(`/community/post/${post.id}`)"
          >
            <img
              v-if="post.cover"
              :src="post.cover"
              style="width: 100%; height: 200px; object-fit: cover"
            />
            <div style="padding: 15px">
              <h3>{{ post.title || '无标题' }}</h3>
              <div class="stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无点赞的游记" />
      </div>

      <!-- 收藏的游记 -->
      <div v-if="activeTab === 'collects'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="collectedPosts.length" class="post-grid">
          <el-card
            v-for="post in collectedPosts"
            :key="post.id"
            shadow="hover"
            :body-style="{ padding: '0' }"
            class="post-card"
            @click="$router.push(`/community/post/${post.id}`)"
          >
            <img
              v-if="post.cover"
              :src="post.cover"
              style="width: 100%; height: 200px; object-fit: cover"
            />
            <div style="padding: 15px">
              <h3>{{ post.title || '无标题' }}</h3>
              <div class="stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无收藏的游记" />
      </div>

      <!-- 粉丝 -->
      <div v-if="activeTab === 'followers'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="followers.length" class="user-grid">
          <div v-for="user in followers" :key="user.id" class="user-card card">
            <el-avatar :size="80" :src="user.avatarUrl" />
            <h3>{{ user.nickName }}</h3>
            <p>{{ user.description || '暂无介绍' }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无粉丝" />
      </div>

      <!-- 关注的作者 -->
      <div v-if="activeTab === 'following'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="followingUsers.length" class="user-grid">
          <div v-for="user in followingUsers" :key="user.id" class="user-card card">
            <el-avatar :size="80" :src="user.avatarUrl" />
            <h3>{{ user.nickName }}</h3>
            <p>{{ user.description || '暂无介绍' }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无关注的作者" />
      </div>

      <!-- 关注的话题 -->
      <div v-if="activeTab === 'topics'" class="content">
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="followingTopics.length" class="topic-grid">
          <el-card
            v-for="topic in followingTopics"
            :key="topic.id"
            shadow="hover"
            :body-style="{ padding: '20px' }"
            @click="$router.push(`/community/topic/${topic.id}`)"
            class="topic-card"
          >
            <img v-if="topic.cover" :src="topic.cover" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;" />
            <h3>{{ topic.name }}</h3>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">{{ topic.intro }}</p>
            <div style="font-size: 12px; color: #666; margin-top: 10px;">
              <span>📝 {{ topic.postCount }}</span>
              <span style="margin-left: 15px;">👥 {{ topic.followCount }}</span>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无关注的话题" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { View, Star, Loading } from '@element-plus/icons-vue'
import axios from 'axios'

const activeTab = ref('posts')
const loading = ref(false)

const userInfo = ref({
  nickName: '用户',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
  description: '探索世界的美好'
})

const userStats = ref({
  postCount: 0,
  likeCount: 0,
  collectCount: 0
})

const myPosts = ref([])
const likedPosts = ref([])
const collectedPosts = ref([])
const followers = ref([])
const followingUsers = ref([])
const followingTopics = ref([])

const tabs = [
  { label: '我的游记', value: 'posts' },
  { label: '点赞', value: 'likes' },
  { label: '收藏', value: 'collects' },
  { label: '粉丝', value: 'followers' },
  { label: '关注的作者', value: 'following' },
  { label: '关注的话题', value: 'topics' }
]

// 处理 Tab 切换
const handleTabChange = (value) => {
  activeTab.value = value
  if (value === 'posts' && myPosts.value.length === 0) {
    loadMyPosts()
  } else if (value === 'likes' && likedPosts.value.length === 0) {
    loadLikedPosts()
  } else if (value === 'collects' && collectedPosts.value.length === 0) {
    loadCollectedPosts()
  } else if (value === 'followers' && followers.value.length === 0) {
    loadFollowers()
  } else if (value === 'following' && followingUsers.value.length === 0) {
    loadFollowingUsers()
  } else if (value === 'topics' && followingTopics.value.length === 0) {
    loadFollowingTopics()
  }
}

// 加载我的游记
const loadMyPosts = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'POST',
      url: '/app/notePost/myPosts',
      data: { page: 1, size: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      myPosts.value = res.data.data.list || []
      userStats.value.postCount = res.data.data.pagination?.total || myPosts.value.length
    }
  } catch (err) {
    console.error('加载游记失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载点赞的游记
const loadLikedPosts = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'POST',
      url: '/app/notePost/myLikes',
      data: { page: 1, size: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      likedPosts.value = res.data.data.list || []
      userStats.value.likeCount = res.data.data.pagination?.total || likedPosts.value.length
    }
  } catch (err) {
    console.error('加载点赞游记失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载收藏的游记
const loadCollectedPosts = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.id

    const res = await axios({
      method: 'POST',
      url: '/app/favorite/list',
      data: { userId, targetType: 'NOTE', page: 1, size: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      collectedPosts.value = res.data.data.list || []
      userStats.value.collectCount = res.data.data.pagination?.total || collectedPosts.value.length
    }
  } catch (err) {
    console.error('加载收藏游记失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载粉丝
const loadFollowers = async () => {
  loading.value = true
  try {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (!savedUserInfo) return

    const userData = JSON.parse(savedUserInfo)
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'GET',
      url: '/app/noteFollow/followers',
      params: { userId: userData.id, page: 1, pageSize: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      followers.value = res.data.data.list || res.data.data || []
    }
  } catch (err) {
    console.error('加载粉丝失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载关注的作者
const loadFollowingUsers = async () => {
  loading.value = true
  try {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (!savedUserInfo) return

    const userData = JSON.parse(savedUserInfo)
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'GET',
      url: '/app/noteFollow/following',
      params: { userId: userData.id, page: 1, pageSize: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      followingUsers.value = res.data.data.list || res.data.data || []
    }
  } catch (err) {
    console.error('加载关注的作者失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载关注的话题
const loadFollowingTopics = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'POST',
      url: '/app/noteTopic/following',
      data: { page: 1, size: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000) {
      followingTopics.value = res.data.data.list || []
    }
  } catch (err) {
    console.error('加载关注的话题失败:', err)
  } finally {
    loading.value = false
  }
}

const loadUserInfo = async () => {
  try {
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      const userData = JSON.parse(savedUserInfo)
      const token = localStorage.getItem('token')
      const res = await axios({
        method: 'POST',
        url: '/app/user/info',
        data: { id: userData.id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })

      if (res.data && res.data.code === 1000) {
        const data = res.data.data || {}
        userInfo.value = {
          nickName: data.nickName || '用户',
          avatarUrl: data.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
          description: data.description || ''
        }
      }
    }
  } catch (err) {
    console.error('加载用户信息失败:', err)
  }
}

onMounted(() => {
  loadUserInfo()
  loadMyPosts()
  loadLikedPosts()
  loadCollectedPosts()
})
</script>

<style lang="scss" scoped>
.user-page {
  background: #f5f7fa;
  padding: 40px 0;
  min-height: calc(100vh - 60px);

  .user-profile {
    display: flex;
    align-items: flex-start;
    gap: 32px;
    margin-bottom: 32px;
    padding: 32px;

    .user-info {
      flex: 1;

      .user-name {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      .user-desc {
        color: #666;
        margin: 0 0 24px 0;
      }

      .user-stats {
        display: flex;
        gap: 32px;

        .stat {
          text-align: center;

          .stat-number {
            display: block;
            font-size: 24px;
            font-weight: 600;
            color: #667eea;
          }

          .stat-label {
            display: block;
            font-size: 14px;
            color: #999;
            margin-top: 4px;
          }
        }
      }
    }
  }

  .tabs {
    display: flex;
    gap: 16px;
    margin-bottom: 32px;
    border-bottom: 1px solid #eee;

    .tab-item {
      padding: 12px 0;
      font-size: 14px;
      color: #666;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.3s;

      &:hover {
        color: #667eea;
      }

      &.active {
        color: #667eea;
        border-bottom-color: #667eea;
        font-weight: 600;
      }
    }
  }

  .content {
    min-height: 300px;

    .loading {
      text-align: center;
      padding: 60px 20px;

      .is-loading {
        font-size: 32px;
        color: #667eea;
      }
    }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;

      .post-card {
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        h3 {
          font-size: 16px;
          margin: 0 0 10px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .stats {
          display: flex;
          gap: 15px;
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
</style>
