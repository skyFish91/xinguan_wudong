<template>
  <div class="home-page">
    <TopNav />

    <!-- 主轮播区域 -->
    <section class="hero-carousel">
      <el-carousel v-if="home.banners?.length" height="calc(100vh - 64px)" :interval="5000" arrow="hover" indicator-position="none">
        <el-carousel-item v-for="b in home.banners" :key="b.id">
          <div class="carousel-slide">
            <img :src="b.imageUrl" class="slide-image" />
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <div class="slide-text">
                <h1 class="slide-title">乌东苗寨</h1>
                <p class="slide-description">
                  千年古寨 · 吊脚楼群 · 梯田风光<br>
                  感受苗族文化的原生魅力
                </p>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 四大功能入口 -->
    <section class="main-categories">
      <div class="container">
        <div class="categories-grid">
          <router-link to="/clothing" class="category-card">
            <div class="category-icon">衣</div>
            <h3 class="category-title">苗族服饰</h3>
            <p class="category-desc">银饰 · 蜡染 · 刺绣</p>
          </router-link>

          <router-link to="/food" class="category-card">
            <div class="category-icon">食</div>
            <h3 class="category-title">特色美食</h3>
            <p class="category-desc">酸汤鱼 · 长桌宴 · 糯米饭</p>
          </router-link>

          <router-link to="/hotel" class="category-card">
            <div class="category-icon">住</div>
            <h3 class="category-title">民宿客栈</h3>
            <p class="category-desc">吊脚楼 · 观景房 · 特色民宿</p>
          </router-link>

          <router-link to="/travel" class="category-card">
            <div class="category-icon">行</div>
            <h3 class="category-title">景点门票</h3>
            <p class="category-desc">路线 · 导览 · 电子票</p>
          </router-link>
        </div>
      </div>
    </section>

    <!-- 简介区域 -->
    <section class="intro-section">
      <div class="container">
        <h2 class="section-title">云上乌东</h2>
        <p class="section-desc">
          乌东苗寨位于贵州省黔东南，是一座保存完整的苗族传统村落。<br>
          这里有原生态的民族文化、壮观的梯田风光、精美的苗族银饰与蜡染技艺。<br>
          在线预订门票、住宿、美食，开启你的苗寨文化之旅。
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import TopNav from '../components/TopNav.vue';
import request from '../api/request';

const home = reactive<any>({ banners: [] });

onMounted(async () => {
  try {
    const data: any = await request.get('/home');
    Object.assign(home, data);
  } catch {
    // 提示已由拦截器统一处理
  }
});
</script>

<style scoped>
.home-page {
  background: #ffffff;
  min-height: 100vh;
}

/* 主轮播 */
.hero-carousel {
  width: 100%;
}

.carousel-slide {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%);
}

.slide-content {
  position: absolute;
  bottom: 80px;
  left: 0;
  right: 0;
  z-index: 10;
}

.slide-text {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.slide-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 56px;
  font-weight: 300;
  color: #ffffff;
  margin-bottom: 20px;
  letter-spacing: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.slide-description {
  font-size: 18px;
  color: #ffffff;
  line-height: 1.8;
  letter-spacing: 2px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
  opacity: 0.95;
}

/* 四大功能入口 */
.main-categories {
  padding: 80px 0;
  background: #F7F4EE;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.category-card {
  background: #ffffff;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 48px 32px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(27, 42, 74, 0.12);
  border-color: #C0C7D0;
}

.category-icon {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 48px;
  font-weight: 600;
  color: #1B2A4A;
  margin-bottom: 24px;
  letter-spacing: 2px;
}

.category-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 20px;
  font-weight: 600;
  color: #171512;
  margin: 0 0 12px;
  letter-spacing: 2px;
}

.category-desc {
  font-size: 14px;
  color: #6B4F3A;
  margin: 0;
  letter-spacing: 1px;
  line-height: 1.6;
}

/* 简介区域 */
.intro-section {
  padding: 80px 0;
  background: #ffffff;
}

.section-title {
  font-family: "Noto Serif SC", Georgia, serif;
  font-size: 36px;
  font-weight: 600;
  color: #1B2A4A;
  text-align: center;
  margin: 0 0 32px;
  letter-spacing: 8px;
}

.section-desc {
  font-size: 16px;
  color: #6B4F3A;
  text-align: center;
  line-height: 2;
  letter-spacing: 1px;
  margin: 0;
  max-width: 800px;
  margin: 0 auto;
}

/* 响应式 */
@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .slide-title {
    font-size: 36px;
    letter-spacing: 4px;
  }

  .slide-description {
    font-size: 14px;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .category-card {
    padding: 32px 24px;
  }

  .main-categories,
  .intro-section {
    padding: 48px 0;
  }

  .container {
    padding: 0 24px;
  }

  .section-title {
    font-size: 28px;
    letter-spacing: 4px;
  }

  .section-desc {
    font-size: 14px;
  }
}
</style>

.slide-description {
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255,255,255,0.95);
  font-weight: 300;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* Element Plus 轮播指示器自定义 */
:deep(.el-carousel__indicator) {
  padding: 0;
}

:deep(.el-carousel__button) {
  width: 40px;
  height: 2px;
  background: rgba(255,255,255,0.4);
  border-radius: 0;
  transition: all 0.3s ease;
}

:deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: rgba(255,255,255,0.9);
}

/* 轮播箭头 */
:deep(.el-carousel__arrow) {
  background: rgba(255,255,255,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3);
}

:deep(.el-carousel__arrow:hover) {
  background: rgba(255,255,255,0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .slide-title {
    font-size: 36px;
    letter-spacing: 4px;
  }

  .slide-description {
    font-size: 14px;
  }

  .slide-text {
    padding: 0 24px;
  }

  .slide-content {
    bottom: 40px;
  }
}
</style>
