import { ModuleConfig } from '/@/cool';

export default {
	order: 15,
	label: '社区管理',
	description: '游记/评论/话题/举报审核管理',
	icon: 'icon-apps',
	views: [
		{
			path: '/community/post',
			meta: {
				label: '游记管理'
			},
			component: () => import('./views/post/index.vue')
		},
		{
			path: '/community/comment',
			meta: {
				label: '评论管理'
			},
			component: () => import('./views/comment/index.vue')
		},
		{
			path: '/community/topic',
			meta: {
				label: '话题管理'
			},
			component: () => import('./views/topic/index.vue')
		},
		{
			path: '/community/report',
			meta: {
				label: '举报处理'
			},
			component: () => import('./views/report/index.vue')
		}
	]
} as ModuleConfig;
