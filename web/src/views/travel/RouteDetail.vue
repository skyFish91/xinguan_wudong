<template>
  <div class="route-detail-page">
    <!-- Hero 区域 -->
    <div class="route-hero" :style="{ backgroundImage: `url(${routeData.main_image})` }">
      <div class="hero-overlay"></div>
      <button class="btn-back" @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </button>
      <div class="hero-content">
        <div class="hero-info">
          <div class="route-badges" style="text-align: center;">
            <span class="badge days-badge">{{ routeData.days || 3 }}天{{ (routeData.days || 3) - 1 }}晚</span>
            <span class="badge theme-badge">{{ routeData.theme || '深度游' }}</span>
            <el-tag type="success" v-if="routeData.status === 1">热门路线</el-tag>
          </div>
          <h1 class="route-title">{{ routeData.title || '乌东精选路线' }}</h1>
          <div class="route-meta">
            <span class="meta-item">
              <el-icon><Location /></el-icon>
              {{ routeData.departure || '贵阳' }} → {{ routeData.destination || '乌东' }}
            </span>
            <span class="meta-item">
              <el-icon><User /></el-icon>
              已有 {{ bookCount }} 人预订
            </span>
            <span class="meta-item">
              <el-icon><Star /></el-icon>
              {{ avgRating }} 分
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-container">
      <!-- 左侧主内容 -->
      <div class="detail-main">
        <!-- 路线亮点 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Star /></el-icon>
            路线亮点
          </h2>
          <div class="highlights-text">
            <p>精心策划的{{ routeData.days || 3 }}日深度游，带你领略黔东南最精华的景点和最地道的民族文化。专业导游全程陪同，深入了解苗族、侗族的历史文化，品尝特色美食，体验非遗技艺，感受原生态的民族风情。</p>
          </div>
          <div class="highlights-grid">
            <div v-for="(item, idx) in parseIncludes(routeData.includes)" :key="idx" class="highlight-card">
              <div class="highlight-icon">{{ getHighlightIcon(idx) }}</div>
              <div class="highlight-text">{{ item }}</div>
            </div>
          </div>
        </section>

        <!-- 详细介绍 -->
        <section class="section-card" v-if="routeData.detail">
          <h2 class="section-title">
            <el-icon><Document /></el-icon>
            路线详情
          </h2>
          <div class="detail-intro">
            <p class="intro-paragraph">
              这条线路是我们根据多年的旅游经验精心设计的经典路线，将黔东南最具代表性的景点串联起来，既能欣赏到壮丽的自然风光，又能深入体验独特的民族文化。我们的团队由经验丰富的导游和摄影师组成，不仅会带你游览景点，还会为你讲解背后的文化故事，推荐最佳拍摄点，让你的旅行收获满满。
            </p>
            <p class="intro-paragraph">
              行程安排合理，节奏舒适，既有精彩的景点游览，也有自由活动时间。我们精选当地特色酒店和民宿，让你在舒适的环境中体验当地生活。餐食安排注重品质和特色，让你品尝到最地道的苗家菜、侗家菜。全程配备专业摄影师跟拍，记录下你旅行中的精彩瞬间。
            </p>
            <div class="detail-html" v-html="routeData.detail"></div>
          </div>
        </section>

        <!-- 行程安排 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Calendar /></el-icon>
            详细行程
          </h2>
          <div class="itinerary-timeline">
            <div
              v-for="(day, idx) in routeDays"
              :key="day.id"
              class="timeline-item"
              :class="{ expanded: expandedDay === idx }"
            >
              <div class="timeline-marker">
                <div class="marker-dot">
                  <span>D{{ day.day_no }}</span>
                </div>
                <div class="marker-line" v-if="idx < routeDays.length - 1"></div>
              </div>
              <div class="timeline-content">
                <div class="day-header" @click="toggleDay(idx)">
                  <div class="day-title">
                    <h3>第{{ day.day_no }}天</h3>
                    <el-icon class="expand-icon">
                      <ArrowDown v-if="expandedDay !== idx" />
                      <ArrowUp v-else />
                    </el-icon>
                  </div>
                  <p class="day-summary">{{ day.description }}</p>
                </div>
                <transition name="expand">
                  <div class="day-details" v-if="expandedDay === idx">
                    <div class="detail-section" v-if="day.spots">
                      <h4>
                        <el-icon><MapLocation /></el-icon>
                        游览景点
                      </h4>
                      <p class="detail-text">{{ day.spots }}</p>
                      <p class="detail-description">
                        {{ getDayDetailDescription(idx) }}
                      </p>
                    </div>
                    <div class="detail-section" v-if="day.meals">
                      <h4>
                        <el-icon><Food /></el-icon>
                        餐食安排
                      </h4>
                      <p class="detail-text">{{ day.meals }}</p>
                      <p class="detail-description">
                        早餐在酒店享用自助餐，午餐安排特色农家菜，晚餐品尝当地特色美食。所有餐厅均经过我们精心挑选，确保卫生和品质。
                      </p>
                    </div>
                    <div class="detail-section" v-if="day.accommodation">
                      <h4>
                        <el-icon><House /></el-icon>
                        住宿安排
                      </h4>
                      <p class="detail-text">{{ day.accommodation }}</p>
                      <p class="detail-description">
                        入住当地精品酒店或特色民宿，房间配备独立卫浴、空调、WiFi等现代化设施，同时保留当地建筑特色，让你在舒适中体验民族风情。
                      </p>
                    </div>
                    <div class="detail-section" v-if="day.transport">
                      <h4>
                        <el-icon><Van /></el-icon>
                        交通方式
                      </h4>
                      <p class="detail-text">{{ day.transport }}</p>
                      <p class="detail-description">
                        全程使用正规旅游大巴，车况良好，配备经验丰富的司机。行车途中导游会为大家讲解沿途风光和当地文化，让路途也成为旅行的一部分。
                      </p>
                    </div>
                    <div class="time-schedule">
                      <h4>
                        <el-icon><Clock /></el-icon>
                        时间安排
                      </h4>
                      <div class="schedule-list">
                        <div class="schedule-item">
                          <span class="time">08:00</span>
                          <span class="activity">酒店早餐</span>
                        </div>
                        <div class="schedule-item">
                          <span class="time">09:00</span>
                          <span class="activity">出发前往景区</span>
                        </div>
                        <div class="schedule-item">
                          <span class="time">10:00</span>
                          <span class="activity">抵达景区，开始游览</span>
                        </div>
                        <div class="schedule-item">
                          <span class="time">12:00</span>
                          <span class="activity">午餐时间</span>
                        </div>
                        <div class="schedule-item">
                          <span class="time">14:00</span>
                          <span class="activity">继续游览</span>
                        </div>
                        <div class="schedule-item">
                          <span class="time">18:00</span>
                          <span class="activity">晚餐及自由活动</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </section>

        <!-- 费用说明 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Money /></el-icon>
            费用说明
          </h2>
          <div class="price-intro">
            <p>以下费用已包含全程所有必要开支，让你的旅行无后顾之忧。我们承诺行程中不会有任何强制消费和购物安排，让你玩得舒心、放心。</p>
          </div>
          <div class="fee-section">
            <h3 class="fee-title">
              <el-icon><CircleCheck /></el-icon>
              费用包含
            </h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">🏨</div>
                  <div class="fee-content">
                    <h4>住宿费用</h4>
                    <p>{{ routeData.hotel_standard || '精选酒店' }}</p>
                    <p class="fee-desc">全程入住精选酒店/民宿，{{ (routeData.days || 3) - 1 }}晚住宿含早餐</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">🍜</div>
                  <div class="fee-content">
                    <h4>餐饮费用</h4>
                    <p>{{ routeData.meal_standard || '特色餐饮' }}</p>
                    <p class="fee-desc">包含行程内所有正餐，特色美食体验</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">🎫</div>
                  <div class="fee-content">
                    <h4>门票费用</h4>
                    <p>景区首道门票</p>
                    <p class="fee-desc">行程内所有景点门票，无需自费购买</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">🚌</div>
                  <div class="fee-content">
                    <h4>交通费用</h4>
                    <p>全程旅游大巴</p>
                    <p class="fee-desc">正规旅游车辆，含燃油费、过路费、司机食宿</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">👨‍🏫</div>
                  <div class="fee-content">
                    <h4>导游服务</h4>
                    <p>专业持证导游</p>
                    <p class="fee-desc">全程优秀导游陪同讲解服务</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="fee-item">
                  <div class="fee-icon">🛡️</div>
                  <div class="fee-content">
                    <h4>保险费用</h4>
                    <p>旅游意外险</p>
                    <p class="fee-desc">旅行社责任险 + 旅游意外险，双重保障</p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="fee-section">
            <h3 class="fee-title">
              <el-icon><CircleClose /></el-icon>
              费用不含
            </h3>
            <ul class="fee-exclude-list">
              <li>往返大交通费用（出发地到贵阳的机票/火车票）</li>
              <li>景区内小交通（观光车、索道等）</li>
              <li>个人消费（购物、娱乐等）</li>
              <li>单房差（如需单独住宿需补差价）</li>
              <li>行程外的自费项目</li>
            </ul>
          </div>

          <div class="price-highlight">
            <div class="price-box">
              <span class="price-label">套餐价格</span>
              <span class="price-value">¥{{ (routeData.price / 100).toFixed(0) }}</span>
              <span class="price-unit">/ 人起</span>
            </div>
            <div class="price-tips">
              <el-tag type="success">提前预订立减 ¥100</el-tag>
              <el-tag type="warning">3人及以上团购优惠</el-tag>
            </div>
          </div>
        </section>

        <!-- 预订须知 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><WarningFilled /></el-icon>
            预订须知
          </h2>
          <el-collapse v-model="activeNotice" accordion>
            <el-collapse-item title="📋 预订说明" name="1">
              <div class="notice-content">
                <p>1. 请提前至少3天预订，以便我们为您安排最佳的行程</p>
                <p>2. 预订时请提供准确的联系方式和出行人信息</p>
                <p>3. 儿童价格：1.2米以下儿童不占床位享受儿童价，1.2-1.5米占床补差价</p>
                <p>4. 老年人优惠：60岁以上老人凭证件可享受门票优惠，现退差价</p>
                <p>5. 学生优惠：全日制在校学生凭学生证可享受门票优惠</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="🔄 退改政策" name="2">
              <div class="notice-content">
                <p><strong>出发前7天及以上：</strong>免费取消，全额退款</p>
                <p><strong>出发前4-6天：</strong>扣除20%费用后退款</p>
                <p><strong>出发前2-3天：</strong>扣除50%费用后退款</p>
                <p><strong>出发前1天：</strong>扣除80%费用后退款</p>
                <p><strong>出发当天：</strong>不予退款</p>
                <p class="notice-tip">如因不可抗力因素（如天气、疫情等）导致行程取消，全额退款或协商改期</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="🎒 出行准备" name="3">
              <div class="notice-content">
                <p><strong>必备证件：</strong>身份证、学生证（如需优惠）、老年证（如需优惠）</p>
                <p><strong>衣物：</strong>根据季节准备，建议带一件薄外套（山区早晚温差大），舒适的运动鞋或徒步鞋</p>
                <p><strong>防护用品：</strong>防晒霜、太阳镜、雨伞、防蚊液</p>
                <p><strong>电子设备：</strong>充电宝、相机、手机</p>
                <p><strong>药品：</strong>常用药品如感冒药、肠胃药、晕车药、创可贴等</p>
                <p><strong>其他：</strong>少量现金（部分山区可能不支持移动支付）</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="⚠️ 注意事项" name="4">
              <div class="notice-content">
                <p>1. 黔东南地区多山路，易晕车者请提前准备晕车药</p>
                <p>2. 尊重当地民族习俗，进入苗寨侗寨请听从导游安排</p>
                <p>3. 拍摄当地居民前请征得同意，部分区域禁止拍照请注意标识</p>
                <p>4. 保管好个人财物，贵重物品随身携带</p>
                <p>5. 山区信号可能不稳定，请提前告知家人行程安排</p>
                <p>6. 品尝当地美食注意饮食卫生，不要暴饮暴食</p>
                <p>7. 购买特产请到正规商店，理性消费</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </section>

        <!-- 用户评价 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><ChatDotRound /></el-icon>
            游客评价 ({{ reviews.length }})
          </h2>
          <div class="review-stats">
            <div class="stats-summary">
              <div class="big-score">{{ avgRating }}</div>
              <div class="score-text">综合评分</div>
              <el-rate v-model="avgRating" disabled />
            </div>
            <div class="stats-details">
              <div class="stat-item">
                <span class="stat-label">行程安排</span>
                <el-progress :percentage="95" color="#667eea" />
                <span class="stat-value">4.8</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">导游服务</span>
                <el-progress :percentage="92" color="#667eea" />
                <span class="stat-value">4.6</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">住宿餐饮</span>
                <el-progress :percentage="88" color="#667eea" />
                <span class="stat-value">4.4</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">性价比</span>
                <el-progress :percentage="90" color="#667eea" />
                <span class="stat-value">4.5</span>
              </div>
            </div>
          </div>
          <div class="review-list">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <el-avatar :src="review.avatar">{{ review.username.charAt(0) }}</el-avatar>
                <div class="review-user">
                  <div class="username">{{ review.username }}</div>
                  <el-rate v-model="review.rating" disabled size="small" />
                </div>
                <div class="review-date">{{ review.date }}</div>
              </div>
              <div class="review-content">{{ review.content }}</div>
              <div class="review-tags">
                <el-tag v-for="tag in review.tags" :key="tag" size="small" type="info">
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- 右侧边栏 -->
      <div class="detail-sidebar">
        <!-- 预订卡片 -->
        <div class="sidebar-card booking-card">
          <div class="price-display">
            <div class="price-label">套餐价格</div>
            <div class="price-amount">
              <span class="currency">¥</span>
              <span class="value">{{ (routeData.price / 100).toFixed(0) }}</span>
              <span class="unit">/ 人起</span>
            </div>
            <div class="price-save">立省 ¥200</div>
          </div>

          <el-form class="booking-form" label-position="top">
            <el-form-item label="出发日期">
              <el-date-picker
                v-model="bookingDate"
                type="date"
                placeholder="选择日期"
                :disabled-date="disabledDate"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="参团人数">
              <el-input-number
                v-model="peopleCount"
                :min="1"
                :max="20"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>

          <div class="booking-total">
            <span>总价：</span>
            <span class="total-price">¥{{ ((routeData.price / 100) * peopleCount).toFixed(0) }}</span>
          </div>

          <el-button type="primary" size="large" block @click="handleBooking">
            立即预订
          </el-button>
          <el-button size="large" block @click="handleConsult">
            <el-icon><ChatDotRound /></el-icon>
            咨询客服
          </el-button>
        </div>

        <!-- 服务保障 -->
        <div class="sidebar-card">
          <h3 class="card-title">服务保障</h3>
          <div class="guarantee-list">
            <div class="guarantee-item">
              <el-icon class="icon"><CircleCheck /></el-icon>
              <div class="text">
                <h4>品质保证</h4>
                <p>正规旅行社，品质有保障</p>
              </div>
            </div>
            <div class="guarantee-item">
              <el-icon class="icon"><CircleCheck /></el-icon>
              <div class="text">
                <h4>价格透明</h4>
                <p>无隐藏消费，明码标价</p>
              </div>
            </div>
            <div class="guarantee-item">
              <el-icon class="icon"><CircleCheck /></el-icon>
              <div class="text">
                <h4>灵活退改</h4>
                <p>支持退改，安心预订</p>
              </div>
            </div>
            <div class="guarantee-item">
              <el-icon class="icon"><CircleCheck /></el-icon>
              <div class="text">
                <h4>24小时客服</h4>
                <p>全天候在线为您服务</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 推荐景区 -->
        <div class="sidebar-card">
          <h3 class="card-title">路线包含景区</h3>
          <div class="scenic-list">
            <div v-for="scenic in includedScenics" :key="scenic.id" class="scenic-item" @click="$router.push(`/scenic/${scenic.id}`)">
              <img :src="scenic.image" />
              <div class="scenic-info">
                <h4>{{ scenic.name }}</h4>
                <p>{{ scenic.tag }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Location,
  User,
  Star,
  Document,
  Calendar,
  ArrowDown,
  ArrowUp,
  MapLocation,
  Food,
  House,
  Van,
  Clock,
  Money,
  CircleCheck,
  CircleClose,
  WarningFilled,
  ChatDotRound
} from '@element-plus/icons-vue'
import { routeApi } from '@/api'
import { useUserStore } from '@/stores/user'
import { useChat } from '@/stores/chat'
import { routeImageMap, scenicImageMap } from '@/config/images'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { openChat } = useChat()

