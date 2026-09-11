<template>
  <div class="community-feed">
    <div class="container">
      <!-- 顶部操作栏 -->
      <div class="header-bar">
        <div class="tabs">
          <div
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab-item', { active: currentTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </div>
        </div>
        <el-button type="primary" @click="$router.push('/community/publish')">
          <el-icon><Edit /></el-icon>
          发布游记
        </el-button>
      </div>

      <!-- 热门话题 -->
      <div class="topics-bar" v-if="topics.length">
        <span class="label">热门话题：</span>
        <el-tag
          v-for="topic in topics"
          :key="topic.id"
          type="info"
          style="margin-right: 10px; cursor: pointer;"
          @click="goToTopic(topic.id)"
        >
          # {{ topic.name || '未命名话题' }}
        </el-tag>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-box">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>

      <!-- 游记列表 -->
      <div v-else-if="posts.length" class="posts-grid">
        <div
          v-for="post in posts"
          :key="post.p_id"
          class="post-card"
          @click="goToDetail(post.p_id)"
        >
          <div class="post-cover">
            <el-image
              :src="post.p_cover"
              fit="cover"
              lazy
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div class="post-info">
            <h3 class="post-title">{{ post.p_title || '无标题' }}</h3>
            <div class="post-stats">
              <span><el-icon><View /></el-icon> {{ post.p_view_count || 0 }}</span>
              <span><el-icon><Star /></el-icon> {{ post.p_like_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-box">
        <el-empty description="暂无游记">
          <el-button type="primary" @click="showPublish = true">发布第一篇游记</el-button>
        </el-empty>
      </div>

      <!-- 分页 -->
      <div v-if="total > pageSize" class="pagination">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="loadPosts"
        />
      </div>
    </div>

    <!-- 发布对话框 -->
    <PublishDialog v-model="showPublish" @success="handlePublishSuccess" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { communityApi } from '@/api/community'
import { Edit, Loading, Picture, View, Star } from '@element-plus/icons-vue'
import PublishDialog from './components/PublishDialog.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 数据
const loading = ref(true)
const posts = ref([])
const topics = ref([])
const currentTab = ref('latest')
const selectedTopic = ref(null)
const showPublish = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

const tabs = [
  { label: '最新', value: 'latest' },
  { label: '热门', value: 'hot' }
]

// 加载游记列表
const loadPosts = async () => {
  loading.value = true
  try {
    const res = await communityApi.getFeed({
      page: page.value,
      pageSize: pageSize.value,
      topicId: selectedTopic.value,
      orderBy: currentTab.value === 'hot' ? 'p_like_count' : 'p_create_time'
    })

    if (res && res.list) {
      // API 返回的字段已经是 p_id, p_title 等格式，无需转换
      posts.value = res.list
      total.value = res.pagination?.total || res.list.length
    } else {
      posts.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载游记失败:', error)
    ElMessage.error('加载游记失败: ' + (error.message || '请检查网络'))
    posts.value = []
  } finally {
    loading.value = false
  }
}

// 加载话题列表
const loadTopics = async () => {
  try {
    const res = await communityApi.getTopics({ page: 1, pageSize: 10 })
    if (res && res.list) {
      topics.value = res.list.slice(0, 8)
    }
  } catch (error) {
    console.error('加载话题失败:', error)
  }
}

// 切换标签
const switchTab = (tab) => {
  currentTab.value = tab
  page.value = 1
  loadPosts()
}

// 按话题筛选
const filterByTopic = (topicId) => {
  if (selectedTopic.value === topicId) {
    selectedTopic.value = null
  } else {
    selectedTopic.value = topicId
  }
  page.value = 1
  loadPosts()
}

// 跳转详情
const goToDetail = (id) => {
  router.push(`/community/post/${id}`)
}

// 跳转话题详情
const goToTopic = (topicId) => {
  router.push(`/community/topic/${topicId}`)
}

// 发布成功
const handlePublishSuccess = () => {
  showPublish.value = false
  page.value = 1
  loadPosts()
  ElMessage.success('发布成功！')
}

// 初始化
onMounted(() => {
  loadTopics()
  loadPosts()
})
</script>

<style scoped lang="scss">
.community-feed {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;

  .tabs {
    display: flex;
    gap: 20px;

    .tab-item {
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background: #f5f5f5;
      }

      &.active {
        background: #409eff;
        color: white;
      }
    }
  }
}

.topics-bar {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  .label {
    font-weight: 600;
    color: #666;
  }
}

.loading-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  font-size: 16px;
  color: #666;

  .el-icon {
    font-size: 32px;
    margin-bottom: 10px;
  }
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.post-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .post-cover {
    width: 100%;
    height: 240px;
    overflow: hidden;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-error {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: #f5f5f5;
      color: #ccc;
      font-size: 48px;
    }
  }

  .post-info {
    padding: 15px;

    .post-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 10px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .post-stats {
      display: flex;
      gap: 15px;
      color: #999;
      font-size: 14px;

      span {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }
  }
}

.empty-box {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}
</style>

