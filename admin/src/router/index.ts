import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/Login.vue'), meta: { title: '登录' } },
    {
      path: '/',
      component: () => import('../views/Layout.vue'),
      redirect: '/',
      children: [
        { path: '', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
        // 平台管理员
        { path: 'users', component: () => import('../views/Users.vue'), meta: { role: 'admin', title: '用户管理' } },
        { path: 'applies', component: () => import('../views/Applies.vue'), meta: { role: 'admin', title: '商家审核' } },
        { path: 'orders', component: () => import('../views/Orders.vue'), meta: { role: 'admin', title: '订单总览' } },
        { path: 'refunds', component: () => import('../views/Refunds.vue'), meta: { role: 'admin', title: '退款审批' } },
        { path: 'content', component: () => import('../views/Content.vue'), meta: { role: 'admin', title: '内容审核' } },
        { path: 'sensitive', component: () => import('../views/Sensitive.vue'), meta: { role: 'admin', title: '敏感词管理' } },
        { path: 'ops', component: () => import('../views/Ops.vue'), meta: { role: 'admin', title: '运营管理' } },
        { path: 'finance', component: () => import('../views/Finance.vue'), meta: { role: 'admin', title: '财务管理' } },
        // 商家
        { path: 'merchant/clothing', component: () => import('../views/merchant/Clothing.vue'), meta: { role: 'merchant', module: 'clothing', title: '商品管理' } },
        { path: 'merchant/food', component: () => import('../views/merchant/Food.vue'), meta: { role: 'merchant', module: 'food', title: '餐厅管理' } },
        { path: 'merchant/hotel', component: () => import('../views/merchant/Hotel.vue'), meta: { role: 'merchant', module: 'hotel', title: '民宿管理' } },
        { path: 'merchant/travel', component: () => import('../views/merchant/Travel.vue'), meta: { role: 'merchant', module: 'travel', title: '票务管理' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

// 登录守卫
router.beforeEach((to) => {
  if (to.path === '/login') {
    return;
  }
  if (!localStorage.getItem('token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null');
  const role = userInfo?.role || '';
  if (to.meta.role === 'admin' && role !== 'admin') {
    return { path: '/' };
  }
  if (to.meta.role === 'merchant' && role !== 'merchant') {
    return { path: '/' };
  }
  if (to.meta.module && userInfo?.merchant?.moduleType !== to.meta.module) {
    return { path: '/' };
  }
});

export default router;