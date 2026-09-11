import { type ModuleConfig } from '/@/cool';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './static/css/index.scss';
import { t } from '/#/i18n';
import { useTheme } from './hooks';

export default (): ModuleConfig => {
	return {
		enable: true,
		order: 99,
		toolbar: {
			component: import('./components/theme.vue'),
			h5: false
		},
		options: {
			name: 'wudong',

			// 乌东文旅平台主色：靛蓝（设计文档 §4 视觉规范）
			color: '#2B5C8A',

			// 主题列表
			list: [
				{
					label: t('靛蓝'),
					name: 'wudong',
					color: '#2B5C8A'
				},
				{
					label: t('苗绣红'),
					name: 'miaoxiu',
					color: '#C1483C'
				},
				{
					label: t('银灰'),
					name: 'yinhui',
					color: '#8A94A6'
				},
				{
					label: t('默认'),
					name: 'default',
					color: '#4165d7'
				}
			]
		},
		install() {
			useTheme();
		},

		label: '主题',
		description: '自定义主色、菜单分组、暗黑模式',
		author: 'COOL',
		version: '1.0.0',
		updateTime: '2024-07-22'
	};
};
