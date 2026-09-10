<template>
  <div class="home-page">
    <!-- Hero 大横幅 -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-left">
          <h1 class="hero-title">
            <span class="title-main">探索乌东</span>
            <span class="title-sub">发现黔东南的秘境之美</span>
          </h1>
          <p class="hero-desc">GPS智能定位 · 实时库存查询 · 一键预订</p>

          <!-- 搜索框 -->
          <div class="search-box">
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索景区、路线..."
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
          </div>

          <!-- 快速标签 -->
          <div class="quick-tags">
            <span
              v-for="tag in quickTags"
              :key="tag"
              :class="['tag', { active: selectedTag === tag }]"
              @click="selectTag(tag)"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- 右侧天气卡片 -->
        <div class="hero-right">
          <div class="weather-card clickable" v-if="weather" @click="showWeatherDialog = true">
            <div class="weather-icon">{{ weather.icon }}</div>
            <div class="weather-info">
              <div class="weather-text">{{ weather.text }}</div>
              <div class="weather-temp">{{ weather.temp }}</div>
              <div class="weather-location">📍 {{ userLocation.city }}</div>
            </div>
            <div class="weather-hint">查看详情 →</div>
          </div>

          <!-- 统计数据 -->
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ scenics.length }}</div>
              <div class="stat-label">热门景区</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ routes.length }}</div>
              <div class="stat-label">精选路线</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">1.2k+</div>
              <div class="stat-label">游客好评</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 波浪背景 -->
      <div class="wave-bg">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path fill="#ffffff" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>

    <!-- 距离最近的景区 - 3D卡片 -->
    <section class="section scenic-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">📍</span>
            <span>距离你最近的景区</span>
          </h2>
          <p class="section-subtitle">基于 GPS 定位智能推荐</p>
        </div>

        <div class="scenic-grid" v-loading="loading">
          <div
            v-for="scenic in nearbyScenics"
            :key="scenic.id"
            class="scenic-card"
            @click="$router.push(`/scenic/${scenic.id}`)"
          >
            <div class="card-image-wrapper">
              <div class="card-image" :style="{ backgroundImage: `url(${scenic.main_image})` }">
                <div class="distance-badge">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ scenic.distance }} km
                </div>
                <div class="card-overlay"></div>
              </div>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ scenic.name }}</h3>
              <p class="card-address">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ scenic.address }}
              </p>
              <p class="card-intro">{{ scenic.intro }}</p>
              <div class="card-footer">
                <div class="tags">
                  <span class="tag">{{ scenic.open_time }}</span>
                </div>
                <button class="btn-view">查看详情 →</button>
              </div>
            </div>
          </div>
        </div>

        <div class="view-more">
          <button class="btn-outline" @click="$router.push('/scenic')">
            查看全部景区 ({{ scenics.length }})
          </button>
        </div>
      </div>
    </section>

    <!-- 精选路线 - 时间轴风格 -->
    <section class="section route-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-icon">🗺️</span>
            <span>精选旅游路线</span>
          </h2>
          <p class="section-subtitle">专业策划 · 轻松出游</p>
        </div>

        <div class="route-list" v-loading="routeLoading">
          <div
            v-for="(route, idx) in routes"
            :key="route.id"
            class="route-card"
            :style="{ animationDelay: `${idx * 0.1}s` }"
            @click="$router.push(`/route/${route.id}`)"
          >
            <div class="route-number">{{ idx + 1 }}</div>
            <div class="route-image" :style="{ backgroundImage: `url(${route.main_image})` }">
              <div class="route-badges">
                <span class="badge-days">{{ route.days }}日游</span>
                <span class="badge-theme">{{ route.theme }}</span>
              </div>
            </div>
            <div class="route-content">
              <h3 class="route-title">{{ route.title }}</h3>
              <div class="route-meta">
                <span class="meta-item">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ route.departure }} → {{ route.destination }}
                </span>
              </div>
              <div class="route-includes">
                <span
                  v-for="(item, i) in parseIncludes(route.includes).slice(0, 3)"
                  :key="i"
                  class="include-item"
                >
                  ✓ {{ item }}
                </span>
              </div>
              <div class="route-footer">
                <div class="route-price">
                  <span class="price-label">起价</span>
                  <span class="price-value">¥{{ (route.price / 100).toFixed(0) }}</span>
                </div>
                <button class="btn-book">立即预订</button>
              </div>
            </div>
          </div>
        </div>

        <div class="view-more">
          <button class="btn-outline" @click="$router.push('/route')">
            查看全部路线 ({{ routes.length }})
          </button>
        </div>
      </div>
    </section>

    <!-- CTA 区域 -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">准备好开启你的旅程了吗？</h2>
        <p class="cta-subtitle">立即预订，享受专属优惠</p>
        <div class="cta-buttons">
          <button class="btn-primary" @click="$router.push('/scenic')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            立即出发
          </button>
          <button class="btn-secondary" @click="contactService">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            联系客服
          </button>
        </div>
      </div>
      <div class="cta-particles"></div>
    </section>

    <!-- 天气详情对话框 -->
    <el-dialog
      v-model="showWeatherDialog"
      title=""
      width="900px"
      :close-on-click-modal="true"
      class="weather-dialog"
    >
      <div class="weather-dialog-content">
        <!-- 当前天气 -->
        <div class="current-weather">
          <div class="weather-background"></div>
          <div class="current-main">
            <div class="current-icon">☀️</div>
            <div class="current-temp">25°C</div>
            <div class="current-desc">晴朗 · 适合出游</div>
            <div class="current-location">📍 贵州·黔东南</div>
          </div>
          <div class="current-details">
            <div class="detail-item">
              <div class="detail-icon">🌡️</div>
              <div class="detail-text">
                <span class="detail-label">体感温度</span>
                <span class="detail-value">27°C</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">💧</div>
              <div class="detail-text">
                <span class="detail-label">湿度</span>
                <span class="detail-value">65%</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">💨</div>
              <div class="detail-text">
                <span class="detail-label">风速</span>
                <span class="detail-value">12 km/h</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">☀️</div>
              <div class="detail-text">
                <span class="detail-label">紫外线</span>
                <span class="detail-value">强</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">👁️</div>
              <div class="detail-text">
                <span class="detail-label">能见度</span>
                <span class="detail-value">10 km</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">🌅</div>
              <div class="detail-text">
                <span class="detail-label">日出日落</span>
                <span class="detail-value">06:30/19:15</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 24小时预报 -->
        <div class="forecast-section">
          <h3 class="forecast-title">
            <span class="title-icon">⏰</span>
            24小时预报
          </h3>
          <div class="hourly-forecast">
            <div v-for="hour in hourlyForecast" :key="hour.time" class="hour-item">
              <div class="hour-time">{{ hour.time }}</div>
              <div class="hour-icon">{{ hour.icon }}</div>
              <div class="hour-temp">{{ hour.temp }}°</div>
              <div class="hour-wind">💨 2级</div>
            </div>
          </div>
        </div>

        <!-- 7天预报 -->
        <div class="forecast-section">
          <h3 class="forecast-title">
            <span class="title-icon">📅</span>
            未来7天预报
          </h3>
          <div class="daily-forecast">
            <div v-for="day in dailyForecast" :key="day.date" class="day-item">
              <div class="day-date">{{ day.date }}</div>
              <div class="day-weather">
                <div class="day-icon">{{ day.icon }}</div>
                <div class="day-desc">{{ day.desc }}</div>
              </div>
              <div class="day-temp-bar">
                <div class="temp-range">
                  <span class="temp-low">{{ day.low }}°</span>
                  <div class="temp-progress">
                    <div class="temp-fill" :style="{ width: ((day.high - 15) / 15 * 100) + '%' }"></div>
                  </div>
                  <span class="temp-high">{{ day.high }}°</span>
                </div>
              </div>
              <div class="day-extra">
                <span class="wind-info">💨 东南风 2级</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 出游建议 -->
        <div class="travel-suggestions">
          <h3 class="forecast-title">
            <span class="title-icon">🎒</span>
            出游建议
          </h3>
          <div class="suggestions-grid">
            <div class="suggestion-item excellent">
              <div class="suggestion-icon">🌞</div>
              <div class="suggestion-content">
                <div class="suggestion-label">防晒指数</div>
                <div class="suggestion-level">强</div>
                <div class="suggestion-value">建议涂抹SPF30+防晒霜</div>
              </div>
            </div>
            <div class="suggestion-item good">
              <div class="suggestion-icon">🧥</div>
              <div class="suggestion-content">
                <div class="suggestion-label">穿衣建议</div>
                <div class="suggestion-level">舒适</div>
                <div class="suggestion-value">短袖+薄外套，早晚温差大</div>
              </div>
            </div>
            <div class="suggestion-item excellent">
              <div class="suggestion-icon">📸</div>
              <div class="suggestion-content">
                <div class="suggestion-label">摄影指数</div>
                <div class="suggestion-level">优</div>
                <div class="suggestion-value">光线充足，非常适合拍照</div>
              </div>
            </div>
            <div class="suggestion-item excellent">
              <div class="suggestion-icon">🚶</div>
              <div class="suggestion-content">
                <div class="suggestion-label">旅游指数</div>
                <div class="suggestion-level">适宜</div>
                <div class="suggestion-value">天气晴好，很适合出游</div>
              </div>
            </div>
            <div class="suggestion-item good">
              <div class="suggestion-icon">🏃</div>
              <div class="suggestion-content">
                <div class="suggestion-label">运动指数</div>
                <div class="suggestion-level">适宜</div>
                <div class="suggestion-value">适合户外运动锻炼</div>
              </div>
            </div>
            <div class="suggestion-item moderate">
              <div class="suggestion-icon">😷</div>
              <div class="suggestion-content">
                <div class="suggestion-label">空气质量</div>
                <div class="suggestion-level">良</div>
                <div class="suggestion-value">空气质量良好，可放心外出</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { scenicApi, routeApi, gpsUtils } from '@/api'
