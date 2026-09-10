<template>
  <div class="search-page">
    <div class="page-container">
      <!-- 搜索栏 -->
      <div class="search-header">
        <div class="search-box">
          <el-input
            v-model="keyword"
            placeholder="搜索景区、路线、地点..."
            size="large"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>

        <!-- 筛选条件 -->
        <div class="filter-bar" v-if="hasSearched">
          <div class="filter-item">
            <span class="filter-label">分类：</span>
            <el-radio-group v-model="filterType" @change="applyFilter">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="scenic">景区</el-radio-button>
              <el-radio-button label="route">路线</el-radio-button>
            </el-radio-group>
          </div>

          <div class="filter-item">
            <span class="filter-label">排序：</span>
            <el-select v-model="sortBy" placeholder="排序方式" @change="applyFilter">
              <el-option label="综合排序" value="default" />
              <el-option label="评分最高" value="rating" />
              <el-option label="价格最低" value="price_asc" />
              <el-option label="价格最高" value="price_desc" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- 未搜索：显示搜索历史和热门搜索 -->
      <div v-if="!hasSearched" class="search-guide">
        <div class="guide-section" v-if="searchHistory.length > 0">
          <div class="section-header">
            <h3>搜索历史</h3>
            <el-button text type="danger" size="small" @click="clearHistory">
              清空
            </el-button>
          </div>
          <div class="tag-list">
            <el-tag
              v-for="(item, idx) in searchHistory"
              :key="idx"
              size="large"
              @click="keyword = item; handleSearch()"
              closable
              @close="removeHistory(idx)"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>

        <div class="guide-section">
          <div class="section-header">
            <h3>热门搜索</h3>
          </div>
          <div class="tag-list">
            <el-tag
              v-for="item in hotKeywords"
              :key="item"
              size="large"
              type="danger"
              effect="plain"
              @click="keyword = item; handleSearch()"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 搜索结果 -->
      <div v-else class="search-results">
        <div class="result-header">
          <span class="result-count">
            找到 <strong>{{ filteredResults.length }}</strong> 个结果
          </span>
        </div>

        <div v-if="filteredResults.length === 0" class="no-result">
          <el-empty description="没有找到相关结果">
            <el-button type="primary" @click="hasSearched = false">
              返回
            </el-button>
          </el-empty>
        </div>

        <div v-else class="result-list">
          <!-- 景区结果 -->
          <div
            v-for="item in filteredResults"
            :key="`${item.type}_${item.id}`"
            class="result-item"
            @click="handleItemClick(item)"
          >
            <img :src="item.main_image || item.image" @error="onImageError" />
            <div class="item-info">
              <div class="item-header">
                <h3>{{ item.name || item.title }}</h3>
                <el-tag size="small" :type="item.type === 'scenic' ? 'success' : 'warning'">
                  {{ item.type === 'scenic' ? '景区' : '路线' }}
                </el-tag>
              </div>
              <p class="item-desc">{{ item.intro || item.description }}</p>
              <div class="item-footer">
                <div class="item-meta">
                  <span class="location">
                    <el-icon><Location /></el-icon>
                    {{ item.address || item.departure }}
                  </span>
                  <span v-if="item.open_time" class="time">
                    <el-icon><Clock /></el-icon>
                    {{ item.open_time }}
                  </span>
                  <span v-if="item.days" class="days">
                    <el-icon><Calendar /></el-icon>
                    {{ item.days }} 天
                  </span>
                </div>
                <div class="item-price">
                  <span class="price-label">¥</span>
                  <span class="price-value">{{ getPrice(item) }}</span>
                  <span class="price-unit">起</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Location, Clock, Calendar } from '@element-plus/icons-vue'
import { scenicApi, routeApi } from '@/api'

const router = useRouter()
const route = useRoute()

const keyword = ref('')
const hasSearched = ref(false)
const loading = ref(false)

const filterType = ref('all')
const sortBy = ref('default')

const scenicResults = ref<any[]>([])
const routeResults = ref<any[]>([])

const searchHistory = ref<string[]>([])
const hotKeywords = ['西江千户苗寨', '镇远古城', '荔波小七孔', '梵净山', '黄果树瀑布', '青岩古镇']

// 合并搜索结果
const allResults = computed(() => {
  const scenic = scenicResults.value.map(item => ({ ...item, type: 'scenic' }))
  const route = routeResults.value.map(item => ({ ...item, type: 'route' }))
  return [...scenic, ...route]
})

// 筛选结果
const filteredResults = computed(() => {
  let results = allResults.value

  // 按类型筛选
  if (filterType.value !== 'all') {
    results = results.filter(item => item.type === filterType.value)
  }

  // 排序
  if (sortBy.value === 'rating') {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sortBy.value === 'price_asc') {
    results.sort((a, b) => getPrice(a) - getPrice(b))
  } else if (sortBy.value === 'price_desc') {
    results.sort((a, b) => getPrice(b) - getPrice(a))
  }

  return results
})

