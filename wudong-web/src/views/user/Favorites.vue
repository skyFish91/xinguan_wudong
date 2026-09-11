<template>
  <div class="favorites-page">
    <h2 class="page-title">我的收藏</h2>

    <div class="favorites-grid" v-loading="loading">
      <div
        v-for="item in favorites"
        :key="item.id"
        class="favorite-card"
      >
        <div class="card-image" :style="{ backgroundImage: `url(${item.image})` }">
          <button class="btn-unfavorite" @click="handleUnfavorite(item)">
            <el-icon><StarFilled /></el-icon>
          </button>
        </div>
        <div class="card-body">
          <h3>{{ item.name }}</h3>
          <p class="address">{{ item.address }}</p>
          <div class="card-footer">
            <el-button type="primary" size="small" @click="handleView(item)">
              查看详情
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="favorites.length === 0" description="暂无收藏" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const favorites = ref([
  {
    id: 1,
    name: '西江千户苗寨',
    address: '贵州省黔东南州雷山县西江镇',
    image: '/images/travel/1.jpg'
  },
  {
    id: 2,
    name: '荔波小七孔',
    address: '贵州省黔南州荔波县',
    image: '/images/travel/3.jpg'
  }
])

async function handleUnfavorite(item: any) {
  try {
    await ElMessageBox.confirm('确认取消收藏吗？', '提示', {
      type: 'warning'
    })
    const index = favorites.value.findIndex(f => f.id === item.id)
    if (index > -1) {
      favorites.value.splice(index, 1)
    }
    ElMessage.success('已取消收藏')
  } catch {}
}

function handleView(item: any) {
  router.push(`/scenic/${item.id}`)
}
</script>

<style scoped>
.page-title {
  font-size: 24px;
  margin-bottom: 30px;
  color: #2d3748;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.favorite-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.favorite-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.card-image {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.btn-unfavorite {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-unfavorite:hover {
  background: white;
  transform: scale(1.1);
}

.card-body {
  padding: 15px;
}

.card-body h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #2d3748;
}

.address {
  font-size: 14px;
  color: #718096;
  margin-bottom: 15px;
}

.card-footer {
  text-align: right;
}
</style>