import { useChat } from '@/stores/chat'
import { scenicImageMap, routeImageMap } from '@/config/images'

const { openChat } = useChat()
const router = useRouter()

const loading = ref(false)
const routeLoading = ref(false)
const searchKeyword = ref('')
const selectedTag = ref('')
const quickTags = ['亲子游', '摄影', '研学', '古镇']
const showWeatherDialog = ref(false)

const scenics = ref<any[]>([])
const routes = ref<any[]>([])
const userLocation = ref({ lng: 106.71, lat: 26.57, city: '定位中...' })
const weather = ref<any>(null)

// 24小时预报数据
const hourlyForecast = ref([
  { time: '现在', icon: '☀️', temp: 25 },
  { time: '14:00', icon: '☀️', temp: 27 },
  { time: '15:00', icon: '⛅', temp: 28 },
  { time: '16:00', icon: '⛅', temp: 27 },
  { time: '17:00', icon: '⛅', temp: 26 },
  { time: '18:00', icon: '🌤️', temp: 24 },
  { time: '19:00', icon: '🌤️', temp: 22 },
  { time: '20:00', icon: '🌙', temp: 20 },
  { time: '21:00', icon: '🌙', temp: 19 },
  { time: '22:00', icon: '🌙', temp: 18 },
  { time: '23:00', icon: '🌙', temp: 17 },
  { time: '00:00', icon: '🌙', temp: 16 }
])

