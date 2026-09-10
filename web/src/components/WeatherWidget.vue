<template>
  <div class="weather-widget" @click="showDetail = true">
    <div class="weather-current">
      <div class="weather-icon-large">{{ currentWeather.icon }}</div>
      <div class="weather-info">
        <div class="weather-temp">{{ currentWeather.temp }}°C</div>
        <div class="weather-desc">{{ currentWeather.text }}</div>
        <div class="weather-location">
          <el-icon><Location /></el-icon>
          {{ location }}
        </div>
      </div>
      <div class="weather-detail-hint">
        <el-icon><ArrowRight /></el-icon>
        <span>查看详情</span>
      </div>
    </div>
  </div>

  <!-- 天气详情弹窗 -->
  <el-dialog
    v-model="showDetail"
    title="天气详情"
    width="900px"
    :close-on-click-modal="true"
  >
    <div class="weather-detail-content">
      <!-- 当前天气详细信息 -->
      <div class="current-detail">
        <div class="current-left">
          <div class="current-icon">{{ currentWeather.icon }}</div>
          <div class="current-temp">{{ currentWeather.temp }}°C</div>
          <div class="current-text">{{ currentWeather.text }}</div>
        </div>
        <div class="current-right">
          <div class="weather-item">
            <el-icon><Sunny /></el-icon>
            <span class="label">体感温度</span>
            <span class="value">{{ currentWeather.feelsLike }}°C</span>
          </div>
          <div class="weather-item">
            <el-icon><Umbrella /></el-icon>
            <span class="label">降水概率</span>
            <span class="value">{{ currentWeather.precipitation }}%</span>
          </div>
          <div class="weather-item">
            <el-icon><Wind /></el-icon>
            <span class="label">风速</span>
            <span class="value">{{ currentWeather.windSpeed }} km/h</span>
          </div>
          <div class="weather-item">
            <el-icon><View /></el-icon>
            <span class="label">能见度</span>
            <span class="value">{{ currentWeather.visibility }} km</span>
          </div>
          <div class="weather-item">
            <el-icon><Cherry /></el-icon>
            <span class="label">湿度</span>
            <span class="value">{{ currentWeather.humidity }}%</span>
          </div>
          <div class="weather-item">
            <el-icon><Compass /></el-icon>
            <span class="label">气压</span>
            <span class="value">{{ currentWeather.pressure }} hPa</span>
          </div>
        </div>
      </div>

      <!-- 每小时天气预报 -->
      <div class="hourly-section">
        <h3 class="section-title">24小时预报</h3>
        <div class="hourly-scroll">
          <div
            v-for="hour in hourlyWeather"
            :key="hour.time"
            class="hour-item"
          >
            <div class="hour-time">{{ hour.time }}</div>
            <div class="hour-icon">{{ hour.icon }}</div>
            <div class="hour-temp">{{ hour.temp }}°</div>
            <div class="hour-rain">
              <el-icon><Umbrella /></el-icon>
              {{ hour.rain }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 未来7天天气预报 -->
      <div class="daily-section">
        <h3 class="section-title">7天预报</h3>
        <div class="daily-list">
          <div
            v-for="day in dailyWeather"
            :key="day.date"
            class="day-item"
          >
            <div class="day-date">
              <div class="day-name">{{ day.dayName }}</div>
              <div class="day-number">{{ day.date }}</div>
            </div>
            <div class="day-icon">{{ day.icon }}</div>
            <div class="day-desc">{{ day.text }}</div>
            <div class="day-temp">
              <span class="temp-high">{{ day.high }}°</span>
              <div class="temp-bar">
                <div class="temp-fill" :style="{ width: day.tempPercent + '%' }"></div>
              </div>
              <span class="temp-low">{{ day.low }}°</span>
            </div>
            <div class="day-rain">
              <el-icon><Umbrella /></el-icon>
              {{ day.rain }}%
            </div>
            <div class="day-wind">
              <el-icon><Wind /></el-icon>
              {{ day.wind }}
            </div>
          </div>
        </div>
      </div>

      <!-- 旅游建议 -->
      <div class="suggestions">
        <h3 class="section-title">出游建议</h3>
        <div class="suggestion-grid">
          <div class="suggestion-item" :class="getSuggestionClass('comfort')">
            <el-icon><Sunny /></el-icon>
            <div class="suggestion-label">舒适度</div>
            <div class="suggestion-value">{{ suggestions.comfort }}</div>
          </div>
          <div class="suggestion-item" :class="getSuggestionClass('uv')">
            <el-icon><View /></el-icon>
            <div class="suggestion-label">紫外线</div>
            <div class="suggestion-value">{{ suggestions.uv }}</div>
          </div>
          <div class="suggestion-item" :class="getSuggestionClass('travel')">
            <el-icon><Guide /></el-icon>
            <div class="suggestion-label">旅游指数</div>
            <div class="suggestion-value">{{ suggestions.travel }}</div>
          </div>
          <div class="suggestion-item" :class="getSuggestionClass('clothing')">
            <el-icon><Shirt /></el-icon>
            <div class="suggestion-label">穿衣建议</div>
            <div class="suggestion-value">{{ suggestions.clothing }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Location,
  ArrowRight,
  Sunny,
  Umbrella,
  Wind,
  View,
  Cherry,
  Compass,
  Guide,
  Shirt
} from '@element-plus/icons-vue'

interface Props {
  location?: string
}

const props = withDefaults(defineProps<Props>(), {
  location: '黔东南'
})

const showDetail = ref(false)

// 当前天气
const currentWeather = ref({
  icon: '☀️',
  temp: 26,
  text: '晴',
  feelsLike: 28,
  precipitation: 10,
  windSpeed: 12,
  visibility: 10,
  humidity: 65,
  pressure: 1013
})

// 每小时天气（24小时）
const hourlyWeather = ref<any[]>([])

// 每日天气（7天）
const dailyWeather = ref<any[]>([])

// 出游建议
const suggestions = ref({
  comfort: '舒适',
  uv: '中等',
  travel: '适宜',
  clothing: '短袖衬衫'
})

function getSuggestionClass(type: string) {
  const value = suggestions.value[type as keyof typeof suggestions.value]
  if (['适宜', '舒适', '弱'].includes(value)) return 'good'
  if (['较适宜', '较舒适', '中等'].includes(value)) return 'medium'
  return 'bad'
}

function generateHourlyWeather() {
  const icons = ['☀️', '⛅', '☁️', '🌤️']
  const hours: any[] = []
  const now = new Date()

  for (let i = 0; i < 24; i++) {
    const hour = new Date(now.getTime() + i * 60 * 60 * 1000)
    const hourNum = hour.getHours()
    hours.push({
      time: hourNum === 0 ? '现在' : `${hourNum}:00`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      temp: Math.floor(20 + Math.random() * 10),
      rain: Math.floor(Math.random() * 30)
    })
  }

  hourlyWeather.value = hours
}

function generateDailyWeather() {
  const weatherList = [
    { icon: '☀️', text: '晴' },
    { icon: '⛅', text: '多云' },
    { icon: '☁️', text: '阴' },
    { icon: '🌤️', text: '晴转多云' },
    { icon: '🌧️', text: '小雨' },
    { icon: '⛈️', text: '雷阵雨' }
  ]

  const days = ['今天', '明天', '后天', '周四', '周五', '周六', '周日']
  const dailyList: any[] = []
  const now = new Date()

  for (let i = 0; i < 7; i++) {
    const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000)
    const weather = weatherList[Math.floor(Math.random() * weatherList.length)]
    const high = Math.floor(25 + Math.random() * 10)
    const low = Math.floor(15 + Math.random() * 8)

    dailyList.push({
      dayName: days[i] || `周${date.getDay()}`,
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      icon: weather.icon,
      text: weather.text,
      high,
      low,
      tempPercent: ((high - 10) / 25) * 100,
      rain: Math.floor(Math.random() * 50),
      wind: `${Math.floor(2 + Math.random() * 3)}级`
    })
  }

  dailyWeather.value = dailyList
}

