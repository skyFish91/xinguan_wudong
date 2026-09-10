<template>
  <div style="padding: 20px; background: #f5f5f5; min-height: 100vh;">
    <div style="max-width: 1200px; margin: 0 auto;">
      <!-- 顶部导航栏 -->
      <el-card style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 20px; align-items: center;">
            <h2 style="margin: 0;">🏞️ 旅行社区</h2>
            <el-segmented v-model="currentTab" :options="tabs" @change="handleTabChange" />
          </div>
          <div style="display: flex; gap: 10px; align-items: center;">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索游记、话题"
              style="width: 200px;"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #suffix>
                <el-icon style="cursor: pointer;" @click="handleSearch"><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="$router.push('/community/publish')">
              <el-icon><Edit /></el-icon>
              发布游记
            </el-button>
            <el-button @click="goToQuickLogin" v-if="!hasToken">
              登录
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 热门话题 -->
      <el-card v-if="topics.length" style="margin-bottom: 20px;">
        <template #header>
          <span style="font-weight: 600;">🔥 热门话题</span>
        </template>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <el-tag
            v-for="topic in topics"
            :key="topic.id"
            type="info"
            style="cursor: pointer;"
            @click="goToTopic(topic.id)"
          >
            # {{ topic.name || '未命名话题' }}
          </el-tag>
        </div>
      </el-card>

      <!-- 加载中 -->
      <div v-if="loading" style="text-align: center; padding: 40px;">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <div style="margin-top: 10px;">加载中...</div>
      </div>

      <!-- 游记列表 -->
      <div v-else-if="posts.length" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        <el-card
          v-for="post in posts"
          :key="post.id"
          shadow="hover"
          style="cursor: pointer;"
          @click="viewDetail(post.id)"
        >
          <img
            v-if="post.cover"
            :src="post.cover"
            style="width: 100%; height: 200px; object-fit: cover;"
            @error="handleImageError"
          />
          <div style="padding: 10px 0;">
            <h3 style="margin: 0 0 10px 0; font-size: 16px;">
              {{ post.title || '无标题' }}
            </h3>
            <div style="color: #999; font-size: 14px; display: flex; gap: 15px;">
              <span>👁 {{ post.viewCount || 0 }}</span>
              <span>❤️ {{ post.likeCount || 0 }}</span>
              <span>💬 {{ post.commentCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="暂无游记">
        <el-button type="primary" @click="loadData">刷新</el-button>
      </el-empty>

      <!-- 分页 -->
      <el-card v-if="!loading && posts.length && total > pageSize" style="margin-top: 20px;">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, total"
          @current-change="handlePageChange"
        />
      </el-card>

      <!-- 错误信息 -->
      <el-card v-if="error" style="margin-top: 20px;" shadow="never">
        <template #header>错误信息</template>
        <pre style="color: red; white-space: pre-wrap;">{{ error }}</pre>
      </el-card>

      <!-- 发布对话框 -->
      <el-dialog v-model="showPublishDialog" title="发布游记" width="600px">
        <el-alert type="info" :closable="false" style="margin-bottom: 20px;">
          发布功能开发中，敬请期待...
        </el-alert>
        <template #footer>
          <el-button @click="showPublishDialog = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading, Search, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loading = ref(true)
const posts = ref([])
const topics = ref([])
const error = ref(null)
const currentTab = ref('最新')
const selectedTopic = ref(null)
const searchKeyword = ref('')
const showPublishDialog = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const tabs = ['最新', '热门']
const hasToken = computed(() => !!localStorage.getItem('token'))

const loadData = async () => {
  loading.value = true
  error.value = null

  try {
    const token = localStorage.getItem('token')

    if (!token) {
      error.value = '未登录，请先登录\n访问 /quick-login 进行登录'
      ElMessage.warning('请先登录')
      posts.value = []
      loading.value = false
      return
    }

    console.log('开始加载游记...')

    const res = await axios({
      method: 'POST',
      url: '/app/notePost/feed',
      data: {
        page: page.value,
        pageSize: pageSize.value,
        topicId: selectedTopic.value,
        orderBy: currentTab.value === '热门' ? 'p_like_count' : 'p_create_time'
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    console.log('API响应:', res.data)

    if (res.data && res.data.code === 1000 && res.data.data) {
      posts.value = res.data.data.list || []
      total.value = res.data.data.pagination?.total || posts.value.length
      ElMessage.success(`加载成功，共 ${posts.value.length} 条游记`)
    } else {
      error.value = '返回数据格式异常:\n' + JSON.stringify(res.data, null, 2)
      posts.value = []
    }
  } catch (err) {
    console.error('加载失败:', err)
    error.value = err.message + '\n\n' + JSON.stringify(err.response?.data || {}, null, 2)
    ElMessage.error('加载失败: ' + err.message)
    posts.value = []
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
      data: { page: 1, pageSize: 10 },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })

    if (res.data && res.data.code === 1000 && res.data.data) {
      topics.value = (res.data.data.list || []).slice(0, 8)
    }
  } catch (err) {
    console.error('加载话题失败:', err)
  }
}

const handleTabChange = (tab) => {
  currentTab.value = tab
  page.value = 1
  loadData()
}

const filterByTopic = (topicId) => {
  if (selectedTopic.value === topicId) {
    selectedTopic.value = null
  } else {
    selectedTopic.value = topicId
  }
  page.value = 1
  loadData()
}

const goToTopic = (topicId) => {
  router.push(`/community/topic/${topicId}`)
}

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  router.push({
    path: '/community/search',
    query: { keyword: searchKeyword.value }
  })
}

const goToQuickLogin = () => {
  router.push('/quick-login')
}

const viewDetail = (id) => {
  router.push(`/community/post/${id}`)
}

const handlePageChange = (newPage) => {
  page.value = newPage
  loadData()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleImageError = (e) => {
  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f0f0f0" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">图片加载失败</text></svg>'
}

onMounted(() => {
  console.log('FeedSimple组件已挂载')
  loadTopics()
  loadData()
})
</script>