// 7天预报数据
const dailyForecast = ref([
  { date: '今天', icon: '☀️', desc: '晴', high: 28, low: 18 },
  { date: '明天', icon: '⛅', desc: '多云', high: 27, low: 17 },
  { date: '周五', icon: '☀️', desc: '晴', high: 29, low: 19 },
  { date: '周六', icon: '🌤️', desc: '晴转多云', high: 26, low: 18 },
  { date: '周日', icon: '🌧️', desc: '小雨', high: 23, low: 16 },
  { date: '周一', icon: '⛅', desc: '多云', high: 25, low: 17 },
  { date: '周二', icon: '☀️', desc: '晴', high: 28, low: 19 }
])

const nearbyScenics = computed(() => {
  return scenics.value
    .map((item) => ({
      ...item,
      distance: gpsUtils.calculateDistance(
        userLocation.value.lng,
        userLocation.value.lat,
        parseFloat(item.lng),
        parseFloat(item.lat)
      )
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 6)
})

async function loadScenics() {
  loading.value = true
  try {
    const res = await scenicApi.list({ size: 20 })
    scenics.value = res.data.data.list.map((scenic: any) => {
      // 如果没有主图，使用默认图片
      if (!scenic.main_image) {
        scenic.main_image = getDefaultScenicImage(scenic.name)
      }
      return scenic
    })
  } catch (err) {
    ElMessage.error('加载景区失败')
  } finally {
    loading.value = false
  }
}

async function loadRoutes() {
  routeLoading.value = true
  try {
    const res = await routeApi.list({ size: 6 })
    routes.value = res.data.data.list.map((route: any) => {
      // 如果没有主图，使用默认图片
      if (!route.main_image) {
        route.main_image = getDefaultRouteImage(route.title)
      }
      return route
    })
  } catch (err) {
    ElMessage.error('加载路线失败')
  } finally {
    routeLoading.value = false
  }
}

function getDefaultScenicImage(name: string) {
  // 根据景区名称匹配图片
  for (const [key, imagePath] of Object.entries(scenicImageMap)) {
    if (name.includes(key)) {
      return imagePath
    }
  }
  return '/images/scenic/千户苗寨.jpg'
}

function getDefaultRouteImage(title: string) {
  // 根据路线标题匹配图片
  for (const [key, imagePath] of Object.entries(routeImageMap)) {
    if (title.includes(key)) {
      return imagePath
    }
  }
  return '/images/route/苗岭徒步一日游.jpg'
}

async function getUserLocation() {
  try {
    const pos = await gpsUtils.getCurrentPosition()
    userLocation.value = pos

    // 模拟天气数据
    weather.value = {
      icon: '☀️',
      text: '晴',
      temp: '18-28°C'
    }
  } catch (err) {
    console.warn('定位失败', err)
    userLocation.value.city = '贵阳'
  }
}

function handleSearch() {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  // 跳转到搜索页面，并传递关键词参数
  router.push({ path: '/search', query: { q: keyword } })
}

function selectTag(tag: string) {
  selectedTag.value = selectedTag.value === tag ? '' : tag
  // 点击标签也跳转到搜索页
  router.push({ path: '/search', query: { q: tag } })
}

function parseIncludes(includes: any) {
  if (typeof includes === 'string') {
    try {
      return JSON.parse(includes)
    } catch {
      return []
    }
  }
  return includes || []
}

function contactService() {
  openChat()
}

onMounted(() => {
  getUserLocation()
  loadScenics()
  loadRoutes()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Hero 区域 */
.hero {
  position: relative;
  min-height: 700px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)),
              url('/images/background/首页背景图.jpg') center/cover no-repeat;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 80px 20px 150px;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="0.05" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>') repeat;
  opacity: 0.2;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(0) translateY(0); }
  50% { transform: translateX(-20px) translateY(-20px); }
}

.hero-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  align-items: center;
}

