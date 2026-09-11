<template>
  <div>
    <!-- ============ Hero 轮播 ============ -->
    <section class="hero">
      <div class="hero-inner wd-container">
        <div class="hero-media">
          <el-carousel
            v-if="slides.length"
            ref="carouselRef"
            height="440px"
            :interval="5200"
            arrow="hover"
            indicator-position="none"
            @change="heroIndex = $event"
          >
            <el-carousel-item v-for="s in slides" :key="s.id">
              <img :src="s.src" :alt="s.title" class="hero-img" @error="imgError" />
            </el-carousel-item>
          </el-carousel>

          <!-- 加载中 -->
          <div v-else class="wd-skeleton hero-skel"></div>

          <!-- 玻璃浮层文案 -->
          <div v-if="slides.length" class="hero-caption glass-dark">
            <span class="hero-kicker">贵州 · 乌东苗寨</span>
            <h1 class="hero-title">{{ currentSlide.title }}</h1>
            <p class="hero-desc">非遗手作 · 苗乡风物 · 山居慢生活</p>
            <div class="hero-actions">
              <router-link to="/travel" class="hero-btn hero-btn-solid">开始探索</router-link>
              <router-link to="/community" class="hero-btn hero-btn-glass">看看游记</router-link>
            </div>
          </div>

          <!-- 指示器 -->
          <div v-if="slides.length > 1" class="hero-dots">
            <button
              v-for="(s, i) in slides"
              :key="s.id"
              class="hero-dot"
              :class="{ active: heroIndex === i }"
              @click="goSlide(i)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <div class="wd-container wd-page">
      <!-- ============ 四大板块快捷入口 ============ -->
      <section class="entries">
        <router-link v-for="e in entries" :key="e.path" :to="e.path" class="entry wd-card wd-card-hover">
          <div class="entry-media wd-media">
            <img :src="e.img" :alt="e.label" @error="imgError" />
          </div>
          <div class="entry-body">
            <div class="entry-label">{{ e.label }}</div>
            <div class="entry-sub">{{ e.sub }}</div>
          </div>
          <el-icon class="entry-arrow"><ArrowRight /></el-icon>
        </router-link>
      </section>

      <!-- ============ 公告 ============ -->
      <transition-group v-if="home.announcements?.length" name="fade" tag="div" class="announces">
        <div v-for="a in home.announcements" :key="a.id" class="announce glass">
          <el-icon class="announce-icon"><Bell /></el-icon>
          <span class="announce-text">{{ a.title }}</span>
        </div>
      </transition-group>

      <!-- ============ 活动横幅 ============ -->
      <section v-if="loading || home.activities?.length" class="wd-section">
        <div class="activities">
          <template v-if="loading">
            <div v-for="i in 2" :key="i" class="wd-skeleton act-skel"></div>
          </template>
          <router-link
            v-else
            v-for="a in home.activities"
            :key="a.id"
            :to="a.linkUrl || '/travel'"
            class="activity wd-card wd-card-hover"
          >
            <img :src="imgLarge(a.imageUrl, a.title)" :alt="a.title" @error="imgError" />
            <div class="activity-veil"></div>
            <span class="activity-chip wd-chip wd-chip-brand">
              <el-icon><Promotion /></el-icon> 限时活动
            </span>
            <div class="activity-copy">
              <h3 class="activity-title">{{ a.title }}</h3>
              <span class="activity-cta">了解详情 →</span>
            </div>
          </router-link>
        </div>
      </section>

      <!-- ============ 热门非遗好物 ============ -->
      <section class="wd-section">
        <div class="wd-section-head">
          <div>
            <h2 class="wd-section-title">热门非遗好物</h2>
            <div class="wd-section-sub">苗绣、银饰、蜡染——把非遗带回家</div>
          </div>
          <router-link to="/clothing" class="wd-section-more">查看全部 →</router-link>
        </div>

        <div class="wd-grid wd-grid-4">
          <SkeletonCard v-if="loading" v-for="i in 4" :key="`sp${i}`" cover="190px" />
          <article
            v-else
            v-for="(p, i) in home.hotProducts"
            :key="p.id"
            class="wd-card wd-card-hover wd-rise"
            :style="{ animationDelay: `${i * 60}ms` }"
            @click="$router.push(`/clothing/${p.id}`)"
          >
            <div class="wd-media" style="height: 190px">
              <img :src="img(p.mainImage, p.title, true)" :alt="p.title" @error="imgError" />
              <span v-if="p.sales" class="wd-chip card-chip">已售 {{ p.sales }}</span>
            </div>
            <div class="wd-card-body">
              <div class="wd-title clamp-1">{{ p.title }}</div>
              <div class="wd-desc clamp-1">{{ p.subtitle || '苗乡手作 · 匠心出品' }}</div>
              <div class="card-foot">
                <span class="wd-price">¥{{ p.price }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ 热门民宿 ============ -->
      <section class="wd-section">
        <div class="wd-section-head">
          <div>
            <h2 class="wd-section-title">山居美宿</h2>
            <div class="wd-section-sub">推开窗就是梯田与云海</div>
          </div>
          <router-link to="/hotel" class="wd-section-more">查看全部 →</router-link>
        </div>

        <div class="wd-grid wd-grid-3">
          <SkeletonCard v-if="loading" v-for="i in 3" :key="`sh${i}`" cover="230px" />
          <article
            v-else
            v-for="(h, i) in home.hotHomestays"
            :key="h.id"
            class="wd-card wd-card-hover wd-rise"
            :style="{ animationDelay: `${i * 60}ms` }"
            @click="$router.push(`/hotel/${h.id}`)"
          >
            <div class="wd-media" style="height: 230px">
              <img :src="img(h.mainImage, h.name, true)" :alt="h.name" @error="imgError" />
              <div class="place-overlay">
                <span class="place-name">{{ h.name }}</span>
                <span class="place-addr">{{ h.address }}</span>
              </div>
            </div>
            <div class="wd-card-body">
              <div class="wd-title clamp-1">{{ h.name }}</div>
              <div class="wd-desc clamp-1">{{ h.address }}</div>
              <div class="card-foot">
                <span class="wd-price">¥{{ h.minPrice }} <small>起/晚</small></span>
                <span class="wd-meta">评分 {{ h.rating }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ 热门路线 ============ -->
      <section class="wd-section">
        <div class="wd-section-head">
          <div>
            <h2 class="wd-section-title">精选路线</h2>
            <div class="wd-section-sub">把苗寨、梯田、云海一次走完</div>
          </div>
          <router-link to="/travel/routes" class="wd-section-more">查看全部 →</router-link>
        </div>

        <div class="wd-grid wd-grid-3">
          <SkeletonCard v-if="loading" v-for="i in 3" :key="`sr${i}`" cover="210px" />
          <article
            v-else
            v-for="(r, i) in home.hotRoutes"
            :key="r.id"
            class="wd-card wd-card-hover wd-rise route-card"
            :style="{ animationDelay: `${i * 60}ms` }"
            @click="$router.push(`/travel/routes/${r.id}`)"
          >
            <div class="wd-media" style="height: 210px">
              <img :src="img(r.coverImage || r.mainImage, r.title, true)" :alt="r.title" @error="imgError" />
              <span class="wd-chip card-chip">精选路线</span>
            </div>
            <div class="wd-card-body">
              <div class="wd-title clamp-2">{{ r.title }}</div>
              <div class="card-foot">
                <span class="wd-price">¥{{ r.price }} <small>/人</small></span>
                <span class="route-go">
                  去看看 <el-icon><ArrowRight /></el-icon>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ============ 社区热帖（瀑布流） ============ -->
      <section class="wd-section">
        <div class="wd-section-head">
          <div>
            <h2 class="wd-section-title">社区热帖</h2>
            <div class="wd-section-sub">来自旅人的真实记录</div>
          </div>
          <router-link to="/community" class="wd-section-more">进入社区 →</router-link>
        </div>

        <div v-if="loading" class="wd-waterfall">
          <SkeletonCard v-for="i in 6" :key="`spp${i}`" variant="waterfall" cover="160px" />
        </div>

        <div v-else-if="postCards.length" class="wd-waterfall">
          <article
            v-for="(p, i) in postCards"
            :key="p.id"
            class="wd-card wd-card-hover wd-rise post-card"
            :style="{ animationDelay: `${i * 50}ms` }"
            @click="$router.push(`/community/${p.id}`)"
          >
            <div class="wd-media" :style="{ height: p.coverHeight + 'px' }">
              <img :src="p.cover" :alt="p.title" @error="imgError" />
            </div>
            <div class="wd-card-body">
              <div class="wd-title clamp-2">{{ p.title }}</div>
              <div class="post-foot">
                <div class="post-author">
                  <el-avatar :size="22" :src="p.userAvatar">{{ (p.userName || '旅').slice(0, 1) }}</el-avatar>
                  <span class="clamp-1">{{ p.userName || '匿名旅人' }}</span>
                </div>
                <div class="post-stats">
                  <span><el-icon><Star /></el-icon>{{ fmt(p.likeCount) }}</span>
                  <span><el-icon><ChatDotRound /></el-icon>{{ fmt(p.commentCount) }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="wd-card">
          <EmptyState
            variant="search"
            title="还没有旅人分享"
            desc="成为第一个记录乌东的人吧，你的游记会出现在这里。"
          >
            <router-link to="/community/publish">
              <el-button type="primary">写第一篇游记</el-button>
            </router-link>
          </EmptyState>
        </div>
      </section>
    </div>

    <!-- ============ 页脚 ============ -->
    <footer class="footer">
      <div class="wd-miao-pattern footer-pattern"></div>
      <div class="wd-container footer-inner">
        <div class="footer-brand">
          <div class="footer-lockup">
            <BrandMark :size="40" tone="light" />
            <div class="footer-logo">
              乌东文旅
              <small>WUDONG · MIAO</small>
            </div>
          </div>
          <p class="footer-slogan">衣 · 食 · 住 · 行，一站式苗乡旅行服务</p>
        </div>
        <div class="footer-links">
          <router-link to="/clothing">非遗好物</router-link>
          <router-link to="/food">苗乡美食</router-link>
          <router-link to="/hotel">民宿住宿</router-link>
          <router-link to="/travel">景区出行</router-link>
          <router-link to="/community">社区分享</router-link>
        </div>
        <div class="footer-copy">© 2026 乌东文旅平台 · 课程实践项目</div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import {
  ArrowRight,
  Bell,
  ChatDotRound,
  Promotion,
  Star,
} from '@element-plus/icons-vue';
import BrandMark from '../components/BrandMark.vue';
import SkeletonCard from '../components/SkeletonCard.vue';
import EmptyState from '../components/EmptyState.vue';
import request from '../api/request';
import { img, imgLarge, imgError, imgList, HERO_SLIDES, PHOTO, PHOTO_LARGE } from '../utils/media';

const home = reactive<any>({
  banners: [],
  announcements: [],
  activities: [],
  hotProducts: [],
  hotHomestays: [],
  hotRoutes: [],
  hotPosts: [],
});
const loading = ref(true);
const heroIndex = ref(0);
const carouselRef = ref<any>(null);

function goSlide(i: number) {
  carouselRef.value?.setActiveItem?.(i);
}

/** 轮播：优先用后端图；后端没配就用本地素材兜底，保证首屏永远有画面
    首屏 1192px 宽 × 2x 屏 = 需要 2384px，这里必须走 imgLarge（≥2048px） */
const FALLBACK_TITLES = ['乌东苗寨全景', '苗寨梯田风光', '苗家长桌宴', '非遗银饰工坊'];
const slides = computed(() => {
  const list = (home.banners || []).map((b: any) => ({
    id: b.id,
    src: imgLarge(b.imageUrl, b.title, true),
    title: b.title || '走进乌东苗寨',
  }));
  if (list.length) return list;
  return HERO_SLIDES.map((src, i) => ({ id: `local-${i}`, src, title: FALLBACK_TITLES[i] }));
});

const currentSlide = computed(() => slides.value[heroIndex.value] || { title: '走进乌东苗寨' });

const entries = [
  { path: '/clothing', label: '非遗好物', sub: '苗绣 · 银饰 · 蜡染', img: PHOTO_LARGE.batik },
  { path: '/food', label: '苗乡美食', sub: '长桌宴 · 酸汤鱼', img: PHOTO.longtable },
  { path: '/hotel', label: '民宿住宿', sub: '吊脚楼 · 山景房', img: PHOTO.lodge },
  { path: '/travel', label: '景区出行', sub: '梯田 · 云海 · 路线', img: PHOTO_LARGE.terraces },
];

/** 社区热帖转成瀑布流卡片：高度按 id 稳定错落，模拟小红书的节奏 */
const postCards = computed(() =>
  (home.hotPosts || []).map((p: any) => {
    const covers = imgList(p.images, p.title);
    const heights = [180, 240, 200, 270, 220, 250];
    return {
      ...p,
      cover: covers[0],
      coverHeight: heights[(Number(p.id) || 0) % heights.length],
    };
  })
);

function fmt(n: number) {
  const v = Number(n) || 0;
  return v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v);
}

onMounted(async () => {
  try {
    const data: any = await request.get('/home');
    Object.assign(home, data || {});
  } catch {
    // 提示已由拦截器统一处理
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  padding: 28px 0 0;
}
.hero-media {
  position: relative;
  border-radius: var(--wd-r-xl);
  overflow: hidden;
  box-shadow: var(--wd-sh-3);
  background: #e9edf4;
}
.hero-img {
  width: 100%;
  height: 440px;
  object-fit: cover;
  display: block;
}
.hero-skel {
  height: 440px;
  border-radius: 0;
}
.hero-media :deep(.el-carousel),
.hero-media :deep(.el-carousel__container) {
  border-radius: var(--wd-r-xl);
}
.hero-media :deep(.el-carousel__arrow) {
  background: rgba(20, 22, 30, 0.36);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.24);
  width: 44px;
  height: 44px;
}

.hero-caption {
  position: absolute;
  left: 32px;
  bottom: 32px;
  max-width: 460px;
  padding: 26px 30px;
  border-radius: var(--wd-r-lg);
  color: #fff;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.24);
}
.hero-kicker {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.82);
}
.hero-title {
  margin-top: 10px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.24;
  color: #fff;
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.3);
}
.hero-desc {
  margin-top: 10px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.86);
}
.hero-actions {
  display: flex;
  gap: 12px;
  margin-top: 22px;
}
.hero-btn {
  display: inline-flex;
  align-items: center;
  height: 42px;
  padding: 0 24px;
  border-radius: var(--wd-r-pill);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.24s var(--wd-ease);
}
.hero-btn-solid {
  color: #fff;
  background: linear-gradient(140deg, var(--wd-brand-400), var(--wd-brand-600));
  box-shadow: 0 10px 26px rgba(var(--wd-brand-rgb), 0.36);
}
.hero-btn-solid:hover {
  transform: translateY(-2px);
}
.hero-btn-glass {
  color: #fff;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.34);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}
.hero-btn-glass:hover {
  background: rgba(255, 255, 255, 0.26);
}

.hero-dots {
  position: absolute;
  right: 32px;
  bottom: 36px;
  display: flex;
  gap: 8px;
}
.hero-dot {
  width: 9px;
  height: 9px;
  padding: 0;
  border: none;
  border-radius: var(--wd-r-pill);
  background: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.3s var(--wd-ease);
}
.hero-dot.active {
  width: 26px;
  background: #fff;
}

@media (max-width: 760px) {
  .hero-caption {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
    padding: 18px;
  }
  .hero-title {
    font-size: 22px;
  }
  .hero-img,
  .hero-skel {
    height: 340px;
  }
  .hero-dots {
    display: none;
  }
}

/* ---------- 快捷入口 ---------- */
.entries {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--wd-s5);
  margin-top: var(--wd-s7);
}
.entry {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  text-decoration: none;
}
.entry-media {
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  border-radius: var(--wd-r-sm);
}
.entry-body {
  flex: 1;
  min-width: 0;
}
.entry-label {
  font-size: 15px;
  font-weight: 700;
  color: var(--wd-text-1);
}
.entry-sub {
  margin-top: 3px;
  font-size: 12px;
  color: var(--wd-text-4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.entry-arrow {
  color: var(--wd-text-4);
  transition: transform 0.28s var(--wd-ease), color 0.28s var(--wd-ease);
}
.entry:hover .entry-arrow {
  transform: translateX(4px);
  color: var(--wd-brand);
}

@media (max-width: 860px) {
  .entries {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* ---------- 公告 ---------- */
.announces {
  margin-top: var(--wd-s6);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.announce {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 18px;
  border-radius: var(--wd-r-sm);
  font-size: 13.5px;
  color: var(--wd-text-2);
}
.announce-icon {
  color: var(--wd-brand);
  flex-shrink: 0;
}
.announce-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- 活动 ---------- */
.activities {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--wd-s5);
}
/* 只有一条活动时占满整行，避免右边空出一格 */
.activities > :only-child {
  grid-column: 1 / -1;
}
.activity {
  position: relative;
  height: 150px;
  overflow: hidden;
}
.activity img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s var(--wd-ease);
}
.activity:hover img {
  transform: scale(1.05);
}
.activity-veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(16, 18, 24, 0.66) 0%, rgba(16, 18, 24, 0.24) 56%, rgba(16, 18, 24, 0) 100%);
  transition: opacity 0.4s var(--wd-ease);
}
.activity:hover .activity-veil {
  opacity: 0.86;
}
.activity-chip {
  position: absolute;
  left: 14px;
  top: 14px;
}
.activity-copy {
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 16px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.activity-title {
  font-size: 19px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.42);
}
.activity-cta {
  flex-shrink: 0;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.86);
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.34s var(--wd-ease);
}
.activity:hover .activity-cta {
  opacity: 1;
  transform: translateX(0);
}
.act-skel {
  height: 150px;
  border-radius: var(--wd-r-md);
}

