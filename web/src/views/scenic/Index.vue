<template>
  <div class="scenic-page">
    <div class="header">
      <h1>景点推荐</h1>
      <el-input
        v-model="keyword"
        placeholder="搜索景点..."
        @change="loadList"
        clearable
        style="width: 300px"
      />
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="scenic-grid">
      <div v-for="scenic in list" :key="scenic.id" class="scenic-card" @click="goDetail(scenic.id)">
        <img :src="scenic.mainImage" :alt="scenic.name" class="scenic-image" />
        <div class="scenic-content">
          <h3>{{ scenic.name }}</h3>
          <p class="intro" v-if="scenic.intro">{{ scenic.intro }}</p>
          <div class="scenic-footer">
            <span class="level">{{ scenic.level }}</span>
            <div class="rating">
              <span class="stars">⭐ {{ scenic.rating }}</span>
              <span class="reviews">({{ scenic.reviewCount }}条评价)</span>
            </div>
            <span class="price">¥{{ scenic.minPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      :current-page="page"
      :page-size="pageSize"
      :total="total"
      @current-change="changePage"
      layout="total, prev, pager, next"
      style="margin-top: 20px; text-align: center"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '../../api/request.js'

const router = useRouter()
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const loading = ref(false)

const loadList = async () => {
  loading.value = true
  try {
    const res = await request.get('/app/m4-travel/scenic/list', {
      params: {
        page: page.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
      },
    })
    if (res.code === 1000) {
      list.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.msg || '加载失败')
    }
  } catch (error) {
    ElMessage.error('加载景点失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage) => {
  page.value = newPage
  loadList()
}

const goDetail = (id) => {
  router.push(`/scenic/${id}`)
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.scenic-page {
  padding: 20px;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 28px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 16px;
  color: #999;
}

.scenic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.scenic-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.scenic-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.scenic-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.scenic-content {
  padding: 16px;
}

.scenic-content h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.intro {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scenic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.level {
  background: #ffc069;
  color: #333;
  padding: 2px 8px;
  border-radius: 3px;
  font-weight: bold;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ff6b6b;
}

.price {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: bold;
}
</style>