const loading = ref(true)
const routeData = ref<any>({})
const routeDays = ref<any[]>([])

const expandedDay = ref(0)
const activeNotice = ref(['1'])
const bookingDate = ref<Date | null>(null)
const peopleCount = ref(2)
const quantity = ref(1) // 预订人数

const avgRating = ref(4.7)
const bookCount = ref(1286)

const reviews = [
  {
    id: 1,
    username: '旅行达人小张',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang',
    rating: 5,
    date: '2026-09-05',
    content: '行程安排非常合理，导游小王很专业也很热情，给我们讲了很多当地的历史文化。住宿和餐饮都很不错，特别是苗家的长桌宴太有特色了！推荐大家一定要参加。',
    tags: ['行程合理', '导游专业', '性价比高']
  },
  {
    id: 2,
    username: '摄影爱好者老李',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li',
    rating: 5,
    date: '2026-08-28',
    content: '作为摄影爱好者，这条线路的景点选择太棒了！西江的夜景、镇远的古城、荔波的山水，每一个地方都出片。导游还带我们去了很多小众的拍摄点，收获满满。',
    tags: ['适合摄影', '景点精华', '导游贴心']
  },
  {
    id: 3,
    username: '亲子游妈妈',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mama',
    rating: 4,
    date: '2026-08-20',
    content: '带着孩子参加的，孩子玩得很开心。体验了蜡染、银饰制作，孩子学到了很多。行程不紧张，适合老人小孩。唯一的建议是山路比较多，晕车的话要准备晕车药。',
    tags: ['适合亲子', '寓教于乐', '节奏适中']
  }
]

