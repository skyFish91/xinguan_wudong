<template>
  <div class="topic-list-page">
    <div class="wd-container wd-page">
      <PageBack />
      <!-- 页头 -->
      <header class="page-head">
        <h1 class="page-title">热门话题</h1>
        <p class="page-sub">跟着话题读游记，找到同好与路线</p>
      </header>

      <!-- 搜索框（液态玻璃吸顶） -->
      <div class="search-bar glass-strong">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索话题名称或简介…"
          size="large"
          clearable
          :prefix-icon="Search"
        />
        <span class="search-count" v-if="searchKeyword.trim()">
          匹配 {{ filteredTopics.length }} 个话题
        </span>
      </div>

      <!-- 骨架屏 -->
      <div v-if="loading" class="wd-grid wd-grid-3">
        <div v-for="i in 6" :key="`s${i}`" class="wd-skel-card">
          <div class="wd-skeleton wd-skel-cover topic-skel-cover"></div>
          <div class="wd-skel-body">
            <div class="wd-skeleton wd-skel-title"></div>
            <div class="wd-skeleton wd-skel-text"></div>
            <div class="wd-skeleton wd-skel-text wd-skel-short"></div>
          </div>
        </div>
      </div>

      <!-- 话题卡片 -->
      <div v-else-if="filteredTopics.length" class="wd-grid wd-grid-3">
        <article
          v-for="(topic, i) in filteredTopics"
          :key="topic.id"
          class="wd-card wd-card-hover topic-card wd-rise"
          :style="{ animationDelay: `${Math.min(i, 8) * 45}ms` }"
          @click="goToTopic(topic.id)"
        >
          <div class="wd-media topic-cover">
            <img :src="img(topic.cover, topic.name, true)" :alt="topic.name" @error="imgError" />
            <span class="wd-chip hash-chip"># {{ topic.name }}</span>
          </div>

          <div class="wd-card-body">
            <div class="topic-head">
              <h3 class="wd-title topic-name clamp-1">{{ topic.name }}</h3>
              <button
                class="follow-btn"
                :class="{ followed: isFollowed(topic.id) }"
                @click.stop="handleFollowTopic(topic)"
              >
                {{ isFollowed(topic.id) ? '已关注' : '+ 关注' }}
              </button>
            </div>

            <p class="topic-desc clamp-2">{{ topic.intro || topic.description || '还没有简介，点进去看看大家在聊什么' }}</p>

            <div class="topic-stats">
              <div class="stat">
                <span class="value">{{ formatCount(topic.postCount) }}</span>
                <span class="label">篇游记</span>
              </div>
              <div class="divider"></div>
              <div class="stat">
                <span class="value">{{ formatCount(topic.followCount) }}</span>
                <span class="label">人关注</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 空状态 -->
      <div v-else class="wd-card">
        <EmptyState
          :variant="searchKeyword.trim() ? 'search' : 'default'"
          :title="searchKeyword.trim() ? '没有匹配的话题' : '还没有话题'"
          :desc="searchKeyword.trim()
            ? '换个关键词试试，或直接发起一个新话题。'
            : '话题由游记沉淀而来，发一篇游记就能带出新的讨论。'"
        >
          <el-button v-if="searchKeyword.trim()" @click="searchKeyword = ''">清空搜索</el-button>
          <router-link to="/community/publish"><el-button type="primary">发布游记</el-button></router-link>
        </EmptyState>
      </div>

      <!-- 分页 -->
      <div class="pager-wrap" v-if="filteredTopics.length && pagination.total > size">
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
import PageBack from '../../components/PageBack.vue';
import EmptyState from '../../components/EmptyState.vue';
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { communityApi } from '@/api/community'
import { img, imgError } from '../../utils/media'

const router = useRouter()

const topics = ref([])
const loading = ref(true)
const searchKeyword = ref('')
const page = ref(1)
const size = ref(15)
const pagination = ref({ total: 0, page: 1, size: 15 })
const followedTopics = ref(new Set())

