import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('../layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('../views/home/Index.vue'),
        meta: { title: '首页' }
      },
      {
        path: '/community',
        name: 'Community',
        component: () => import('../views/community/Index.vue'),
        meta: { title: '旅行社区' }
      },
      {
        path: '/community/:id',
        name: 'PostDetail',
        component: () => import('../views/community/PostDetail.vue'),
        meta: { title: '游记详情' }
      },
      {
        path: '/scenic',
        name: 'Scenic',
        component: () => import('../views/scenic/Index.vue'),
        meta: { title: '景点推荐' }
      },
      {
        path: '/food',
        name: 'Food',
        component: () => import('../views/food/Index.vue'),
        meta: { title: '美食探店' }
      },
      {
        path: '/stay',
        name: 'Stay',
        component: () => import('../views/stay/Index.vue'),
        meta: { title: '住宿预订' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('../views/user/Index.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || '乌东文旅'} - 探索美好生活`

  // 检查是否需要登录
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
