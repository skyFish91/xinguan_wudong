<template>
  <div class="topic-list-page">
    <div class="container">
      <!-- 顶部导航 -->
      <div class="page-header">
        <h1>📌 热门话题</h1>
        <p class="subtitle">发现有趣的话题，分享你的见闻</p>
      </div>

      <!-- 搜索和筛选 -->
      <div class="filter-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索话题..."
          clearable
          @keyup.enter="handleSearch"
          @input="handleSearch"
          style="width: 300px"
        >
          <template #suffix>
            <el-icon style="cursor: pointer" @click="handleSearch">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <!-- 话题列表 -->
      <div v-if="loading" class="loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <p>加载中...</p>
      </div>

      <div v-else-if="filteredTopics.length" class="topics-grid">
        <el-card
          v-for="topic in filteredTopics"
          :key="topic.id"
          shadow="hover"
          class="topic-card"
          @click="goToTopic(topic.id)"
        >
          <!-- 话题背景图 -->
          <div class="topic-image-wrapper">
            <img
              :src="getTopicImage(topic.name)"
              :alt="topic.name"
              class="topic-image"
              onerror="this.src='https://via.placeholder.com/300x200?text=话题'"
            />
          </div>

          <!-- 话题头部 -->
          <div class="topic-header">
            <div class="topic-info">
              <h3 class="topic-name">#{{ topic.name }}</h3>
              <p class="topic-desc">{{ topic.intro || '暂无描述' }}</p>
            </div>
            <el-button
              v-if="!isFollowed(topic.id)"
              type="primary"
              round
              size="small"
              @click.stop="handleFollowTopic(topic.id, true)"
            >
              + 关注
            </el-button>
            <el-button
              v-else
              round
              size="small"
              @click.stop="handleFollowTopic(topic.id, false)"
            >
              已关注
            </el-button>
          </div>

          <!-- 话题统计 -->
          <div class="topic-stats">
            <div class="stat">
              <span class="label">游记</span>
              <span class="value">{{ topic.postCount || 0 }}</span>
            </div>
            <div class="stat">
              <span class="label">关注</span>
              <span class="value">{{ topic.followCount || 0 }}</span>
            </div>
          </div>
        </el-card>
      </div>

      <el-empty v-else description="暂无话题" />

      <!-- 分页 -->
      <div v-if="filteredTopics.length && pagination.total > size" class="pagination">
        <el-pagination
          :current-page="page"
          :page-size="size"
          :total="pagination.total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { communityApi } from '@/api/community'
import { Search, Loading } from '@element-plus/icons-vue'

const router = useRouter()

const topics = ref([])
const loading = ref(false)
const searchKeyword = ref('')
const page = ref(1)
const size = ref(15)
const pagination = ref({ total: 0, page: 1, size: 15 })
const followedTopics = ref(new Set())

// 本地搜索过滤
const filteredTopics = computed(() => {
  if (!searchKeyword.value.trim()) {
    return topics.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return topics.value.filter(topic =>
    topic.name.toLowerCase().includes(keyword) ||
    (topic.intro && topic.intro.toLowerCase().includes(keyword))
  )
})

// 加载话题列表
const loadTopics = async () => {
  loading.value = true
  try {
    const res = await communityApi.getTopics({
      page: 1,
      size: 100  // 一次加载所有话题
    })

    console.log('原始响应:', JSON.stringify(res))

    topics.value = res.list || []
    pagination.value = res.pagination || { total: 0 }

    console.log('设置的topics长度:', topics.value.length)
  } catch (error) {
    console.error('加载错误:', error)
    ElMessage.error(error.message || '加载话题失败')
  } finally {
    loading.value = false
  }
}

// 检查是否已关注
const isFollowed = (topicId) => {
  return followedTopics.value.has(topicId)
}

// 关注/取消关注话题
const handleFollowTopic = async (topicId, follow) => {
  try {
    await communityApi.followTopic(topicId)
    if (follow) {
      followedTopics.value.add(topicId)
      ElMessage.success('关注成功')
    } else {
      followedTopics.value.delete(topicId)
      ElMessage.success('已取消关注')
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

// 搜索话题（本地过滤）
const handleSearch = () => {
  // 本地过滤，不需要重新请求
}

// 页码变化
const handlePageChange = (newPage) => {
  page.value = newPage
  loadTopics()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到话题详情
const goToTopic = (topicId) => {
  router.push(`/community/topic/${topicId}`)
}

// 动态加载本地图片
const localImages = import.meta.glob('@/views/community/topics_photos/*.{jpg,jpeg,png}', { eager: true })

// 获取话题对应的图片
const getTopicImage = (topicName) => {
  // 遍历所有加载的图片，找匹配的文件名
  for (const [path, module] of Object.entries(localImages)) {
    // 从路径中提取文件名（不带扩展名）
    const fileName = path.split('/').pop().split('.').slice(0, -1).join('.')
    // 比较话题名和文件名
    if (fileName === topicName) {
      return module.default || path
    }
  }
  // 没找到对应图片，返回第一张作为fallback
  const firstImage = Object.values(localImages)[0]
  return firstImage?.default || 'https://via.placeholder.com/300x200?text=话题'
}

onMounted(() => {
  loadTopics()
})
</script>

<style scoped lang="scss">
.topic-list-page {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 30px;
    text-align: center;

    h1 {
      font-size: 32px;
      margin: 0 0 10px 0;
      color: #333;
    }

    .subtitle {
      font-size: 14px;
      color: #999;
      margin: 0;
    }
  }

  .filter-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: #999;

    .is-loading {
      font-size: 32px;
      margin-bottom: 10px;
      animation: spin 1s linear infinite;
    }

    p {
      margin: 0;
    }
  }

  .topics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .topic-card {
      cursor: pointer;
      transition: all 0.3s;
      height: 100%;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
      }

      .topic-image-wrapper {
        width: 100%;
        height: 180px;
        margin: -20px -20px 16px -20px;
        overflow: hidden;
        border-radius: 4px 4px 0 0;

        .topic-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
      }

      &:hover .topic-image {
        transform: scale(1.05);
      }

      .topic-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 15px;
        margin-bottom: 15px;

        .topic-info {
          flex: 1;

          .topic-name {
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #667eea;
          }

          .topic-desc {
            font-size: 13px;
            color: #999;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }

      .topic-stats {
        display: flex;
        gap: 20px;
        padding-top: 15px;
        border-top: 1px solid #eee;

        .stat {
          flex: 1;
          text-align: center;

          .label {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 4px;
          }

          .value {
            display: block;
            font-size: 18px;
            font-weight: 600;
            color: #667eea;
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