const includedScenics = [
  { id: 1, name: '西江千户苗寨', image: '/images/scenic/千户苗寨.jpg', tag: '世界最大苗寨' },
  { id: 3, name: '镇远古镇', image: '/images/scenic/镇远古镇.jpg', tag: '千年古镇' },
  { id: 2, name: '荔波小七孔', image: '/images/scenic/荔波七小孔.jpg', tag: '地球绿宝石' }
]

async function loadRoute() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await routeApi.detail(id)

    // 处理数据结构
    const data = res.data.data
    if (data.days) {
      routeDays.value = data.days
      delete data.days
    }
    routeData.value = data

    // 如果没有主图，使用默认图片
    if (!routeData.value.main_image) {
      routeData.value.main_image = getDefaultRouteImage(routeData.value.title)
    }

    // 如果没有详细行程，生成默认行程
    if (!routeDays.value || routeDays.value.length === 0) {
      routeDays.value = generateDefaultItinerary(routeData.value.days || 3, routeData.value.title)
    }

  } catch (err) {
    console.error(err)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
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

function generateDefaultItinerary(days: number, title: string) {
  const itineraries = [
    // 1日游行程
    [
      {
        day_no: 1,
        title: '一日精华游',
        description: '贵阳出发，游览核心景点，傍晚返回',
        activities: '早上：07:00 贵阳集合出发\n上午：09:00-12:00 游览主要景点，专业导游讲解\n中午：12:00-13:30 品尝当地特色午餐\n下午：14:00-17:00 继续游览，自由拍照\n傍晚：17:30 返回贵阳，预计19:30抵达',
        meals: '午餐',
        accommodation: '无住宿'
      }
    ],
    // 2日游行程
    [
      {
        day_no: 1,
        title: '贵阳出发 - 深度游览',
        description: '从贵阳出发，开启精彩旅程',
        activities: '早上：08:00 贵阳指定地点集合出发\n上午：10:00-12:00 抵达首个景点，开始游览\n中午：12:00-13:30 享用当地特色午餐\n下午：14:00-17:30 继续游览主要景点\n晚上：18:00 入住酒店，自由活动\n       19:00 品尝特色晚餐，欣赏民族歌舞表演',
        meals: '午餐、晚餐',
        accommodation: '当地精选酒店'
      },
      {
        day_no: 2,
        title: '深度体验 - 返回贵阳',
        description: '体验民族文化，返回贵阳',
        activities: '早上：07:30 酒店早餐\n       08:30 参观民族村寨，体验非遗文化\n中午：12:00 享用农家特色午餐\n下午：13:30 自由活动时间，购买特产\n       15:00 集合返回贵阳\n傍晚：17:30 抵达贵阳，结束愉快旅程',
        meals: '早餐、午餐',
        accommodation: '无'
      }
    ],
    // 3日游行程
    [
      {
        day_no: 1,
        title: '贵阳集合 - 开启旅程',
        description: '贵阳出发，前往黔东南',
        activities: '早上：08:00 贵阳指定地点集合，发放物资\n       09:00 出发前往黔东南\n上午：11:00 抵达第一站，开始游览\n中午：12:30 品尝当地特色午餐\n下午：14:00-17:30 深度游览景区\n       17:30 前往住宿地\n晚上：19:00 特色长桌宴，欣赏民族歌舞',
        meals: '午餐、晚餐',
        accommodation: '特色民宿或精选酒店'
      },
      {
        day_no: 2,
        title: '文化深度体验',
        description: '探访古村落，体验民族文化',
        activities: '早上：08:00 酒店早餐\n       09:00 前往古村落游览\n上午：10:00-12:00 参观民族博物馆，了解历史文化\n中午：12:30 品尝特色农家菜\n下午：14:00-17:00 体验蜡染、刺绣等非遗技艺\n       17:00 自由活动，拍照留念\n晚上：18:30 晚餐后自由活动',
        meals: '早餐、午餐、晚餐',
        accommodation: '当地精选酒店'
      },
      {
        day_no: 3,
        title: '自然风光 - 返程',
        description: '游览自然景观，返回贵阳',
        activities: '早上：07:30 酒店早餐\n       08:30 前往自然景区游览\n上午：09:00-11:30 游览山水风光\n中午：12:00 午餐\n下午：13:30 自由购物时间\n       15:00 集合返回贵阳\n傍晚：18:00 抵达贵阳，结束旅程',
        meals: '早餐、午餐',
        accommodation: '无'
      }
    ]
  ]

  // 根据天数选择对应行程模板
  if (days === 1) return itineraries[0]
  if (days === 2) return itineraries[1]
  if (days <= 4) return itineraries[2]

  // 4天以上的行程，扩展3日游模板
  const extended = [...itineraries[2]]
  for (let i = 4; i <= days; i++) {
    extended.push({
      day_no: i,
      title: i === days ? '精彩继续 - 返程' : `第${i}天行程`,
      description: i === days ? '游览更多景点，返回贵阳' : '继续探索更多精彩',
      activities: i === days
        ? '早上：08:00 酒店早餐\n上午：09:00-11:30 游览最后景点\n中午：12:00 午餐\n下午：14:00 返回贵阳\n傍晚：18:00 抵达贵阳'
        : '早上：08:00 早餐\n上午：09:00-12:00 游览景点\n中午：12:30 午餐\n下午：14:00-17:30 继续游览\n晚上：19:00 晚餐',
      meals: i === days ? '早餐、午餐' : '早餐、午餐、晚餐',
      accommodation: i === days ? '无' : '当地酒店'
    })
  }
  return extended
}

function parseIncludes(includes: any) {
  if (!includes) return ['精选住宿', '特色餐饮', '专业导游', '景点门票']

  if (Array.isArray(includes)) {
    return includes.length > 0 ? includes : ['精选住宿', '特色餐饮', '专业导游', '景点门票']
  }

  if (typeof includes === 'string') {
    try {
      const parsed = JSON.parse(includes)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['精选住宿', '特色餐饮', '专业导游', '景点门票']
    } catch {
      return ['精选住宿', '特色餐饮', '专业导游', '景点门票']
    }
  }

  return ['精选住宿', '特色餐饮', '专业导游', '景点门票']
}

function getHighlightIcon(idx: number) {
  const icons = ['✨', '🎯', '🌟', '💫', '⭐', '🏆', '🎨', '🎭']
  return icons[idx % icons.length]
}

function toggleDay(idx: number) {
  expandedDay.value = expandedDay.value === idx ? -1 : idx
}

function getDayDetailDescription(idx: number) {
  const descriptions = [
    '今天我们将深入探索苗寨的魅力。上午参观苗寨博物馆，了解苗族的历史文化；下午自由漫步在古朴的石板路上，感受苗寨的宁静与美好。傍晚登上观景台，欣赏万家灯火的壮丽景象。',
    '今天的行程轻松愉快。我们将参观非遗工坊，亲手体验蜡染和刺绣制作。下午前往银饰作坊，观看银匠现场打造银饰的过程，还可以购买心仪的银饰作为纪念品。晚上品尝苗家特色长桌宴，观看苗族歌舞表演。',
    '今天我们将前往另一个著名的景点。沿途欣赏黔东南的田园风光，抵达后开始深度游览。专业导游将为您详细讲解景点的历史和文化背景，让您的旅行更有深度。'
  ]
  return descriptions[idx] || descriptions[0]
}

function disabledDate(date: Date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

function handleBooking() {
  if (!bookingDate.value) {
    ElMessage.warning('请选择出发日期')
    return
  }

  // 未登录先去登录，登录后回到本页
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再预订')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  // 跳转到订单创建页面
  router.push({
    path: '/order/create',
    query: {
      type: 'route',
      targetId: String(routeData.value.id),
      routeName: routeData.value.title,
      image: routeData.value.cover_image,
      unitPrice: String(routeData.value.price),
      quantity: String(peopleCount.value), // 使用 peopleCount 而不是 quantity
      travelDate: dayjs(bookingDate.value).format('YYYY-MM-DD'),
      days: String(routeData.value.days)
    }
  })
}

function handleConsult() {
  openChat()
}

onMounted(() => {
  loadRoute()
})
</script>

<style scoped>
.route-detail-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.route-hero {
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  color: white;
  text-align: center;
  padding: 40px;
  max-width: 900px;
}

.btn-back {
  position: absolute;
  top: 30px;
  left: 40px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.95);
  color: #333;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.btn-back:hover {
  background: white;
  transform: translateX(-3px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.route-badges {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.badge {
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
}

.days-badge {
  background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
  color: white;
}

.theme-badge {
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
}

.route-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.route-meta {
  display: flex;
  gap: 30px;
  justify-content: center;
  font-size: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-container {
  max-width: 1400px;
  margin: -50px auto 0;
  padding: 0 20px 60px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
  position: relative;
  z-index: 10;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section-card {
  background: white;
  padding: 35px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 26px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.highlights-text {
  margin-bottom: 25px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.highlights-text p {
  font-size: 15px;
  line-height: 1.9;
  color: #4a5568;
  text-indent: 2em;
  text-align: justify;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.highlight-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.highlight-card:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  transform: translateY(-2px);
}

.highlight-icon {
  font-size: 32px;
}

.highlight-text {
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
}

.detail-intro {
  line-height: 1.9;
}

.intro-paragraph {
  font-size: 15px;
  line-height: 2;
  color: #4a5568;
  margin-bottom: 20px;
  text-indent: 2em;
  text-align: justify;
}

.itinerary-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 25px;
  margin-bottom: 30px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.marker-line {
  flex: 1;
  width: 3px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  margin-top: 15px;
  min-height: 100px;
}

.timeline-content {
  flex: 1;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
}

.timeline-item.expanded .timeline-content {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.day-header {
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s;
}

.day-header:hover {
  background: #f7fafc;
}

.day-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.day-title h3 {
  font-size: 22px;
  font-weight: bold;
  color: #2d3748;
}

.expand-icon {
  font-size: 20px;
  color: #667eea;
}

.day-summary {
  font-size: 15px;
  color: #718096;
  line-height: 1.6;
}

.day-details {
  padding: 0 25px 25px;
  border-top: 1px solid #e5e7eb;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.detail-section {
  margin-top: 25px;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-text {
  font-size: 15px;
  color: #667eea;
  margin-bottom: 10px;
  font-weight: 500;
}

.detail-description {
  font-size: 14px;
  line-height: 1.8;
  color: #718096;
  text-align: justify;
}

.time-schedule {
  margin-top: 25px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 14px;
}

.schedule-item .time {
  width: 60px;
  font-weight: bold;
  color: #667eea;
}

.schedule-item .activity {
  color: #4a5568;
}

.price-intro {
  margin-bottom: 25px;
  padding: 18px;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
}

.price-intro p {
  font-size: 14px;
  line-height: 1.8;
  color: #92400e;
}

.fee-section {
  margin-bottom: 30px;
}

.fee-title {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.fee-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 15px;
}

.fee-icon {
  font-size: 36px;
}

.fee-content h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 5px;
}

.fee-content p {
  font-size: 14px;
  color: #667eea;
  margin-bottom: 8px;
  font-weight: 500;
}

.fee-desc {
  font-size: 13px;
  color: #718096 !important;
  font-weight: normal !important;
  line-height: 1.6;
}

.fee-exclude-list {
  list-style: none;
  padding-left: 0;
}

.fee-exclude-list li {
  padding: 12px 20px;
  background: #f7fafc;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #718096;
  position: relative;
  padding-left: 40px;
}

.fee-exclude-list li::before {
  content: '×';
  position: absolute;
  left: 15px;
  color: #e53e3e;
  font-size: 18px;
  font-weight: bold;
}

.price-highlight {
  margin-top: 30px;
  padding: 30px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-box {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-label {
  font-size: 16px;
  color: #718096;
}

.price-value {
  font-size: 48px;
  font-weight: bold;
  color: #e53e3e;
}

.price-unit {
  font-size: 16px;
  color: #718096;
}

.price-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-content {
  padding: 15px 0;
}

.notice-content p {
  font-size: 14px;
  line-height: 1.9;
  color: #4a5568;
  margin-bottom: 12px;
  padding-left: 15px;
}

.notice-content p strong {
  color: #2d3748;
  font-weight: 600;
}

.notice-tip {
  color: #667eea !important;
  font-weight: 500 !important;
  margin-top: 15px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
}

.review-stats {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding: 30px;
  background: #f7fafc;
  border-radius: 16px;
  margin-bottom: 30px;
}

.stats-summary {
  text-align: center;
}

.big-score {
  font-size: 64px;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
  margin-bottom: 10px;
}

.score-text {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.stats-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-label {
  width: 80px;
  font-size: 14px;
  color: #718096;
}

.stat-value {
  width: 40px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #667eea;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 25px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s;
}

.review-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.review-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.review-user {
  flex: 1;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 6px;
}

.review-date {
  font-size: 13px;
  color: #a0aec0;
}

.review-content {
  font-size: 15px;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 15px;
}

.review-tags {
  display: flex;
  gap: 8px;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  padding: 25px;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.booking-card {
  position: sticky;
  top: 90px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 20px;
}

.price-display {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 12px;
  margin-bottom: 25px;
}

.price-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.price-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.currency {
  font-size: 24px;
  color: #e53e3e;
}

.value {
  font-size: 52px;
  font-weight: bold;
  color: #e53e3e;
}

.unit {
  font-size: 16px;
  color: #718096;
}

.price-save {
  font-size: 14px;
  color: #10b981;
  font-weight: 600;
}

.booking-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 20px;
  border-top: 1px solid #e5e7eb;
  font-size: 16px;
  font-weight: 500;
}

.total-price {
  font-size: 28px;
  font-weight: bold;
  color: #e53e3e;
}

.guarantee-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.guarantee-item {
  display: flex;
  gap: 12px;
}

.guarantee-item .icon {
  font-size: 24px;
  color: #10b981;
  flex-shrink: 0;
}

.guarantee-item .text h4 {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.guarantee-item .text p {
  font-size: 13px;
  color: #718096;
  line-height: 1.6;
}

.scenic-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.scenic-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px;
  border-radius: 12px;
}

.scenic-item:hover {
  background: #f7fafc;
}

.scenic-item img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.scenic-info h4 {
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 5px;
}

.scenic-info p {
  font-size: 13px;
  color: #718096;
}
</style>
