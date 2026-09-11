<template>
  <div class="scenic-detail-page">
    <!-- 顶部图片画廊 -->
    <div class="hero-gallery">
      <div class="main-image" :style="{ backgroundImage: `url(${scenic.main_image})` }">
        <div class="gallery-overlay">
          <button class="btn-back" @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </button>
          <div class="gallery-actions">
            <button class="action-btn" @click="handleFavorite">
              <el-icon><StarFilled v-if="isFavorited" /><Star v-else /></el-icon>
              {{ isFavorited ? '已收藏' : '收藏' }}
            </button>
            <button class="action-btn" @click="handleShare">
              <el-icon><Share /></el-icon>
              分享
            </button>
          </div>
        </div>
        <div class="image-count" @click="showGallery = true">
          <el-icon><Picture /></el-icon>
          查看全部 {{ images.length }} 张图片
        </div>
      </div>
      <div class="thumbnail-list">
        <div
          v-for="(img, idx) in images.slice(0, 4)"
          :key="idx"
          class="thumbnail"
          :style="{ backgroundImage: `url(${img})` }"
          @click="currentImageIndex = idx"
        ></div>
      </div>
    </div>

    <div class="detail-container">
      <!-- 左侧主要内容 -->
      <div class="detail-main">
        <!-- 标题和评分 -->
        <section class="title-section">
          <h1 class="scenic-name">{{ scenic.name }}</h1>
          <div class="rating-row">
            <el-rate v-model="avgRating" disabled show-score text-color="#ff9900" />
            <span class="review-count">({{ reviewCount }} 条评价)</span>
            <el-tag type="success" effect="dark" v-if="scenic.status === 1">正常开放</el-tag>
          </div>
          <div class="address-row">
            <el-icon><LocationFilled /></el-icon>
            <span>{{ scenic.address }}</span>
            <span class="distance">距离你 {{ distance }} km</span>
          </div>
        </section>

        <!-- 标签云 -->
        <section class="tags-section">
          <el-tag v-for="tag in tags" :key="tag" type="info" effect="plain">
            {{ tag }}
          </el-tag>
        </section>

        <!-- 景区简介 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Document /></el-icon>
            景区简介
          </h2>
          <div class="intro-content">
            <p class="intro-text">{{ scenic.intro }}</p>
            <p class="intro-text">
              西江千户苗寨是一个保存苗族"原始生态"文化完整的地方，由10余个依山而建的自然村寨相连成片，是目前中国乃至全世界最大的苗族聚居村寨。这里居住着"西"氏族苗族，是苗族第五次大迁徙的主要集结地。
            </p>
            <p class="intro-text">
              千户苗寨四面环山，重峦叠嶂，梯田依山顺势直连云天，白水河穿寨而过，将西江苗寨一分为二。寨内吊脚楼层层叠叠顺山势而建，又连绵成片，房前屋后有翠竹点缀。吊脚楼多为三层，底层用于存放生产工具、关养家禽与牲畜、储存肥料或用作厕所。第二层用作客厅、堂屋、卧室和厨房，堂屋外侧建有独特的"美人靠"，苗语称"阶息"，主要用于乘凉、观景和休憩，是苗寨建筑的一大特色。第三层主要用于存放谷物、饲料等生产、生活物资。
            </p>
            <el-collapse v-model="activeCollapse" class="detail-collapse">
              <el-collapse-item name="1">
                <template #title>
                  <span class="collapse-title">📖 查看完整介绍</span>
                </template>
                <div class="detail-content">
                  <h3 class="content-subtitle">历史文化</h3>
                  <p class="content-text">
                    西江苗寨的历史可以追溯到公元前559年，苗族先民在长江中下游建立"三苗国"，后因战争和自然灾害，苗族经历了五次大迁徙。第五次迁徙时期，苗族的一支来到了黔东南地区，其中一部分人来到了白水河流域，建立了西江苗寨。经过数百年的发展，逐渐形成了今天的千户苗寨规模。
                  </p>
                  <p class="content-text">
                    西江苗寨保留了苗族最原始、最完整的生活方式和传统文化。这里有独特的建筑风格——吊脚楼，有神秘的苗族巫文化，有绚丽的苗族服饰，有古老的酿酒技艺，有传承千年的银饰锻造工艺。每年的苗年节、吃新节、鼓藏节等传统节日，更是展现了苗族文化的魅力。
                  </p>

                  <h3 class="content-subtitle">建筑特色</h3>
                  <p class="content-text">
                    西江苗寨的吊脚楼是苗族建筑的代表，这种建筑充分体现了苗族人民的智慧。吊脚楼依山而建，以木质结构为主，不用一钉一铆，全靠榫卯连接。楼房底层架空，既可以防潮防兽，又可以用作储藏和畜圈。二层居住，三层储物，层次分明，功能齐全。
                  </p>
                  <p class="content-text">
                    房屋的"美人靠"是苗寨建筑的点睛之笔。这是一种设在二楼走廊外侧的木质栏杆，呈90度弧形，便于倚靠休息。苗族姑娘常在美人靠上做针线活、聊天、观景，因此得名"美人靠"。每当夕阳西下，坐在美人靠上，可以俯瞰整个山谷，欣赏万家灯火的壮丽景象。
                  </p>

                  <h3 class="content-subtitle">文化体验</h3>
                  <p class="content-text">
                    在西江苗寨，游客可以深度体验苗族文化。寨子里有多个非遗工坊，可以亲手学习蜡染、刺绣、银饰制作等传统技艺。蜡染是苗族最具特色的手工艺之一，使用蜂蜡在白布上画出图案，经过染色后形成蓝白相间的美丽花纹。苗族刺绣以其精湛的技艺和独特的审美闻名，图案多取材于自然，寓意吉祥。
                  </p>
                  <p class="content-text">
                    苗族银饰是苗族文化的重要组成部分，西江的银匠手艺传承千年。一套完整的苗族盛装银饰重达十几斤，包括银冠、银角、银梳、银项圈、银手镯、银戒指等，工艺精湛，造型独特。游客可以参观银饰作坊，观看银匠现场打造银饰，了解这一古老技艺的传承。
                  </p>

                  <h3 class="content-subtitle">美食推荐</h3>
                  <p class="content-text">
                    西江苗寨的美食独具特色，最著名的当属酸汤鱼。酸汤是用糯米发酵制成，味道酸爽开胃，配上新鲜的河鱼，鲜美无比。此外还有苗家腊肉、糯米饭、血豆腐、竹筒饭等特色美食。苗家人热情好客，如果遇上苗族节日，还能品尝到特色的长桌宴，体验苗族的酒文化。
                  </p>

                  <h3 class="content-subtitle">最佳游览时间</h3>
                  <p class="content-text">
                    西江苗寨四季皆宜游览，但最佳时间是春秋两季和苗族传统节日期间。春季（3-5月）山花烂漫，梯田灌水，景色优美；秋季（9-11月）稻谷金黄，层林尽染，是摄影的最佳季节。苗年节（农历十月或十一月）和吃新节（农历六七月）期间，可以欣赏到盛大的民俗表演，感受最浓郁的苗族风情。
                  </p>

                  <h3 class="content-subtitle">游览建议</h3>
                  <p class="content-text">
                    建议游客在西江苗寨至少停留一晚，这样才能完整体验苗寨的魅力。白天可以参观博物馆、非遗工坊，了解苗族文化；傍晚时分登上观景台，俯瞰整个苗寨，欣赏日落；夜幕降临后，万家灯火次第点亮，整个山谷璀璨如星河，这是西江最美的时刻。清晨可以早起，感受苗寨的宁静与祥和，看炊烟袅袅，听鸡鸣犬吠，体验最原生态的苗寨生活。
                  </p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </section>

        <!-- 开放信息 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Clock /></el-icon>
            开放信息
          </h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-icon">⏰</div>
              <div class="info-content">
                <div class="info-label">开放时间</div>
                <div class="info-value">{{ scenic.open_time }}</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🎫</div>
              <div class="info-content">
                <div class="info-label">门票价格</div>
                <div class="info-value">¥90 起</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">⏱️</div>
              <div class="info-content">
                <div class="info-label">建议游玩时长</div>
                <div class="info-value">3-5 小时</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🎒</div>
              <div class="info-content">
                <div class="info-label">适合人群</div>
                <div class="info-value">家庭亲子、摄影爱好者</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 票种选择 -->
        <section class="section-card" id="tickets">
          <h2 class="section-title">
            <el-icon><Tickets /></el-icon>
            门票预订
          </h2>
          <div class="ticket-list" v-loading="ticketLoading">
            <div
              v-for="ticket in tickets"
              :key="ticket.id"
              class="ticket-item"
              :class="{ selected: selectedTicket?.id === ticket.id }"
              @click="selectTicket(ticket)"
            >
              <div class="ticket-left">
                <h3>{{ ticket.name }}</h3>
                <p class="ticket-desc">{{ ticket.valid_rule }}</p>
                <div class="ticket-tags">
                  <el-tag size="small" v-if="ticket.need_id_card" type="warning">需身份证</el-tag>
                  <el-tag size="small" type="success">随时退</el-tag>
                  <el-tag size="small" type="info">免排队</el-tag>
                </div>
              </div>
              <div class="ticket-right">
                <div class="price-box">
                  <span class="current-price">¥{{ (ticket.price / 100).toFixed(0) }}</span>
                  <span class="market-price" v-if="ticket.market_price">
                    ¥{{ (ticket.market_price / 100).toFixed(0) }}
                  </span>
                </div>
                <el-icon class="check-icon" v-if="selectedTicket?.id === ticket.id">
                  <CircleCheckFilled />
                </el-icon>
              </div>
            </div>
          </div>

          <!-- 购票面板 -->
          <div class="booking-panel" v-if="selectedTicket">
            <el-divider />
            <div class="booking-form">
              <el-form label-width="100px">
                <el-form-item label="游玩日期">
                  <el-date-picker
                    v-model="bookingDate"
                    type="date"
                    placeholder="选择日期"
                    :disabled-date="disabledDate"
                    @change="checkStock"
                    style="width: 100%"
                  />
                </el-form-item>
                <el-form-item label="购买数量">
                  <el-input-number
                    v-model="quantity"
                    :min="1"
                    :max="stockInfo?.available || 10"
                  />
                  <span class="stock-hint" v-if="stockInfo">
                    剩余 {{ stockInfo.available }} 张
                  </span>
                </el-form-item>
              </el-form>
              <div class="booking-total">
                <span>合计：</span>
                <span class="total-price">¥{{ ((selectedTicket.price / 100) * quantity).toFixed(2) }}</span>
              </div>
              <div class="booking-actions">
                <el-button size="large" @click="handleAddToCart">
                  <el-icon><ShoppingCart /></el-icon>
                  加入购物车
                </el-button>
                <el-button type="primary" size="large" @click="handleBooking">
                  立即预订
                </el-button>
              </div>
            </div>
          </div>
        </section>

        <!-- 特色亮点 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Trophy /></el-icon>
            特色亮点
          </h2>
          <div class="highlights-grid">
            <div v-for="(item, idx) in highlights" :key="idx" class="highlight-item">
              <div class="highlight-icon">{{ item.icon }}</div>
              <div class="highlight-content">
                <h4>{{ item.title }}</h4>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 交通指南 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><Position /></el-icon>
            交通指南
          </h2>
          <el-tabs v-model="activeTransport" class="transport-tabs">
            <el-tab-pane label="自驾" name="car">
              <div class="transport-content">
                <p>🚗 从贵阳出发，全程约 200 公里，车程 3.5 小时</p>
                <p>路线：贵阳 → 凯里 → 雷山 → 西江千户苗寨</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="高铁" name="train">
              <div class="transport-content">
                <p>🚄 贵阳北站 → 凯里南站（约 30 分钟）</p>
                <p>凯里南站出站后乘坐景区直通车，车程约 1 小时</p>
              </div>
            </el-tab-pane>
            <el-tab-pane label="大巴" name="bus">
              <div class="transport-content">
                <p>🚌 贵阳金阳客车站 → 西江客运站</p>
                <p>每天 4 班车，票价 60 元，车程约 4 小时</p>
              </div>
            </el-tab-pane>
          </el-tabs>
        </section>

        <!-- 用户评价 -->
        <section class="section-card">
          <h2 class="section-title">
            <el-icon><ChatLineRound /></el-icon>
            游客评价 ({{ reviewStats.total }})
          </h2>

          <div v-if="reviewStats.total === 0" class="no-reviews">
            <el-empty description="暂无评价，快来抢沙发吧！" />
          </div>

          <template v-else>
            <div class="review-stats">
              <div class="stats-left">
                <div class="big-score">{{ reviewStats.avgRating.toFixed(1) }}</div>
                <el-rate :model-value="reviewStats.avgRating" disabled allow-half />
                <div class="score-text">综合评分</div>
              </div>
            </div>

            <div class="review-list">
              <div v-for="review in reviews" :key="review.id" class="review-item">
                <div class="review-header">
                  <el-avatar :src="review.userAvatar">{{ review.username.charAt(0) }}</el-avatar>
                  <div class="review-info">
                    <div class="username">{{ review.username }}</div>
                    <el-rate :model-value="review.rating" disabled size="small" />
                  </div>
                  <div class="review-date">{{ review.createdAt }}</div>
                </div>
                <div class="review-content">{{ review.content }}</div>
                <div v-if="review.tags.length > 0" class="review-tags">
                  <el-tag
                    v-for="tag in review.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
                <div class="review-images" v-if="review.images.length > 0">
                  <el-image
                    v-for="(img, idx) in review.images"
                    :key="idx"
                    :src="img"
                    :preview-src-list="review.images"
                    :initial-index="idx"
                    fit="cover"
                    class="review-image"
                  />
                </div>
                <div class="review-footer">
                  <span class="likes">
                    <el-icon><Star /></el-icon>
                    {{ review.likes }} 人觉得有用
                  </span>
                </div>
              </div>
            </div>
          </template>
        </section>
      </div>

      <!-- 右侧边栏 -->
      <div class="detail-sidebar">
        <!-- 快速预订卡片 -->
        <div class="sidebar-card sticky-card">
          <div class="price-info">
            <div class="price-label">门票起价</div>
            <div class="price-value">¥90</div>
          </div>
          <el-button type="primary" size="large" block @click="scrollToTickets">
            立即预订
          </el-button>
          <el-button size="large" block @click="handleConsult">
            <el-icon><ChatDotRound /></el-icon>
            咨询客服
          </el-button>
        </div>

        <!-- 天气卡片 -->
        <div class="sidebar-card">
          <h3 class="card-title">当地天气</h3>
          <div class="weather-info" v-if="weather">
            <div class="weather-icon">{{ weather.icon }}</div>
            <div class="weather-detail">
              <div class="weather-temp">{{ weather.temp }}</div>
              <div class="weather-text">{{ weather.text }}</div>
            </div>
          </div>
        </div>

        <!-- 推荐路线 -->
        <div class="sidebar-card">
          <h3 class="card-title">包含此景区的路线</h3>
          <div class="route-list">
            <div v-for="route in relatedRoutes" :key="route.id" class="route-item" @click="$router.push(`/route/${route.id}`)">
              <img :src="route.main_image" />
              <div class="route-info">
                <h4>{{ route.title }}</h4>
                <div class="route-meta">
                  <span>{{ route.days }}日游</span>
                  <span class="price">¥{{ (route.price / 100).toFixed(0) }}</span>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { useReviewStore } from '@/stores/review'