/* ---------- 卡片细节 ---------- */
.card-chip {
  position: absolute;
  left: 12px;
  top: 12px;
}
.card-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.place-overlay {
  position: absolute;
  left: 18px;
  bottom: 16px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
}
.place-name {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
.place-addr {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}
.wd-card .place-overlay {
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.36s var(--wd-ease);
}
.wd-card:hover .place-overlay {
  opacity: 1;
  transform: none;
}

.route-go {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-text-4);
  transition: color 0.28s var(--wd-ease), transform 0.28s var(--wd-ease);
}
.route-card:hover .route-go {
  color: var(--wd-brand);
  transform: translateX(3px);
}

/* ---------- 社区瀑布流 ---------- */
.post-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--wd-border);
}
.post-author {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  font-size: 12.5px;
  color: var(--wd-text-3);
}
.post-stats {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--wd-text-4);
}
.post-stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

/* ---------- 页脚 ---------- */
/* ---------- 页脚：深靛底 + 苗族纹样，给页面一个正式的收尾 ---------- */
.footer {
  position: relative;
  overflow: hidden;
  margin-top: var(--wd-s10);
  padding: var(--wd-s9) 0;
  background: linear-gradient(150deg, var(--wd-brand-700), var(--wd-brand-900));
  color: rgba(255, 255, 255, 0.86);
}
.footer-pattern {
  opacity: 0.1;
}
.footer-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-s6);
  flex-wrap: wrap;
}
.footer-lockup {
  display: flex;
  align-items: center;
  gap: 12px;
}
.footer-logo {
  display: flex;
  flex-direction: column;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  color: #fff;
}
.footer-logo small {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.5);
}
.footer-slogan {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
.footer-links {
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}
.footer-links a {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
  transition: color 0.24s var(--wd-ease);
}
.footer-links a:hover {
  color: #fff;
}
.footer-copy {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.46);
}

/* 过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s var(--wd-ease);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
