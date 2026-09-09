<template>
  <div>
    <TopNav />
    <div class="page">
      <!-- 轮播 -->
      <el-carousel v-if="home.banners?.length" height="360px" class="banner">
        <el-carousel-item v-for="b in home.banners" :key="b.id">
          <img :src="b.imageUrl" class="banner-img" />
        </el-carousel-item>
      </el-carousel>

      <!-- 公告 -->
      <el-alert
        v-for="a in home.announcements"
        :key="a.id"
        :title="a.title"
        type="info"
        :closable="false"
        class="announce"
      />

      <!-- 活动横幅 -->
      <div v-if="home.activities?.length" class="activities">
        <img v-for="a in home.activities" :key="a.id" :src="a.imageUrl" class="activity-img" />
      </div>

      <!-- 热门非遗商品 -->
      <el-divider content-position="left">热门非遗好物</el-divider>
      <div class="grid">
        <el-card v-for="p in home.hotProducts" :key="p.id" class="item-card" shadow="hover" @click="$router.push(`/clothing/${p.id}`)">
          <img :src="p.mainImage" class="item-img" />
          <div class="item-title">{{ p.title }}</div>
          <div class="item-price">¥{{ p.price }}</div>
        </el-card>
      </div>

      <!-- 热门民宿 -->
      <el-divider content-position="left">热门民宿</el-divider>
      <div class="grid">
        <el-card v-for="h in home.hotHomestays" :key="h.id" class="item-card" shadow="hover" @click="$router.push(`/hotel/${h.id}`)">
          <img :src="h.mainImage" class="item-img" />
          <div class="item-title">{{ h.name }}</div>
          <div class="item-price">¥{{ h.minPrice }} 起/晚</div>
        </el-card>
      </div>

      <!-- 热门路线 -->
      <el-divider content-position="left">热门路线</el-divider>
      <div class="grid">
        <el-card v-for="r in home.hotRoutes" :key="r.id" class="item-card" shadow="hover" @click="$router.push(`/travel/routes/${r.id}`)">
          <img :src="r.coverImage" class="item-img" />
          <div class="item-title">{{ r.title }}</div>
          <div class="item-price">¥{{ r.price }} /人</div>
        </el-card>
      </div>

      <!-- 热门游记 -->
      <el-divider content-position="left">社区热帖</el-divider>
      <div class="posts">
        <div v-for="p in home.hotPosts" :key="p.id" class="post-row" @click="$router.push(`/community/${p.id}`)">
          <img v-if="p.images" :src="String(p.images).split(',')[0]" class="post-img" />
          <div>
            <div class="post-title">{{ p.title }}</div>
            <div class="post-meta">赞 {{ p.likeCount }} · 评论 {{ p.commentCount }} · 浏览 {{ p.viewCount }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import TopNav from '../components/TopNav.vue';
import request from '../api/request';

const home = reactive<any>({ banners: [], announcements: [], activities: [], hotProducts: [], hotHomestays: [], hotRoutes: [], hotPosts: [] });

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
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.banner-img {
  width: 100%;
  height: 360px;
  object-fit: cover;
}
.announce {
  margin-top: 12px;
}
.activities {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.activity-img {
  height: 120px;
  border-radius: 6px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.item-card {
  cursor: pointer;
}
.item-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}
.item-title {
  margin-top: 8px;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-price {
  margin-top: 4px;
  color: #c0392b;
  font-weight: bold;
}
.posts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.post-row {
  display: flex;
  gap: 12px;
  cursor: pointer;
  align-items: center;
}
.post-img {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
.post-title {
  font-size: 15px;
  font-weight: 600;
}
.post-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