import {
  ArrowLeft,
  Star,
  StarFilled,
  Share,
  Picture,
  LocationFilled,
  Document,
  Clock,
  Tickets,
  Trophy,
  Position,
  ChatDotRound,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import { scenicApi, ticketApi, routeApi, gpsUtils } from '@/api'
import { scenicImageMap, routeImageMap } from '@/config/images'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const reviewStore = useReviewStore()

const loading = ref(true)
const ticketLoading = ref(false)
const scenic = ref<any>({})
const tickets = ref<any[]>([])
const relatedRoutes = ref<any[]>([])

const isFavorited = ref(false)
const activeCollapse = ref([])
const activeTransport = ref('car')

const selectedTicket = ref<any>(null)
const bookingDate = ref<Date | null>(null)
const quantity = ref(1)
const stockInfo = ref<any>(null)

const showGallery = ref(false)
const currentImageIndex = ref(0)

const userLocation = ref({ lng: 106.71, lat: 26.57 })
const weather = ref({ icon: '☀️', text: '晴', temp: '18-28°C' })

const tags = ['世界遗产', '民族文化', '摄影胜地', '亲子游', '夜景']
const highlights = [
  { icon: '🏘️', title: '千户苗寨', desc: '世界最大的苗族聚居村寨' },
  { icon: '🌃', title: '璀璨夜景', desc: '万家灯火，如梦如幻' },
  { icon: '🎭', title: '非遗体验', desc: '蜡染、刺绣、银饰制作' },
  { icon: '🍜', title: '特色美食', desc: '酸汤鱼、腊肉等苗家美食' }
]

// 获取真实评价
const reviews = computed(() => {
  return reviewStore.getReviewsByTarget('scenic', scenic.value.id)
})

// 评价统计
const reviewStats = computed(() => {
  return reviewStore.getTargetStats('scenic', scenic.value.id)
})

// 没有评价时使用景区初始评分，避免详情页出现未定义字段。
const avgRating = computed(() => {
  return reviewStats.value.total > 0
    ? reviewStats.value.avgRating
    : Number(scenic.value.rating || 0)
})
const reviewCount = computed(() => reviewStats.value.total)

const images = computed(() => {
  if (!scenic.value.images) return [scenic.value.main_image]
  if (typeof scenic.value.images === 'string') {
    try {
      return JSON.parse(scenic.value.images)
    } catch {
      return [scenic.value.main_image]
    }
  }
  return scenic.value.images
})

const distance = computed(() => {
  if (!scenic.value.lng || !scenic.value.lat) return 0
  return gpsUtils.calculateDistance(
    userLocation.value.lng,
    userLocation.value.lat,
    parseFloat(scenic.value.lng),
    parseFloat(scenic.value.lat)
  )
})

async function loadScenic() {
  loading.value = true
  try {
    const id = Number(route.params.id)
    const res = await scenicApi.detail(id)
    scenic.value = res.data.data

    // 如果没有主图，使用默认图片
    if (!scenic.value.main_image) {
      scenic.value.main_image = getDefaultScenicImage(scenic.value.name)
    }

    loadTickets()
    loadRelatedRoutes()
  } catch (err) {
    ElMessage.error('加载失败')
    router.back()
  } finally {
    loading.value = false
  }
}

function getDefaultScenicImage(name: string) {
  // 根据景区名称匹配图片
  for (const [key, imagePath] of Object.entries(scenicImageMap)) {
    if (name.includes(key)) {
      return imagePath
    }
  }
  // 如果没有匹配到，返回默认图片
  return '/images/scenic/千户苗寨.jpg'
}

async function loadTickets() {
  ticketLoading.value = true
  try {
    const res = await ticketApi.list({ scenic_id: scenic.value.id })
    tickets.value = res.data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    ticketLoading.value = false
  }
}

async function loadRelatedRoutes() {
  try {
    const res = await routeApi.list({ size: 3 })
    relatedRoutes.value = res.data.data.list.slice(0, 3).map((route: any) => {
      // 如果没有主图，使用默认图片
      if (!route.main_image) {
        route.main_image = getDefaultRouteImage(route.title)
      }
      return route
    })
  } catch (err) {
    console.error(err)
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

function selectTicket(ticket: any) {
  selectedTicket.value = ticket
  bookingDate.value = null
  stockInfo.value = null
}

async function checkStock() {
  if (!bookingDate.value || !selectedTicket.value) return

  try {
    const dateStr = dayjs(bookingDate.value).format('YYYY-MM-DD')
    const endDate = dayjs(bookingDate.value).add(1, 'day').format('YYYY-MM-DD')

    const res = await ticketApi.stock({
      ticket_type_id: selectedTicket.value.id,
      start_date: dateStr,
      end_date: endDate
    })

    if (res.data.data && res.data.data.length > 0) {
      const stock = res.data.data[0]
      stockInfo.value = {
        available: stock.total - stock.sold,
        total: stock.total
      }
    } else {
      stockInfo.value = { available: 0, total: 0 }
      ElMessage.warning('该日期暂无库存')
    }
  } catch (err) {
    ElMessage.error('查询库存失败')
  }
}

function disabledDate(date: Date) {
  return date < new Date(new Date().setHours(0, 0, 0, 0))
}

function handleBooking() {
  if (!selectedTicket.value) {
    ElMessage.warning('请先选择票种')
    return
  }
  if (!bookingDate.value) {
    ElMessage.warning('请选择游玩日期')
    return
  }
  if (!stockInfo.value || stockInfo.value.available < quantity.value) {
    ElMessage.warning('库存不足，请调整数量或更换日期')
    return
  }

  // 未登录先去登录，登录后回到本页
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再预订')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  router.push({
    path: '/order/create',
    query: {
      type: 'ticket',
      targetId: String(selectedTicket.value.id),
      scenicId: String(scenic.value.id),
      scenicName: scenic.value.name,
      ticketName: selectedTicket.value.name,
      image: scenic.value.main_image,
      unitPrice: String(selectedTicket.value.price),
      quantity: String(quantity.value),
      travelDate: dayjs(bookingDate.value).format('YYYY-MM-DD')
    }
  })
}

function handleAddToCart() {
  if (!selectedTicket.value) {
    ElMessage.warning('请先选择票种')
    return
  }

  cartStore.addItem({
    targetType: 'ticket',
    targetId: selectedTicket.value.id,
    scenicId: scenic.value.id,
    scenicName: scenic.value.name,
    ticketName: selectedTicket.value.name,
    image: scenic.value.main_image,
    unitPrice: selectedTicket.value.price,
    quantity: quantity.value,
    travelDate: bookingDate.value ? dayjs(bookingDate.value).format('YYYY-MM-DD') : undefined
  })

  ElMessage.success('已加入购物车')
}

function handleFavorite() {
  isFavorited.value = !isFavorited.value
  ElMessage.success(isFavorited.value ? '已添加到收藏' : '已取消收藏')
}

function handleShare() {
  ElMessage.success('分享链接已复制')
}

function scrollToTickets() {
  const el = document.getElementById('tickets')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function handleConsult() {
  ElMessage.info('正在连接客服...')
}

async function getUserLocation() {
  try {
    const pos = await gpsUtils.getCurrentPosition()
    userLocation.value = pos
  } catch (err) {
    console.warn('定位失败', err)
  }
}

onMounted(() => {
  loadScenic()
  getUserLocation()
})
</script>

<style scoped>
.scenic-detail-page {
  background: #f5f7fa;
  min-height: 100vh;
}

.hero-gallery {
  position: relative;
  background: white;
}

.main-image {
  height: 500px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
  padding: 20px 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-back:hover {
  background: white;
  transform: translateY(-2px);
}

.gallery-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: white;
  transform: translateY(-2px);
}

.image-count {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-count:hover {
  background: rgba(0, 0, 0, 0.85);
}

.thumbnail-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 40px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.thumbnail {
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail:hover {
  transform: scale(1.05);
}

.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 30px;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.title-section {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.scenic-name {
  font-size: 36px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 15px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.review-count {
  color: #718096;
  font-size: 14px;
}

.address-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 15px;
}

.distance {
  margin-left: auto;
  color: #667eea;
  font-weight: 500;
}

.tags-section {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.section-card {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 22px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.intro-content {
  line-height: 1.8;
}

.intro-text {
  font-size: 15px;
  line-height: 2;
  color: #4a5568;
  margin-bottom: 18px;
  text-indent: 2em;
  text-align: justify;
}

.detail-content {
  padding: 20px 0;
}

.content-subtitle {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin: 25px 0 15px;
  padding-left: 12px;
  border-left: 4px solid #667eea;
}

.content-text {
  font-size: 15px;
  line-height: 2;
  color: #4a5568;
  margin-bottom: 18px;
  text-indent: 2em;
  text-align: justify;
}

.collapse-title {
  color: #667eea;
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  padding: 15px;
  background: #f7fafc;
  border-radius: 12px;
}

.info-icon {
  font-size: 32px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 13px;
  color: #718096;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
}

.ticket-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.ticket-item {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.ticket-item:hover,
.ticket-item.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.ticket-left h3 {
  font-size: 18px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 8px;
}

.ticket-desc {
  font-size: 14px;
  color: #718096;
  margin-bottom: 10px;
}

.ticket-tags {
  display: flex;
  gap: 8px;
}

.ticket-right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.current-price {
  font-size: 32px;
  font-weight: bold;
  color: #e53e3e;
}

.market-price {
  font-size: 14px;
  color: #a0aec0;
  text-decoration: line-through;
}

.check-icon {
  font-size: 24px;
  color: #667eea;
}

.booking-panel {
  margin-top: 20px;
}

.booking-form {
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.stock-hint {
  margin-left: 15px;
  font-size: 14px;
  color: #718096;
}

.booking-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  font-size: 16px;
  font-weight: 500;
}

.total-price {
  font-size: 28px;
  font-weight: bold;
  color: #e53e3e;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.highlight-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
}

.highlight-icon {
  font-size: 36px;
}

.highlight-content h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 5px;
}

.highlight-content p {
  font-size: 14px;
  color: #718096;
}

.transport-content {
  padding: 15px 0;
}

.transport-content p {
  font-size: 14px;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 10px;
}

.review-stats {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  margin-bottom: 30px;
  padding: 30px;
  background: #f7fafc;
  border-radius: 12px;
}

.stats-left {
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
  margin-top: 10px;
}

.stat-bar {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #718096;
}

.stat-bar span:first-child {
  width: 40px;
}

.stat-bar span:last-child {
  width: 50px;
  text-align: right;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-item {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.review-header {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.review-info {
  flex: 1;
}

.username {
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 5px;
}

.review-date {
  font-size: 13px;
  color: #a0aec0;
}

.review-content {
  font-size: 14px;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 15px;
}

.review-images {
  display: flex;
  gap: 10px;
}

.review-images img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
}

.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.sticky-card {
  position: sticky;
  top: 90px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 15px;
}

.price-info {
  text-align: center;
  margin-bottom: 20px;
}

.price-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 5px;
}

.price-value {
  font-size: 48px;
  font-weight: bold;
  color: #e53e3e;
}

.weather-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.weather-icon {
  font-size: 48px;
}

.weather-temp {
  font-size: 24px;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 5px;
}

.weather-text {
  font-size: 14px;
  color: #718096;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.route-item {
  display: flex;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.route-item:hover {
  opacity: 0.8;
}

.route-item img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.route-info {
  flex: 1;
}

.route-info h4 {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 5px;
}

.route-meta {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #718096;
}

.route-meta .price {
  font-weight: bold;
  color: #e53e3e;
}
</style>
