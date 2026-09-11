<template>
  <div style="background: #f5f5f5; min-height: 100vh;">
    <!-- 顶部Banner -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <h1 style="font-size: 48px; margin: 0 0 20px 0;">🏞️ 旅行社区</h1>
        <p style="font-size: 20px; margin: 0 0 30px 0; opacity: 0.9;">分享你的旅行故事，探索世界的美好</p>
        <div style="display: flex; gap: 20px; justify-content: center;">
          <el-button type="primary" size="large" @click="goToFeed">
            <el-icon><View /></el-icon>
            浏览游记
          </el-button>
          <el-button type="success" size="large" @click="$router.push('/community/publish')" v-if="hasToken">
            <el-icon><Edit /></el-icon>
            发布游记
          </el-button>
          <el-button size="large" @click="goToLogin" v-else>
            <el-icon><User /></el-icon>
            登录后发布
          </el-button>
        </div>
      </div>
    </div>

    <div style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;">
      <!-- 快速导航 -->
      <el-row :gutter="20" style="margin-bottom: 40px;">
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="cursor: pointer; text-align: center;" @click="goToFeed">
            <div style="font-size: 48px; margin-bottom: 10px;">📝</div>
            <h3 style="margin: 0 0 10px 0;">最新游记</h3>
            <p style="color: #999; margin: 0;">{{ stats.postCount }} 篇</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="cursor: pointer; text-align: center;" @click="goToTopics">
            <div style="font-size: 48px; margin-bottom: 10px;">🔥</div>
            <h3 style="margin: 0 0 10px 0;">热门话题</h3>
            <p style="color: #999; margin: 0;">{{ stats.topicCount }} 个</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="cursor: pointer; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">👥</div>
            <h3 style="margin: 0 0 10px 0;">活跃用户</h3>
            <p style="color: #999; margin: 0;">{{ stats.userCount }} 人</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :sm="12" :md="6">
          <el-card shadow="hover" style="cursor: pointer; text-align: center;" @click="goToSearch">
            <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
            <h3 style="margin: 0 0 10px 0;">搜索发现</h3>
            <p style="color: #999; margin: 0;">探索更多</p>
          </el-card>
        </el-col>
      </el-row>

      <!-- 热门话题 -->
      <el-card style="margin-bottom: 40px;" v-if="topics.length">
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 20px; font-weight: 600;">🔥 热门话题</span>
            <el-button text @click="goToTopics">查看更多 →</el-button>
          </div>
        </template>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          <el-tag
            v-for="topic in topics"
            :key="topic.id"
            type="primary"
            size="large"
            style="cursor: pointer;"
            @click="goToTopic(topic.id)"
          >
            # {{ topic.name || '未命名话题' }}
          </el-tag>
        </div>
      </el-card>

      <!-- 推荐游记 -->
      <el-card>
        <template #header>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 20px; font-weight: 600;">✨ 推荐游记</span>
            <el-button text @click="goToFeed">查看更多 →</el-button>
          </div>
        </template>

        <!-- 加载中 -->
        <div v-if="loading" style="text-align: center; padding: 40px;">
          <el-icon class="is-loading" size="32"><Loading /></el-icon>
          <div style="margin-top: 10px;">加载中...</div>
        </div>

        <!-- 游记列表 -->
        <div v-else-if="posts.length" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          <el-card
            v-for="post in posts.slice(0, 6)"
            :key="post.p_id"
            shadow="hover"
            :body-style="{ padding: '0' }"
            style="cursor: pointer;"
            @click="viewDetail(post.p_id)"
          >
            <img
              v-if="post.p_cover"
              :src="post.p_cover"
              style="width: 100%; height: 200px; object-fit: cover;"
              @error="handleImageError"
            />
            <div style="padding: 15px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ post.p_title || '无标题' }}
              </h3>
              <div style="color: #999; font-size: 14px; display: flex; gap: 15px;">
                <span>👁 {{ post.p_view_count || 0 }}</span>
                <span>❤️ {{ post.p_like_count || 0 }}</span>
                <span>💬 {{ post.p_comment_count || 0 }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无游记" />
      </el-card>

      <!-- 发布对话框 -->
      <PublishPost v-model="showPublishDialog" @success="handlePublishSuccess" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading, Edit, View, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import PublishPost from './components/PublishPost.vue'

const router = useRouter()
const loading = ref(true)
const posts = ref([])
const topics = ref([])
const showPublishDialog = ref(false)
const stats = ref({
  postCount: 0,
  topicCount: 0,
  userCount: 0
})

const hasToken = computed(() => !!localStorage.getItem('token'))

const loadPosts = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      loading.value = false
      return
    }

    const res = await axios({
      method: 'POST',
      url: '/app/notePost/feed',
      data: {
        page: 1,
        pageSize: 6,
        orderBy: 'p_like_count'
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000 && res.data.data) {
      // API 返回的字段已经是 p_id, p_title 的格式，无需转换
      posts.value = res.data.data.list || []
      stats.value.postCount = res.data.data.pagination?.total || posts.value.length
    }
  } catch (err) {
    console.error('加载游记失败:', err)
  } finally {
    loading.value = false
  }
}

const loadTopics = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) return

    const res = await axios({
      method: 'POST',
      url: '/app/noteTopic/list',
      data: { page: 1, size: 10 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000 && res.data.data) {
      topics.value = (res.data.data.list || []).slice(0, 12)
      stats.value.topicCount = res.data.data.pagination?.total || topics.value.length
    }
  } catch (err) {
    console.error('加载话题失败:', err)
  }
}

const goToFeed = () => {
  router.push('/community/feed')
}

const goToTopics = () => {
  router.push('/community/topics')
}

const goToTopic = (topicId) => {
  router.push(`/community/topic/${topicId}`)
}

const goToSearch = () => {
  router.push('/community/search')
}

const goToLogin = () => {
  router.push('/login')
}

const viewDetail = (id) => {
  router.push(`/community/post/${id}`)
}

const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">图片</text></svg>'
}

const handlePublishSuccess = () => {
  ElMessage.success('发布成功！')
  loadPosts()
}

onMounted(() => {
  loadTopics()
  loadPosts()
  // 模拟统计数据
  stats.value.userCount = 128
})
</script>
