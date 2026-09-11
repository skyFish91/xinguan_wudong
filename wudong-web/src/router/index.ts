import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 游客端路由
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/scenic',
      name: 'scenic-list',
      component: () => import('../views/ScenicList.vue')
    },
    {
      path: '/scenic/:id',
      name: 'scenic-detail',
      component: () => import('../views/ScenicDetail.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/Search.vue')
    },
    {
      path: '/route',
      name: 'route-list',
      component: () => import('../views/RouteList.vue')
    },
    {
      path: '/route/:id',
      name: 'route-detail',
      component: () => import('../views/RouteDetail.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/Register.vue')
    },
    {
      path: '/user',
      name: 'user-center',
      component: () => import('../views/user/Index.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/user/profile'
        },
        {
          path: 'profile',
          name: 'user-profile',
          component: () => import('../views/user/Profile.vue')
        },
        {
          path: 'orders',
          name: 'user-orders',
          component: () => import('../views/user/Orders.vue')
        },
        {
          path: 'favorites',
          name: 'user-favorites',
          component: () => import('../views/user/Favorites.vue')
        },
        {
          path: 'reviews',
          name: 'user-reviews',
          component: () => import('../views/user/Reviews.vue')
        }
      ]
    },
    {
      path: '/order/create',
      name: 'order-create',
      component: () => import('../views/order/Create.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/cart/Index.vue')
    },
    {
      path: '/order/:id',
      name: 'order-detail',
      component: () => import('../views/order/Detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/payment/:orderId',
      name: 'payment',
      component: () => import('../views/payment/Index.vue'),
      meta: { requiresAuth: true }
    },

    // 商家端路由
    {
      path: '/merchant/login',
      name: 'merchant-login',
      component: () => import('../views/merchant/Login.vue')
    },
    {
      path: '/merchant',
      name: 'merchant-layout',
      component: () => import('../views/merchant/Layout.vue'),
      meta: { requiresAuth: true, role: 'merchant' },
      children: [
        {
          path: '',
          redirect: '/merchant/dashboard'
        },
        {
          path: 'dashboard',
          name: 'merchant-dashboard',
          component: () => import('../views/merchant/Dashboard.vue')
        },
        {
          path: 'scenics',
          name: 'merchant-scenics',
          component: () => import('../views/merchant/Scenics.vue')
        },
        {
          path: 'tickets',
          name: 'merchant-tickets',
          component: () => import('../views/merchant/Tickets.vue')
        },
        {
          path: 'orders',
          name: 'merchant-orders',
          component: () => import('../views/merchant/Orders.vue')
        },
        {
          path: 'statistics',
          name: 'merchant-statistics',
          component: () => import('../views/merchant/Statistics.vue')
        }
      ]
    },

    // 平台管理端路由
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../views/admin/Login.vue')
    },
    {
      path: '/admin',
      name: 'admin-layout',
      component: () => import('../views/admin/Layout.vue'),
      meta: { requiresAuth: true, role: 'admin' },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard'
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../views/admin/Dashboard.vue')
        },
        {
          path: 'merchants',
          name: 'admin-merchants',
          component: () => import('../views/admin/Merchants.vue')
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../views/admin/Users.vue')
        },
        {
          path: 'scenics',
          name: 'admin-scenics',
          component: () => import('../views/admin/Scenics.vue')
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('../views/admin/Orders.vue')
        },
        {
          path: 'finance',
          name: 'admin-finance',
          component: () => import('../views/admin/Finance.vue')
        },
        {
          path: 'reviews',
          name: 'admin-reviews',
          component: () => import('../views/admin/Reviews.vue')
        },
        {
          path: 'statistics',
          name: 'admin-statistics',
          component: () => import('../views/admin/Statistics.vue')
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 未登录，跳转到对应的登录页
    if (to.meta.role === 'merchant') {
      next({ name: 'merchant-login', query: { redirect: to.fullPath } })
    } else if (to.meta.role === 'admin') {
      next({ name: 'admin-login', query: { redirect: to.fullPath } })
    } else {
      next({ name: 'login', query: { redirect: to.fullPath } })
    }
  } else {
    next()
  }
})

export default router