.hero-left {
  color: white;
}

.hero-title {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.title-main {
  font-size: 72px;
  font-weight: 900;
  letter-spacing: -2px;
  background: linear-gradient(90deg, #fff 0%, #ffd89b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-sub {
  font-size: 32px;
  font-weight: 400;
  opacity: 0.95;
}

.hero-desc {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 40px;
}

.search-box {
  display: flex;
  background: white;
  border-radius: 50px;
  padding: 8px 8px 8px 30px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  margin-bottom: 25px;
  transition: all 0.3s;
}

.search-box:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.25);
}

.search-box input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  color: #333;
}

.search-box button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.search-box button:hover {
  transform: scale(1.1);
}

.search-box svg {
  width: 20px;
  height: 20px;
}

.quick-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tag {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.tag:hover,
.tag.active {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
}

.hero-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.weather-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 30px;
  display: flex;
  gap: 20px;
  align-items: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: relative;
}

.weather-card.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.weather-card.clickable:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
}

.weather-hint {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 12px;
  color: #667eea;
  font-weight: 600;
  opacity: 0.8;
}

.weather-icon {
  font-size: 60px;
}

.weather-info {
  flex: 1;
}

.weather-text {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.weather-temp {
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
}

.weather-location {
  font-size: 14px;
  color: #999;
}

/* 天气对话框样式 */
.weather-dialog-content {
  padding: 10px;
}

.current-weather {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  padding: 40px;
  background-image: url('/images/background/天气背景图.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  color: white;
  margin-bottom: 30px;
  overflow: hidden;
}

.current-weather::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.current-weather > * {
  position: relative;
  z-index: 1;
}

.weather-background {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="15" fill="white" opacity="0.05"/><circle cx="60" cy="30" r="20" fill="white" opacity="0.03"/><circle cx="80" cy="70" r="25" fill="white" opacity="0.02"/></svg>') no-repeat;
  background-size: cover;
  opacity: 0.15;
  z-index: 0;
}

.current-main {
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.current-icon {
  font-size: 100px;
  margin-bottom: 15px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.current-temp {
  font-size: 64px;
  font-weight: bold;
  line-height: 1;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.current-desc {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 8px;
}

.current-location {
  font-size: 16px;
  opacity: 0.8;
}

.current-details {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 18px;
  border-radius: 14px;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}

.detail-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateX(5px);
}

.detail-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.detail-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 3px;
}

.detail-value {
  font-size: 20px;
  font-weight: bold;
}

.forecast-section {
  margin-bottom: 35px;
}

.forecast-title {
  font-size: 20px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 20px;
  padding-left: 15px;
  border-left: 5px solid #667eea;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
}

.hourly-forecast {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 15px 5px;
  margin: 0 -10px;
}

.hourly-forecast::-webkit-scrollbar {
  height: 8px;
}

.hourly-forecast::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.hourly-forecast::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.hourly-forecast::-webkit-scrollbar-thumb:hover {
  background: #5568d3;
}

.hour-item {
  flex-shrink: 0;
  text-align: center;
  padding: 18px 12px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 14px;
  min-width: 80px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.hour-item:hover {
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  transform: translateY(-5px);
  border-color: #667eea;
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2);
}

.hour-time {
  font-size: 13px;
  color: #718096;
  margin-bottom: 10px;
  font-weight: 500;
}

.hour-icon {
  font-size: 40px;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.hour-temp {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 5px;
}

.hour-wind {
  font-size: 11px;
  color: #a0aec0;
}

.daily-forecast {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-item {
  display: grid;
  grid-template-columns: 100px 150px 1fr 120px;
  align-items: center;
  gap: 20px;
  padding: 18px 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 14px;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.day-item:hover {
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  transform: translateX(8px);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.day-date {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.day-weather {
  display: flex;
  align-items: center;
  gap: 12px;
}

.day-icon {
  font-size: 36px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.day-desc {
  font-size: 15px;
  color: #4a5568;
  font-weight: 500;
}

.day-temp-bar {
  flex: 1;
}

.temp-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.temp-progress {
  flex: 1;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
}

.temp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1 0%, #e53e3e 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.day-temp {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  font-size: 16px;
  font-weight: 500;
}

.temp-high {
  color: #e53e3e;
  font-weight: bold;
}

.temp-low {
  color: #4299e1;
  font-weight: 500;
}

.day-extra {
  font-size: 13px;
  color: #718096;
}

.wind-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.travel-suggestions {
  padding-top: 10px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.suggestion-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 14px;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.suggestion-item::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background: #cbd5e0;
  transition: all 0.3s;
}

.suggestion-item.excellent::before {
  background: linear-gradient(180deg, #48bb78 0%, #38a169 100%);
}

.suggestion-item.good::before {
  background: linear-gradient(180deg, #4299e1 0%, #3182ce 100%);
}

.suggestion-item.moderate::before {
  background: linear-gradient(180deg, #ed8936 0%, #dd6b20 100%);
}

.suggestion-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.suggestion-icon {
  font-size: 40px;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.suggestion-content {
  flex: 1;
}

.suggestion-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.suggestion-level {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 5px;
  background: #e2e8f0;
  color: #4a5568;
}

.suggestion-item.excellent .suggestion-level {
  background: #c6f6d5;
  color: #22543d;
}

.suggestion-item.good .suggestion-level {
  background: #bee3f8;
  color: #2c5282;
}

.suggestion-item.moderate .suggestion-level {
  background: #feebc8;
  color: #7c2d12;
}

.suggestion-value {
  font-size: 13px;
  color: #718096;
  line-height: 1.5;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.wave-bg {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.wave-bg svg {
  display: block;
  width: 100%;
  height: auto;
}

/* Section 通用样式 */
.section {
  padding: 100px 20px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 48px;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.title-icon {
  font-size: 48px;
}

.section-subtitle {
  font-size: 18px;
  color: #718096;
}

/* 景区卡片 */
.scenic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 35px;
  margin-bottom: 50px;
}

.scenic-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.scenic-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.card-image-wrapper {
  position: relative;
  overflow: hidden;
}

.card-image {
  height: 260px;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.4s;
}

.scenic-card:hover .card-image {
  transform: scale(1.1);
}

.distance-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 18px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.distance-badge svg {
  width: 16px;
  height: 16px;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
}

.card-body {
  padding: 25px;
}

.card-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.card-address {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 14px;
  margin-bottom: 12px;
}

.card-address svg {
  width: 14px;
  height: 14px;
}

.card-intro {
  color: #4a5568;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.tags .tag {
  background: #edf2f7;
  color: #4a5568;
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
}

.btn-view {
  background: transparent;
  border: none;
  color: #667eea;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view:hover {
  transform: translateX(5px);
}

/* 路线卡片 */
.route-section {
  background: white;
}

.route-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 35px;
  margin-bottom: 50px;
}

.route-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  position: relative;
  transition: all 0.4s;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.route-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.route-number {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: #667eea;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.route-image {
  height: 240px;
  background-size: cover;
  background-position: center;
  position: relative;
  transition: transform 0.4s;
}

.route-card:hover .route-image {
  transform: scale(1.08);
}

.route-badges {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
  z-index: 2;
}

.badge-days {
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 4px 15px rgba(255, 87, 34, 0.4);
}

.badge-theme {
  background: rgba(255, 255, 255, 0.95);
  color: #2d3748;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  backdrop-filter: blur(10px);
}

.route-content {
  padding: 25px;
}

.route-title {
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 15px;
}

.route-meta {
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #718096;
  font-size: 14px;
}

.meta-item svg {
  width: 14px;
  height: 14px;
}

.route-includes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.include-item {
  color: #4a5568;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.route-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.route-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-label {
  font-size: 14px;
  color: #718096;
}

.price-value {
  font-size: 32px;
  font-weight: 800;
  color: #e53e3e;
}

.btn-book {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-book:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 查看更多 */
.view-more {
  text-align: center;
}

.btn-outline {
  padding: 15px 40px;
  background: transparent;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

/* CTA 区域 */
.cta-section {
  position: relative;
  background-image: url('/images/scenic/千户苗寨.jpg');
  background-size: cover;
  background-position: center;
  padding: 120px 20px;
  text-align: center;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.cta-particles {
  position: absolute;
  inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="10" cy="10" r="1" fill="white" opacity="0.2"/><circle cx="30" cy="20" r="1" fill="white" opacity="0.3"/><circle cx="50" cy="15" r="1" fill="white" opacity="0.2"/><circle cx="70" cy="25" r="1" fill="white" opacity="0.4"/><circle cx="90" cy="10" r="1" fill="white" opacity="0.2"/></svg>') repeat;
  animation: float 25s linear infinite;
  z-index: 1;
}

.cta-content {
  position: relative;
  z-index: 2;
  color: white;
}

.cta-title {
  font-size: 48px;
  font-weight: 800;
  margin-bottom: 15px;
}

.cta-subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin-bottom: 40px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 18px 40px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: white;
}

.btn-primary svg,
.btn-secondary svg {
  width: 20px;
  height: 20px;
}
</style>
