import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/login', component: () => import('../views/Login.vue') },
    { path: '/register', component: () => import('../views/Register.vue') },
    // 衣
    { path: '/clothing', component: () => import('../views/clothing/List.vue') },
    { path: '/clothing/:id', component: () => import('../views/clothing/Detail.vue') },
    // 食
    { path: '/food', component: () => import('../views/food/Index.vue') },
    { path: '/food/restaurant/:id', component: () => import('../views/food/RestaurantDetail.vue') },
    // 住
    { path: '/hotel', component: () => import('../views/hotel/List.vue') },
    { path: '/hotel/:id', component: () => import('../views/hotel/Detail.vue') },
    // 行（旅游模块 - 已整合你的页面）
    { path: '/travel', component: () => import('../views/travel/Scenics.vue') },
    { path: '/travel/scenics', component: () => import('../views/travel/ScenicList.vue') },
    { path: '/travel/scenics/:id', component: () => import('../views/travel/ScenicDetail.vue') },
    { path: '/travel/routes', component: () => import('../views/travel/Routes.vue') },
    { path: '/travel/routes-list', component: () => import('../views/travel/RouteList.vue') },
    { path: '/travel/routes/:id', component: () => import('../views/travel/RouteDetail.vue') },
    { path: '/travel/search', component: () => import('../views/travel/Search.vue') },
    { path: '/travel/guides', component: () => import('../views/travel/Guides.vue') },
    { path: '/travel/my-etickets', component: () => import('../views/travel/MyEtickets.vue'), meta: { requiresAuth: true } },
    // 社区
    { path: '/community', component: () => import('../views/community/Feed.vue') },
    { path: '/community/publish', component: () => import('../views/community/Publish.vue'), meta: { requiresAuth: true } },
    { path: '/community/:id', component: () => import('../views/community/PostDetail.vue') },
    // 交易
    { path: '/cart', component: () => import('../views/trade/Cart.vue'), meta: { requiresAuth: true } },
    { path: '/orders', component: () => import('../views/trade/Orders.vue'), meta: { requiresAuth: true } },
    { path: '/pay/:orderId', component: () => import('../views/trade/Pay.vue'), meta: { requiresAuth: true } },
    // 个人中心
    { path: '/user', component: () => import('../views/user/Profile.vue'), meta: { requiresAuth: true } },
    { path: '/user/apply-merchant', component: () => import('../views/user/MerchantApply.vue'), meta: { requiresAuth: true } },
    // AI 聊天助手
    { path: '/ai', component: () => import('../views/ai/Chat.vue') },
    { path: '/ai/chat', component: () => import('../views/ai/Chat.vue') },
  ],
});

// 登录守卫
router.beforeEach((to) => {
  // 只有需要登录的页面才检查，首页不需要登录
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  // 其他页面放行
  return true;
});

export default router;
