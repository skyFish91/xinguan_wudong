import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/food' },
    { path: '/login', component: () => import('../views/Login.vue') },
    { path: '/register', component: () => import('../views/Register.vue') },
    // 食
    { path: '/food', component: () => import('../views/food/Index.vue') },
    { path: '/food/restaurant/:id', component: () => import('../views/food/RestaurantDetail.vue') },
    { path: '/food/farm/:id', component: () => import('../views/food/ProductDetail.vue') },
    // 管理（管理员/商家，按角色显示）
    { path: '/admin', component: () => import('../views/admin/Admin.vue'), meta: { requiresAuth: true } },
    // 交易（食的加购/餐位预订/立即购买）
    { path: '/cart', component: () => import('../views/trade/Cart.vue'), meta: { requiresAuth: true } },
    { path: '/orders', component: () => import('../views/trade/Orders.vue'), meta: { requiresAuth: true } },
    { path: '/pay/:orderId', component: () => import('../views/trade/Pay.vue'), meta: { requiresAuth: true } },
  ],
});

// 登录守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

export default router;