const filteredTopics = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return topics.value
  return topics.value.filter(
    (t) =>
      String(t.name || '').toLowerCase().includes(kw) ||
      String(t.intro || t.description || '').toLowerCase().includes(kw)
  )
})

const loadTopics = async () => {
  loading.value = true
  try {
    const res = await communityApi.getTopics({ page: 1, size: 100 })
    topics.value = res.list || []
    pagination.value = res.pagination || { total: topics.value.length }
  } catch (error) {
    ElMessage.error('加载话题失败')
    topics.value = []
  } finally {
    loading.value = false
  }
}

const isFollowed = (topicId) => followedTopics.value.has(topicId)

const handleFollowTopic = async (topic) => {
  try {
    await communityApi.followTopic(topic.id)
    if (followedTopics.value.has(topic.id)) {
      followedTopics.value.delete(topic.id)
      topic.followCount = Math.max(0, (topic.followCount || 0) - 1)
      ElMessage.success('已取消关注')
    } else {
      followedTopics.value.add(topic.id)
      topic.followCount = (topic.followCount || 0) + 1
      ElMessage.success('关注成功')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handlePageChange = (newPage) => {
  page.value = newPage
  loadTopics()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToTopic = (topicId) => router.push(`/community/topic/${topicId}`)

const formatCount = (count) => {
  const n = Number(count) || 0
  return n >= 10000 ? `${(n / 10000).toFixed(1)}w` : n
}

onMounted(() => loadTopics())
</script>

<style scoped>
.topic-list-page {
  min-height: 100vh;
  padding-bottom: var(--wd-s9);
}

.page-head {
  padding-bottom: var(--wd-s5);
}
.page-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-text-1);
}
.page-sub {
  margin-top: 8px;
  font-size: 13.5px;
  color: var(--wd-text-3);
}

.search-bar {
  position: sticky;
  top: 80px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: var(--wd-s4);
  margin-bottom: var(--wd-s6);
  padding: 10px 16px;
  border-radius: var(--wd-r-pill);
  box-shadow: var(--wd-sh-1);
}
.search-count {
  flex-shrink: 0;
  font-size: 12.5px;
  color: var(--wd-text-3);
}

/* 话题卡 */
.topic-cover {
  height: 172px;
}
.hash-chip {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  overflow: hidden;
  text-overflow: ellipsis;
}

.topic-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.topic-name {
  flex: 1;
  min-width: 0;
  font-size: 17px;
}
.follow-btn {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: var(--wd-r-pill);
  border: 1px solid rgba(var(--wd-brand-rgb), 0.3);
  background: var(--wd-brand-soft);
  color: var(--wd-brand);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.24s var(--wd-ease);
}
.follow-btn:hover {
  background: var(--wd-brand);
  border-color: var(--wd-brand);
  color: #fff;
}
.follow-btn.followed {
  border-color: var(--wd-border-strong);
  background: #f1f3f7;
  color: var(--wd-text-3);
}
.follow-btn.followed:hover {
  background: #e8ebf1;
  color: var(--wd-text-2);
}

.topic-desc {
  margin-top: 10px;
  min-height: 42px;
  font-size: 13px;
  line-height: 1.65;
  color: var(--wd-text-3);
}

.topic-stats {
  display: flex;
  align-items: center;
  margin-top: var(--wd-s4);
  padding-top: var(--wd-s4);
  border-top: 1px solid var(--wd-border);
}
.topic-stats .stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.topic-stats .divider {
  width: 1px;
  height: 22px;
  background: var(--wd-border);
}
.topic-stats .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--wd-text-1);
  font-variant-numeric: tabular-nums;
}
.topic-stats .label {
  font-size: 11.5px;
  color: var(--wd-text-4);
}

.topic-skel-cover {
  height: 172px;
}

.pager-wrap {
  display: flex;
  justify-content: center;
  padding: var(--wd-s8) 0 0;
}

@media (max-width: 760px) {
  .search-bar {
    flex-direction: column;
    align-items: stretch;
    border-radius: var(--wd-r-lg);
  }
}
</style>
