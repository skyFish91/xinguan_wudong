<template>
  <div class="user-profile-page">
    <div class="container">
      <!-- 用户信息头部 -->
      <div class="user-header card">
        <div class="user-info">
          <el-avatar :size="100" :src="userInfo.avatarUrl" />
          <div class="info-text">
            <h2>{{ userInfo.nickName || '用户' }}</h2>
            <p class="description">{{ userInfo.description || '暂无介绍' }}</p>
            <div class="stats">
              <div class="stat">
                <span class="number">{{ stats.postCount }}</span>
                <span class="label">游记</span>
              </div>
              <div class="stat">
                <span class="number">{{ stats.followerCount }}</span>
                <span class="label">粉丝</span>
              </div>
              <div class="stat">
                <span class="number">{{ stats.followingCount }}</span>
                <span class="label">关注</span>
              </div>
            </div>
          </div>
        </div>
        <el-button
          v-if="!isMyProfile"
          :type="isFollowed ? '' : 'primary'"
          size="large"
          round
          @click="handleFollow"
        >
          <el-icon v-if="!isFollowed"><Plus /></el-icon>
          {{ isFollowed ? '已关注' : '关注' }}
        </el-button>
      </div>

      <!-- 用户游记列表 -->
      <div class="posts-section">
        <h3>用户游记</h3>
        <div v-if="loading" class="loading">
          <el-icon class="is-loading"><Loading /></el-icon>
        </div>
        <div v-else-if="posts.length" class="post-grid">
          <el-card
            v-for="post in posts"
            :key="post.id"
            shadow="hover"
            :body-style="{ padding: '0' }"
            class="post-card"
            @click="$router.push(`/community/post/${post.id}`)"
          >
            <img
              v-if="post.cover"
              :src="post.cover"
              @error="handleImageError"
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, View, Star, Loading } from '@element-plus/icons-vue'
import axios from 'axios'

const route = useRoute()
const userId = computed(() => parseInt(route.params.id))

const loading = ref(false)
const userInfo = ref({
  nickName: '用户',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  description: ''
})

const stats = ref({
  postCount: 0,
  followerCount: 0,
  followingCount: 0
})

const posts = ref([])
const isFollowed = ref(false)

const currentUserId = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('userInfo'))?.id
  } catch {
    return null
  }
})

const isMyProfile = computed(() => userId.value === currentUserId.value)

// 监听userId变化，重新加载数据
watch(() => userId.value, () => {
  loadUserInfo()
  loadUserPosts()
})

const loadUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'POST',
      url: '/app/user/info',
      data: { id: userId.value },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    console.log('接口返回:', res.data)

    if (res.data && res.data.code === 1000) {
      const userData = res.data.data || {}
      userInfo.value = {
        nickName: userData.nickName || '用户',
        avatarUrl: userData.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        description: userData.description || ''
      }
    }
  } catch (err) {
    console.error('加载用户信息失败:', err)
  }
}

const loadUserPosts = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const res = await axios({
      method: 'POST',
      url: '/app/notePost/feed',
      data: { userId: userId.value, page: 1, size: 20 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
    console.log('接口返回:', res.data)
    if (res.data && res.data.code === 1000) {
      console.log('用户信息接口返回:', res.data)
      posts.value = res.data.data.list || []
      stats.value.postCount = res.data.data.pagination?.total || posts.value.length
    }
  } catch (err) {
    console.error('加载用户游记失败:', err)
  } finally {
    loading.value = false
  }
}

const handleFollow = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios({
      method: 'POST',
      url: '/app/noteFollow/toggle',
      data: { userId: userId.value },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
    isFollowed.value = !isFollowed.value
  } catch (err) {
    console.error('关注失败:', err)
  }
}

const handleImageError = (e) => {
  e.target.src = 'https://picsum.photos/800/600?random=default'
}

onMounted(() => {
  console.log('onMounted, userId =', userId.value)
  loadUserInfo()
  loadUserPosts()
})
</script>

<style lang="scss" scoped>
.user-profile-page {
  background: #f5f7fa;
  padding: 40px 0;
  min-height: calc(100vh - 60px);

  .user-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px;
    margin-bottom: 32px;

    .user-info {
      display: flex;
      align-items: center;
      gap: 24px;
      flex: 1;

      .info-text {
        h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
        }

        .description {
          color: #666;
          margin: 0 0 16px 0;
        }

        .stats {
          display: flex;
          gap: 32px;

          .stat {
            display: flex;
            flex-direction: column;
            align-items: center;

            .number {
              font-size: 18px;
              font-weight: 600;
            }

            .label {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }

  .posts-section {
    h3 {
      margin-bottom: 20px;
      font-size: 18px;
      font-weight: 600;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;

      .post-card {
        cursor: pointer;
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-4px);
        }

        h3 {
          font-size: 14px;
          margin: 0 0 10px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .stats {
          font-size: 12px;
          color: #999;
          display: flex;
          gap: 10px;
        }
      }
    }
  }
}
</style>