onMounted(() => {
  generateHourlyWeather()
  generateDailyWeather()
})
</script>

<style scoped>
.weather-widget {
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 20px;
  color: white;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.weather-widget:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

.weather-current {
  display: flex;
  align-items: center;
  gap: 16px;
}

.weather-icon-large {
  font-size: 60px;
}

.weather-info {
  flex: 1;
}

.weather-temp {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 4px;
}

.weather-desc {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.weather-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  opacity: 0.8;
}

.weather-detail-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.weather-detail-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.current-detail {
  display: flex;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.current-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.current-icon {
  font-size: 80px;
  margin-bottom: 10px;
}

.current-temp {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 8px;
}

.current-text {
  font-size: 18px;
  opacity: 0.9;
}

.current-right {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.weather-item .label {
  font-size: 13px;
  opacity: 0.8;
}

.weather-item .value {
  font-size: 18px;
  font-weight: 600;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: #667eea;
  border-radius: 2px;
}

.hourly-scroll {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
}

.hour-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 16px 12px;
  background: #f7fafc;
  border-radius: 12px;
  min-width: 80px;
  transition: all 0.3s;
}

.hour-item:hover {
  background: #edf2f7;
  transform: translateY(-4px);
}

.hour-time {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.hour-icon {
  font-size: 32px;
}

.hour-temp {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.hour-rain {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #718096;
}

.daily-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-item {
  display: grid;
  grid-template-columns: 100px 60px 100px 1fr 80px 80px;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.day-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.day-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-name {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
}

.day-number {
  font-size: 13px;
  color: #718096;
}

.day-icon {
  font-size: 32px;
  text-align: center;
}

.day-desc {
  font-size: 14px;
  color: #4a5568;
}

.day-temp {
  display: flex;
  align-items: center;
  gap: 12px;
}

.temp-high {
  font-size: 16px;
  font-weight: 600;
  color: #e53e3e;
  min-width: 35px;
}

.temp-low {
  font-size: 16px;
  font-weight: 600;
  color: #4299e1;
  min-width: 35px;
}

.temp-bar {
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  min-width: 100px;
}

.temp-fill {
  height: 100%;
  background: linear-gradient(90deg, #4299e1 0%, #e53e3e 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.day-rain,
.day-wind {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #718096;
}

.suggestions {
  padding: 20px;
  background: #f7fafc;
  border-radius: 16px;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.suggestion-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.suggestion-item.good {
  border-color: #48bb78;
}

.suggestion-item.medium {
  border-color: #ed8936;
}

.suggestion-item.bad {
  border-color: #f56565;
}

.suggestion-item .el-icon {
  font-size: 32px;
}

.suggestion-item.good .el-icon {
  color: #48bb78;
}

.suggestion-item.medium .el-icon {
  color: #ed8936;
}

.suggestion-item.bad .el-icon {
  color: #f56565;
}

.suggestion-label {
  font-size: 13px;
  color: #718096;
}

.suggestion-value {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

@media (max-width: 768px) {
  .current-detail {
    flex-direction: column;
  }

  .current-left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .current-right {
    grid-template-columns: repeat(2, 1fr);
  }

  .day-item {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .suggestion-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
