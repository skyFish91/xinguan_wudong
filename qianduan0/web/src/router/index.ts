import { createRouter, createWebHistory } from 'vue-router';

/**
 * meta 约定（供 App.vue 的切换动效读取）
 *   bare: true        —— 该页自带整屏布局，不渲染全局头部导航（登录 / 注册）
 *   transition: 'xxx'  —— 指定切换动画名；缺省为 'wd-page'
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    {
      path: '/login',
      component: () => import('../views/Login.vue'),
      meta: { bare: true, transition: 'wd-auth' },
    },
    {
      path: '/register',
      component: () => import('../views/Register.vue'),
      meta: { bare: true, transition: 'wd-auth' },
    },
    // 衣
    { path: '/clothing', component: () => import('../views/clothing/List.vue') },
    { path: '/clothing/:id', component: () => import('../views/clothing/Detail.vue') },
    // 食
    { path: '/food', component: () => import('../views/food/Index.vue') },
    { path: '/food/restaurant/:id', component: () => import('../views/food/RestaurantDetail.vue') },
    // 住
    { path: '/hotel', component: () => import('../views/hotel/List.vue') },
    { path: '/hotel/:id', component: () => import('../views/hotel/Detail.vue') },
    // 行
    { path: '/travel', component: () => import('../views/travel/Scenics.vue') },
    { path: '/travel/routes', component: () => import('../views/travel/Routes.vue') },
    { path: '/travel/routes/:id', component: () => import('../views/travel/RouteDetail.vue') },
    { path: '/travel/guides', component: () => import('../views/travel/Guides.vue') },
    { path: '/travel/my-etickets', component: () => import('../views/travel/MyEtickets.vue'), meta: { requiresAuth: true } },
    // 社区
    { path: '/community', component: () => import('../views/community/Index.vue') },
    { path: '/community/feed', component: () => import('../views/community/Feed.vue') },
    { path: '/community/index', component: () => import('../views/community/Index.vue') },
    { path: '/community/topic/:id', component: () => import('../views/community/TopicDetail.vue') },
    { path: '/community/topics', component: () => import('../views/community/TopicList.vue') },
    { path: '/community/post/:id', component: () => import('../views/community/PostDetail.vue') },
    { path: '/community/:id', component: () => import('../views/community/PostDetail.vue') },
    { path: '/community/publish', component: () => import('../views/community/PublishPost.vue'), meta: { requiresAuth: true } },
    { path: '/community/publish-post', component: () => import('../views/community/PublishPost.vue'), meta: { requiresAuth: true } },
    { path: '/community/search', component: () => import('../views/community/Search.vue') },
    { path: '/community/user/:id', component: () => import('../views/community/UserProfile.vue') },
    // 交易
    { path: '/cart', component: () => import('../views/trade/Cart.vue'), meta: { requiresAuth: true } },
    { path: '/orders', component: () => import('../views/trade/Orders.vue'), meta: { requiresAuth: true } },
    { path: '/pay/:orderId', component: () => import('../views/trade/Pay.vue'), meta: { requiresAuth: true } },
    // 个人中心
    { path: '/user', component: () => import('../views/user/Profile.vue'), meta: { requiresAuth: true } },
    { path: '/user/apply-merchant', component: () => import('../views/user/MerchantApply.vue'), meta: { requiresAuth: true } },
  ],

  /**
   * 滚动行为。注意要与 App.vue 的 out-in 过渡配合：
   * 旧页面还在淡出，所以这里不做平滑滚动（会和淡出叠成「甩一下」的错觉）。
   */
  scrollBehavior(to, from, savedPosition) {
    // 浏览器前进/后退：回到原来的位置
    if (savedPosition) return savedPosition;
    // 锚点：留出吸顶导航的高度
    if (to.hash) return { el: to.hash, top: 88, behavior: 'smooth' };
    // 只有 query 变了（筛选、翻页）：保持当前位置
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});

// 登录守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

export default router;
