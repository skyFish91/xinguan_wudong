<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            探索<span class="gradient-text">乌东</span>之美
          </h1>
          <p class="hero-subtitle">记录旅行点滴，分享美好生活</p>
          <div class="hero-actions">
            <button class="btn-primary" @click="$router.push('/community')">
              <el-icon><Camera /></el-icon>
              发现游记
            </button>
            <button class="btn-secondary" @click="$router.push('/scenic')">
              <el-icon><Location /></el-icon>
              探索景点
            </button>
          </div>
        </div>
        <div class="hero-image">
          <img src="https://picsum.photos/800/300?random=600x400/667eea/ffffff?text=乌东风光" alt="乌东风光" />
        </div>
      </div>
    </section>

    <!-- 热门游记 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门游记</h2>
          <router-link to="/community" class="more-link">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="post-grid">
          <div
            v-for="post in hotPosts"
            :key="post.id"
            class="post-card card"
            @click="$router.push(`/community/${post.id}`)"
          >
            <div class="post-cover">
              <img :src="post.cover" :alt="post.title" />
              <div class="post-stats">
                <span><el-icon><View /></el-icon> {{ post.viewCount }}</span>
                <span><el-icon><Star /></el-icon> {{ post.likeCount }}</span>
              </div>
            </div>
            <div class="post-info">
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-meta">
                <el-avatar :size="24" :src="post.userAvatar" />
                <span class="post-author">{{ post.userName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐景点 -->
    <section class="section section-gray">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">热门景点</h2>
          <router-link to="/scenic" class="more-link">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="scenic-grid">
          <div
            v-for="scenic in hotScenics"
            :key="scenic.id"
            class="scenic-card card"
            @click="$router.push(`/scenic/${scenic.id}`)"
          >
            <div class="scenic-cover">
              <img :src="scenic.cover" :alt="scenic.name" />
              <div class="scenic-tag">{{ scenic.category }}</div>
            </div>
            <div class="scenic-info">
              <h3 class="scenic-name">{{ scenic.name }}</h3>
              <div class="scenic-location">
                <el-icon><Location /></el-icon>
                {{ scenic.location }}
              </div>
              <div class="scenic-price">
                <span class="price">¥{{ scenic.price }}</span>
                <span class="unit">/人</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 特色美食 -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">特色美食</h2>
          <router-link to="/food" class="more-link">
            查看全部 <el-icon><ArrowRight /></el-icon>
          </router-link>
        </div>
        <div class="food-carousel">
          <el-carousel :interval="4000" height="300px">
            <el-carousel-item v-for="food in foods" :key="food.id">
              <div class="food-item" @click="$router.push(`/food/${food.id}`)">
                <img :src="food.image" :alt="food.name" />
                <div class="food-overlay">
                  <h3>{{ food.name }}</h3>
                  <p>{{ food.description }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Camera, Location, ArrowRight, View, Star } from '@element-plus/icons-vue'

const hotPosts = ref([])
const hotScenics = ref([])
const foods = ref([])

// 模拟数据
const loadData = () => {
  // 热门游记
  hotPosts.value = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `精彩游记标题 ${i + 1}`,
    cover: `https://picsum.photos/800/300?random=300x200/667eea/ffffff?text=游记${i + 1}`,
    viewCount: Math.floor(Math.random() * 5000) + 1000,
    likeCount: Math.floor(Math.random() * 500) + 50,
    userName: `用户${i + 1}`,
    userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`
  }))

  // 热门景点
  hotScenics.value = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `景点名称 ${i + 1}`,
    cover: `https://picsum.photos/800/300?random=300x200/764ba2/ffffff?text=景点${i + 1}`,
    category: ['自然风光', '历史文化', '特色小镇'][i % 3],
    location: '乌东市',
    price: Math.floor(Math.random() * 200) + 50
  }))

  // 特色美食
  foods.value = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `美食名称 ${i + 1}`,
    image: `https://picsum.photos/800/300?random=800x300/f093fb/ffffff?text=美食${i + 1}`,
    description: '地道美味，值得品尝'
  }))
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-page {
  .hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 80px 0;

    .container {
      display: flex;
      align-items: center;
      gap: 60px;
    }

    .hero-content {
      flex: 1;
    }

    .hero-title {
      font-size: 56px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;

      .gradient-text {
        background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .hero-subtitle {
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.9;
    }

    .hero-actions {
      display: flex;
      gap: 16px;

      .btn-primary,
      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 32px;
        font-size: 16px;
        border-radius: 24px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-primary {
        background: #fff;
        color: #667eea;
        border: none;
      }

      .btn-secondary {
        background: transparent;
        color: #fff;
        border: 2px solid #fff;
      }

      button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
      }
    }

    .hero-image {
      flex: 1;

      img {
        width: 100%;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }
    }
  }

  .section {
    padding: 80px 0;

    &.section-gray {
      background: #fafbfc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;

      .section-title {
        font-size: 32px;
        font-weight: 700;
      }

      .more-link {
        color: #667eea;
        display: flex;
        align-items: center;
        gap: 4px;
        transition: gap 0.3s;

        &:hover {
          gap: 8px;
        }
      }
    }
  }

  .post-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;

    .post-card {
      cursor: pointer;
      overflow: hidden;

      .post-cover {
        position: relative;
        width: 100%;
        height: 200px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .post-stats {
          position: absolute;
          bottom: 12px;
          right: 12px;
          display: flex;
          gap: 12px;
          color: #fff;
          font-size: 14px;

          span {
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(0, 0, 0, 0.5);
            padding: 4px 8px;
            border-radius: 12px;
          }
        }
      }

      &:hover .post-cover img {
        transform: scale(1.1);
      }

      .post-info {
        padding: 16px;

        .post-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #999;
          font-size: 14px;
        }
      }
    }
  }

  .scenic-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;

    .scenic-card {
      cursor: pointer;
      overflow: hidden;

      .scenic-cover {
        position: relative;
        width: 100%;
        height: 240px;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .scenic-tag {
          position: absolute;
          top: 16px;
          left: 16px;
          background: rgba(102, 126, 234, 0.9);
          color: #fff;
          padding: 6px 16px;
          border-radius: 16px;
          font-size: 14px;
        }
      }

      &:hover .scenic-cover img {
        transform: scale(1.1);
      }

      .scenic-info {
        padding: 20px;

        .scenic-name {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .scenic-location {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #999;
          margin-bottom: 12px;
        }

        .scenic-price {
          display: flex;
          align-items: baseline;
          gap: 4px;

          .price {
            font-size: 24px;
            font-weight: 700;
            color: #f56c6c;
          }

          .unit {
            color: #999;
            font-size: 14px;
          }
        }
      }
    }
  }

  .food-carousel {
    .food-item {
      position: relative;
      height: 300px;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .food-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        color: #fff;
        padding: 32px;

        h3 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        p {
          font-size: 16px;
          opacity: 0.9;
        }
      }
    }
  }
}
</style>