function getPrice(item: any): number {
  if (item.type === 'scenic') {
    return item.min_price ? item.min_price / 100 : 0
  } else {
    return item.price ? item.price / 100 : 0
  }
}

function onImageError(e: Event) {
  ;(e.target as HTMLImageElement).src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext x="100" y="80" text-anchor="middle" font-size="40"%3E🏔️%3C/text%3E%3C/svg%3E'
}

async function handleSearch() {
  const kw = keyword.value.trim()
  console.log('开始搜索，关键词:', kw)

  if (!kw) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    // 保存到搜索历史
    addToHistory(kw)

    // 获取所有数据（不传 keyword，在前端过滤）
    console.log('正在请求数据...')
    const [scenicRes, routeRes] = await Promise.all([
      scenicApi.list({ size: 100 }),
      routeApi.list({ size: 100 })
    ])

    console.log('景区数据:', scenicRes.data.data.list?.length, '条')
    console.log('路线数据:', routeRes.data.data.list?.length, '条')

    // 前端过滤：关键词匹配名称、地址、简介
    const kwLower = kw.toLowerCase()

    scenicResults.value = (scenicRes.data.data.list || []).filter((item: any) => {
      const name = (item.name || '').toLowerCase()
      const address = (item.address || '').toLowerCase()
      const intro = (item.intro || '').toLowerCase()
      return name.includes(kwLower) || address.includes(kwLower) || intro.includes(kwLower)
    })

    routeResults.value = (routeRes.data.data.list || []).filter((item: any) => {
      const title = (item.title || '').toLowerCase()
      const departure = (item.departure || '').toLowerCase()
      const destination = (item.destination || '').toLowerCase()
      const description = (item.description || '').toLowerCase()
      return title.includes(kwLower) || departure.includes(kwLower) ||
             destination.includes(kwLower) || description.includes(kwLower)
    })

    console.log('筛选后景区:', scenicResults.value.length, '条')
    console.log('筛选后路线:', routeResults.value.length, '条')
    console.log('所有结果:', allResults.value.length, '条')

    if (allResults.value.length === 0) {
      ElMessage.info('没有找到相关结果，试试其他关键词')
    }
  } catch (err) {
    console.error('搜索失败:', err)
    ElMessage.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  // 筛选和排序已通过 computed 自动应用
}

function handleItemClick(item: any) {
  if (item.type === 'scenic') {
    router.push(`/scenic/${item.id}`)
  } else {
    router.push(`/route/${item.id}`)
  }
}

function addToHistory(kw: string) {
  // 移除重复
  const history = searchHistory.value.filter(item => item !== kw)
  // 添加到最前面
  history.unshift(kw)
  // 最多保留 10 条
  searchHistory.value = history.slice(0, 10)
  // 持久化
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

function removeHistory(index: number) {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('search_history', JSON.stringify(searchHistory.value))
}

function clearHistory() {
  searchHistory.value = []
  localStorage.removeItem('search_history')
  ElMessage.success('已清空搜索历史')
}

onMounted(() => {
  // 读取搜索历史
  try {
    const history = localStorage.getItem('search_history')
    if (history) {
      searchHistory.value = JSON.parse(history)
    }
  } catch {}

  // 从 URL 参数读取关键词
  const q = route.query.q as string
  if (q) {
    keyword.value = q
    handleSearch()
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-box {
  margin-bottom: 20px;
}

.filter-bar {
  display: flex;
  gap: 30px;
  padding-top: 20px;
  border-top: 1px solid #f1f3f5;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  color: #4a5568;
  white-space: nowrap;
}

.search-guide {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.guide-section {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-list .el-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-list .el-tag:hover {
  transform: translateY(-2px);
}

.search-results {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.result-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #f1f3f5;
  margin-bottom: 20px;
}

.result-count {
  font-size: 15px;
  color: #4a5568;
}

.result-count strong {
  color: #667eea;
  font-size: 18px;
}

.no-result {
  padding: 60px 0;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.result-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.result-item img {
  width: 200px;
  height: 150px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.item-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #718096;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.item-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #718096;
}

.item-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-price {
  display: flex;
  align-items: baseline;
  color: #e53e3e;
}

.price-label {
  font-size: 16px;
  font-weight: 600;
}

.price-value {
  font-size: 28px;
  font-weight: 700;
}

.price-unit {
  font-size: 14px;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .result-item {
    flex-direction: column;
  }

  .result-item img {
    width: 100%;
    height: 200px;
  }

  .filter-bar {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
