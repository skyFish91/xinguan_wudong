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
    path: '/quick-login',
    name: 'QuickLogin',
    component: () => import('../views/auth/QuickLogin.vue'),
    meta: { title: '快速登录' }
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
        component: () => import('../views/community/Home.vue'),
        meta: { title: '旅行社区' }
      },
      {
        path: '/community/test',
        name: 'CommunityTest',
        component: () => import('../views/community/Test.vue'),
        meta: { title: '社区测试' }
      },
      {
        path: '/community/feed',
        name: 'CommunityFeed',
        component: () => import('../views/community/FeedSimple.vue'),
        meta: { title: '旅行社区' }
      },
      {
        path: '/community/search',
        name: 'CommunitySearch',
        component: () => import('../views/community/Search.vue'),
        meta: { title: '搜索' }
      },
      {
        path: '/community/topics',
        name: 'TopicList',
        component: () => import('../views/community/TopicList.vue'),
        meta: { title: '热门话题' }
      },
      {
        path: '/community/topic/:id',
        name: 'TopicDetail',
        component: () => import('../views/community/TopicDetail.vue'),
        meta: { title: '话题详情' }
      },
      {
        path: '/community/post/:id',
        name: 'PostDetail',
        component: () => import('../views/community/PostDetail.vue'),
        meta: { title: '游记详情' }
      },
      {
        path: '/community/publish',
        name: 'PublishPost',
        component: () => import('../views/community/PublishPost.vue'),
        meta: { title: '发布游记', requiresAuth: true }
      },
      {
        path: '/community/topic/:id',
        name: 'TopicDetail',
        component: () => import('../views/community/TopicDetail.vue'),
        meta: { title: '话题详情' }
      },
      {
        path: '/community/user/:id',
        name: 'UserProfile',
        component: () => import('../views/community/UserProfile.vue'),
        meta: { title: '用户主页' }
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
        component: () => import('../views/stay/List.vue'),
        meta: { title: '住宿预订' }
      },
      {
        path: '/stay/:id',
        name: 'StayDetail',
        component: () => import('../views/stay/Detail.vue'),
        meta: { title: '民宿详情' }
      },
      {
        path: '/user',
        name: 'User',
        component: () => import('../views/user/Index.vue'),
        meta: { title: '个人中心', requiresAuth: true }
      },
      {
        path: '/user/:id',
        name: 'UserProfile',
        component: () => import('../views/user/Profile.vue'),
        meta: { title: '用户主页' }
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
