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
			name: 'default',

			// 主题色：与小程序金色主题对齐
			color: '#C9A84C',

			// 主题列表
			list: [
				{
					label: t('暗金'),
					name: 'default',
					color: '#C9A84C'
				},
				{
					label: t('琥珀'),
					name: 'hupo',
					color: '#E2C07A'
				},
				{
					label: t('铜棕'),
					name: 'tongzong',
					color: '#8B6914'
				},
				{
					label: t('玫瑰金'),
					name: 'meiguijin',
					color: '#C4956A'
				},
				{
					label: t('青铜'),
					name: 'qingtong',
					color: '#4CAF7D'
				},
				{
					label: t('深蓝'),
					name: 'shenlv',
					color: '#4165d7'
				},
				{
					label: t('紫檀'),
					name: 'zitan',
					color: '#9B59B6'
				},
				{
					label: t('珊瑚'),
					name: 'shanhu',
					color: '#E05A5A'
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
