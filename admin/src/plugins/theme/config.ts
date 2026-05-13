import { type ModuleConfig } from '/@/cool';
import 'element-plus/theme-chalk/dark/css-vars.css';
import './static/css/index.scss';

export default (): ModuleConfig => {
	return {
		enable: true,
		order: 99,
		options: {
			name: 'default',
			color: '#C9A84C',
		},
		install() {
			// 固定暗金主题，直接设置主色变量
			const pre = '--el-color-primary';
			const color = '#C9A84C';
			const el = document.documentElement;
			el.style.setProperty(pre, color);
			const mixWhite = '#ffffff';
			const mixBlack = '#131313';
			const mix = (c1: string, c2: string, w: number) => {
				const r1 = parseInt(c1.slice(1,3),16), g1 = parseInt(c1.slice(3,5),16), b1 = parseInt(c1.slice(5,7),16);
				const r2 = parseInt(c2.slice(1,3),16), g2 = parseInt(c2.slice(3,5),16), b2 = parseInt(c2.slice(5,7),16);
				const r = Math.round(r1*(1-w)+r2*w).toString(16).padStart(2,'0');
				const g = Math.round(g1*(1-w)+g2*w).toString(16).padStart(2,'0');
				const b = Math.round(b1*(1-w)+b2*w).toString(16).padStart(2,'0');
				return '#'+r+g+b;
			};
			for (let i = 1; i < 10; i++) {
				el.style.setProperty(`${pre}-light-${i}`, mix(color, mixWhite, i * 0.1));
				el.style.setProperty(`${pre}-dark-${i}`, mix(color, mixBlack, i * 0.1));
			}
		},

		label: '主题',
		description: '暗金主题',
		author: 'COOL',
		version: '2.0.0',
		updateTime: '2026-05-13'
	};
};
