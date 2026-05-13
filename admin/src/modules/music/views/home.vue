<template>
	<el-scrollbar class="music-home-scroll">
		<div class="music-home">
			<!-- 星空背景粒子 -->
			<div class="stars-bg" aria-hidden="true">
				<div v-for="i in 60" :key="i" class="star" :style="starStyle(i)" />
			</div>

			<!-- 顶部问候 -->
			<div class="home-header">
				<div class="header-left">
					<h1 class="greeting">{{ greeting }}，<span class="gold-text">{{ userName }}</span></h1>
					<p class="date-text">{{ todayLabel }}</p>
				</div>
				<div class="header-right">
					<div class="live-badge">
						<span class="live-dot" />
						实时数据
					</div>
				</div>
			</div>

			<!-- 课时费收入卡片组 -->
			<div class="section-title">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
				课时费收入
			</div>
			<div class="earning-grid">
				<div
					v-for="item in earningCards"
					:key="item.key"
					class="glass-card earning-card"
					:class="{ 'earning-card--active': item.key === 'monthEarning' }"
				>
					<div class="earning-icon-wrap" :style="{ background: item.iconBg }" aria-hidden="true">
						<component :is="item.icon" class="earning-svg-icon" />
					</div>
					<div class="earning-label">{{ item.label }}</div>
					<div class="earning-amount">
						<span class="currency">¥</span>
						<span class="amount-num">{{ formatAmount(summary[item.key]) }}</span>
					</div>
					<div class="card-glow" />
				</div>
			</div>

			<!-- 核心统计卡片 -->
			<div class="section-title">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
				总览
			</div>
			<div class="stat-grid">
				<div v-for="item in statCards" :key="item.key" class="glass-card stat-card">
					<div class="stat-icon-wrap" :style="{ background: item.iconBg }">
						<component :is="item.icon" class="stat-icon" />
					</div>
					<div class="stat-info">
						<div class="stat-num">{{ summary[item.key] }}<span class="stat-unit">{{ item.unit }}</span></div>
						<div class="stat-label">{{ item.label }}</div>
					</div>
					<div class="stat-orbit" aria-hidden="true" />
				</div>
			</div>

			<!-- 图表区 -->
			<div class="charts-row">
				<!-- 月度趋势 -->
				<div class="glass-card chart-card chart-card--wide">
					<div class="card-header">
						<div class="card-title">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
							月度上课趋势
						</div>
						<el-date-picker
							v-model="selectedYear"
							type="year"
							value-format="YYYY"
							placeholder="年份"
							style="width: 110px"
							@change="loadMonthly"
						/>
					</div>
					<v-chart :option="monthlyOption" autoresize style="height: 260px" />
				</div>

				<!-- 维度分布 -->
				<div class="glass-card chart-card">
					<div class="card-header">
						<div class="card-title">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
							{{ dimTab === 'teacher' ? '教师' : '学生' }}分布
						</div>
						<div class="dim-controls">
							<el-radio-group v-model="dimTab" size="small" @change="loadDim">
								<el-radio-button value="teacher">教师</el-radio-button>
								<el-radio-button value="student">学生</el-radio-button>
							</el-radio-group>
							<el-date-picker
								v-model="selectedMonth"
								type="month"
								value-format="YYYY-MM"
								placeholder="月份"
								style="width: 120px"
								@change="loadDim"
							/>
						</div>
					</div>
					<v-chart :option="dimOption" autoresize style="height: 260px" />
				</div>
			</div>
		</div>
	</el-scrollbar>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-home' });

import { ref, computed, onMounted, h } from 'vue';
import { useCool } from '/@/cool';

const { service } = useCool();

// 问候语
const now = new Date();
const hour = now.getHours();
const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
const todayLabel = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
const userName = ref('老师');

// 汇总数据
const summary = ref({
	monthCount: 0, yearCount: 0, studentCount: 0, teacherCount: 0,
	todayEarning: 0, weekEarning: 0, monthEarning: 0, yearEarning: 0,
});

// SVG 图标组件
const IconCalendar = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }), h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })]) };
const IconUsers = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), h('circle', { cx: 9, cy: 7, r: 4 }), h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })]) };
const IconStar = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('polygon', { points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' })]) };
const IconBook = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }), h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })]) };
const IconSun = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 12, r: 5 }), h('line', { x1: 12, y1: 1, x2: 12, y2: 3 }), h('line', { x1: 12, y1: 21, x2: 12, y2: 23 }), h('line', { x1: 4.22, y1: 4.22, x2: 5.64, y2: 5.64 }), h('line', { x1: 18.36, y1: 18.36, x2: 19.78, y2: 19.78 }), h('line', { x1: 1, y1: 12, x2: 3, y2: 12 }), h('line', { x1: 21, y1: 12, x2: 23, y2: 12 }), h('line', { x1: 4.22, y1: 19.78, x2: 5.64, y2: 18.36 }), h('line', { x1: 18.36, y1: 5.64, x2: 19.78, y2: 4.22 })]) };
const IconTrendUp = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }), h('polyline', { points: '17 6 23 6 23 12' })]) };
const IconAward = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('circle', { cx: 12, cy: 8, r: 6 }), h('path', { d: 'M15.477 12.89L17 22l-5-3-5 3 1.523-9.11' })]) };

// 课时费卡片
const earningCards = [
	{ key: 'todayEarning', label: '今日收入', icon: IconSun, iconBg: 'rgba(201,168,76,0.12)' },
	{ key: 'weekEarning', label: '本周收入', icon: IconTrendUp, iconBg: 'rgba(226,192,122,0.12)' },
	{ key: 'monthEarning', label: '本月收入', icon: IconCalendar, iconBg: 'rgba(201,168,76,0.15)' },
	{ key: 'yearEarning', label: '本年收入', icon: IconAward, iconBg: 'rgba(139,105,20,0.15)' },
];

// 统计卡片
const statCards = [
	{ key: 'monthCount', label: '本月已上课', unit: '节', icon: IconCalendar, iconBg: 'rgba(201,168,76,0.15)' },
	{ key: 'yearCount', label: '本年已上课', unit: '节', icon: IconBook, iconBg: 'rgba(226,192,122,0.15)' },
	{ key: 'studentCount', label: '学员总数', unit: '人', icon: IconUsers, iconBg: 'rgba(76,175,125,0.15)' },
	{ key: 'teacherCount', label: '教师总数', unit: '人', icon: IconStar, iconBg: 'rgba(139,105,20,0.15)' },
];

// 月度趋势
const selectedYear = ref(String(now.getFullYear()));
const monthlyData = ref<{ month: string; count: number }[]>([]);

// 维度图
const dimTab = ref<'teacher' | 'student'>('teacher');
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
const dimData = ref<{ name: string; count: number }[]>([]);

// 金色渐变色系
const GOLD = '#C9A84C';
const GOLD_LIGHT = '#E2C07A';
const GOLD_DARK = '#8B6914';

const chartTextColor = '#A89F8C';
const chartGridColor = 'rgba(201,168,76,0.08)';

const monthlyOption = computed(() => ({
	tooltip: {
		trigger: 'axis',
		backgroundColor: 'rgba(26,26,31,0.9)',
		borderColor: 'rgba(201,168,76,0.3)',
		borderWidth: 1,
		textStyle: { color: '#F0EDE6', fontSize: 12 },
		formatter: (p: any[]) => `${p[0].name}月<br/><b style="color:${GOLD}">${p[0].value}</b> 节`,
	},
	grid: { left: 36, right: 16, top: 16, bottom: 28 },
	xAxis: {
		type: 'category',
		data: monthlyData.value.map(d => `${parseInt(d.month)}月`),
		axisLine: { lineStyle: { color: 'rgba(201,168,76,0.2)' } },
		axisTick: { show: false },
		axisLabel: { color: chartTextColor, fontSize: 11 },
	},
	yAxis: {
		type: 'value',
		minInterval: 1,
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { color: chartTextColor, fontSize: 11 },
		splitLine: { lineStyle: { color: chartGridColor, type: 'dashed' } },
	},
	series: [{
		type: 'bar',
		data: monthlyData.value.map(d => d.count),
		itemStyle: {
			color: {
				type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
				colorStops: [{ offset: 0, color: GOLD_LIGHT }, { offset: 1, color: GOLD_DARK }],
			},
			borderRadius: [6, 6, 0, 0],
		},
		emphasis: { itemStyle: { color: GOLD } },
		label: { show: true, position: 'top', fontSize: 10, color: chartTextColor },
		barMaxWidth: 36,
	}],
}));

const dimOption = computed(() => ({
	tooltip: {
		trigger: 'axis',
		backgroundColor: 'rgba(26,26,31,0.9)',
		borderColor: 'rgba(201,168,76,0.3)',
		borderWidth: 1,
		textStyle: { color: '#F0EDE6', fontSize: 12 },
	},
	grid: { left: 36, right: 16, top: 16, bottom: dimData.value.length > 5 ? 56 : 32 },
	xAxis: {
		type: 'category',
		data: dimData.value.map(d => d.name),
		axisLabel: { rotate: dimData.value.length > 5 ? 30 : 0, fontSize: 11, color: chartTextColor },
		axisLine: { lineStyle: { color: 'rgba(201,168,76,0.2)' } },
		axisTick: { show: false },
	},
	yAxis: {
		type: 'value',
		minInterval: 1,
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { color: chartTextColor, fontSize: 11 },
		splitLine: { lineStyle: { color: chartGridColor, type: 'dashed' } },
	},
	series: [{
		type: 'bar',
		data: dimData.value.map(d => d.count),
		itemStyle: {
			color: {
				type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
				colorStops: dimTab.value === 'teacher'
					? [{ offset: 0, color: '#E2C07A' }, { offset: 1, color: '#8B6914' }]
					: [{ offset: 0, color: '#6ECFA0' }, { offset: 1, color: '#2E8B57' }],
			},
			borderRadius: [6, 6, 0, 0],
		},
		barMaxWidth: 36,
		label: { show: true, position: 'top', fontSize: 10, color: chartTextColor },
	}],
}));

function formatAmount(val: number) {
	if (!val) return '0.00';
	return Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 星星随机样式
function starStyle(i: number) {
	const seed = i * 137.508;
	const x = (seed * 0.618) % 100;
	const y = (seed * 0.382) % 100;
	const size = (i % 3 === 0) ? 2 : (i % 3 === 1) ? 1.5 : 1;
	const delay = (i * 0.3) % 4;
	const dur = 2 + (i % 3);
	return {
		left: `${x}%`, top: `${y}%`,
		width: `${size}px`, height: `${size}px`,
		animationDelay: `${delay}s`, animationDuration: `${dur}s`,
	};
}

async function loadSummary() {
	const data = await service.music.stat.request({ url: '/summary', method: 'GET' });
	if (data) summary.value = data;
}

async function loadMonthly() {
	const data = await service.music.stat.request({
		url: '/lessonsByMonth', method: 'GET',
		params: { year: selectedYear.value },
	});
	monthlyData.value = data || [];
}

async function loadDim() {
	const [year, month] = (selectedMonth.value || '').split('-');
	const url = dimTab.value === 'teacher' ? '/lessonsByTeacher' : '/lessonsByStudent';
	const data = await service.music.stat.request({ url, method: 'GET', params: { year, month } });
	dimData.value = (data || []).map((d: any) => ({
		name: d.teacherName || d.studentName,
		count: d.count,
	}));
}

onMounted(() => {
	loadSummary();
	loadMonthly();
	loadDim();
});
</script>

<style scoped>
/* ── 滚动容器 ── */
.music-home-scroll {
	height: 100%;
}

.music-home {
	position: relative;
	min-height: 100%;
	padding: 24px;
	background: linear-gradient(135deg, #0e0d14 0%, #16141f 40%, #1a1510 100%);
	overflow: hidden;
}

/* ── 星空背景 ── */
.stars-bg {
	position: absolute;
	inset: 0;
	pointer-events: none;
	z-index: 0;
}

.star {
	position: absolute;
	border-radius: 50%;
	background: #C9A84C;
	opacity: 0.4;
	animation: twinkle ease-in-out infinite;
}

@keyframes twinkle {
	0%, 100% { opacity: 0.15; transform: scale(1); }
	50% { opacity: 0.7; transform: scale(1.4); }
}

/* ── 内容层 ── */
.music-home > *:not(.stars-bg) {
	position: relative;
	z-index: 1;
}

/* ── 顶部问候 ── */
.home-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	margin-bottom: 28px;
}

.greeting {
	font-size: 24px;
	font-weight: 700;
	color: #F0EDE6;
	margin: 0 0 6px;
	letter-spacing: -0.3px;
}

.gold-text {
	color: #C9A84C;
	text-shadow: 0 0 20px rgba(201, 168, 76, 0.4);
}

.date-text {
	font-size: 13px;
	color: #A89F8C;
	margin: 0;
}

.live-badge {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	background: rgba(201, 168, 76, 0.1);
	border: 1px solid rgba(201, 168, 76, 0.25);
	border-radius: 20px;
	font-size: 12px;
	color: #C9A84C;
	backdrop-filter: blur(8px);
}

.live-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: #C9A84C;
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(201, 168, 76, 0.4); }
	50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(201, 168, 76, 0); }
}

/* ── 区块标题 ── */
.section-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
	font-weight: 600;
	color: #A89F8C;
	text-transform: uppercase;
	letter-spacing: 0.8px;
	margin-bottom: 12px;
}

.section-title svg {
	color: #C9A84C;
}

/* ── 玻璃卡片基础 ── */
.glass-card {
	background: rgba(255, 255, 255, 0.04);
	backdrop-filter: blur(16px) saturate(1.4);
	-webkit-backdrop-filter: blur(16px) saturate(1.4);
	border: 1px solid rgba(201, 168, 76, 0.15);
	border-radius: 16px;
	transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.glass-card:hover {
	border-color: rgba(201, 168, 76, 0.35);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(201, 168, 76, 0.1);
	transform: translateY(-2px);
}

/* ── 课时费收入卡片 ── */
.earning-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 12px;
	margin-bottom: 28px;
}

.earning-card {
	position: relative;
	padding: 20px;
	overflow: hidden;
	cursor: default;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.earning-card--active {
	border-color: rgba(201, 168, 76, 0.4);
	background: rgba(201, 168, 76, 0.06);
}

.earning-icon-wrap {
	width: 40px;
	height: 40px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border: 1px solid rgba(201, 168, 76, 0.15);
}

.earning-svg-icon {
	width: 20px;
	height: 20px;
	color: #C9A84C;
}

.earning-label {
	font-size: 12px;
	color: #A89F8C;
	font-weight: 500;
}

.earning-amount {
	display: flex;
	align-items: baseline;
	gap: 2px;
}

.currency {
	font-size: 16px;
	font-weight: 600;
	color: #C9A84C;
	line-height: 1;
}

.amount-num {
	font-size: 26px;
	font-weight: 700;
	color: #F0EDE6;
	line-height: 1;
	letter-spacing: -0.5px;
}

.card-glow {
	position: absolute;
	bottom: -20px;
	left: 50%;
	transform: translateX(-50%);
	width: 60%;
	height: 40px;
	background: radial-gradient(ellipse, rgba(201, 168, 76, 0.15) 0%, transparent 70%);
	pointer-events: none;
}

/* ── 统计卡片 ── */
.stat-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 12px;
	margin-bottom: 28px;
}

.stat-card {
	position: relative;
	padding: 20px;
	display: flex;
	align-items: center;
	gap: 16px;
	overflow: hidden;
}

.stat-icon-wrap {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	border: 1px solid rgba(201, 168, 76, 0.15);
}

.stat-icon {
	width: 20px;
	height: 20px;
	color: #C9A84C;
}

.stat-info {
	flex: 1;
	min-width: 0;
}

.stat-num {
	font-size: 28px;
	font-weight: 700;
	color: #F0EDE6;
	line-height: 1.1;
	letter-spacing: -0.5px;
}

.stat-unit {
	font-size: 13px;
	font-weight: 400;
	color: #A89F8C;
	margin-left: 3px;
}

.stat-label {
	font-size: 12px;
	color: #A89F8C;
	margin-top: 4px;
}

/* 太空轨道装饰 */
.stat-orbit {
	position: absolute;
	right: -20px;
	top: 50%;
	transform: translateY(-50%);
	width: 80px;
	height: 80px;
	border-radius: 50%;
	border: 1px solid rgba(201, 168, 76, 0.06);
	pointer-events: none;
}

.stat-orbit::after {
	content: '';
	position: absolute;
	top: 10px;
	left: 10px;
	right: 10px;
	bottom: 10px;
	border-radius: 50%;
	border: 1px solid rgba(201, 168, 76, 0.04);
}

/* ── 图表区 ── */
.charts-row {
	display: grid;
	grid-template-columns: 1.6fr 1fr;
	gap: 12px;
}

.chart-card {
	padding: 20px;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
	flex-wrap: wrap;
	gap: 8px;
}

.card-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	font-weight: 600;
	color: #F0EDE6;
}

.card-title svg {
	color: #C9A84C;
}

.dim-controls {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
}

/* Element Plus 组件在暗色背景下的适配 */
:deep(.el-date-editor) {
	--el-input-bg-color: rgba(255, 255, 255, 0.06);
	--el-input-border-color: rgba(201, 168, 76, 0.2);
	--el-input-text-color: #F0EDE6;
	--el-input-placeholder-color: #A89F8C;
	border-radius: 8px;
}

:deep(.el-radio-button__inner) {
	background: rgba(255, 255, 255, 0.05);
	border-color: rgba(201, 168, 76, 0.2);
	color: #A89F8C;
	font-size: 12px;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
	background: rgba(201, 168, 76, 0.2);
	border-color: rgba(201, 168, 76, 0.5);
	color: #C9A84C;
	box-shadow: none;
}

/* ── 响应式 ── */
@media (max-width: 1200px) {
	.earning-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	.stat-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	.charts-row {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 640px) {
	.music-home {
		padding: 16px;
	}
	.earning-grid,
	.stat-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	.greeting {
		font-size: 20px;
	}
	.amount-num {
		font-size: 22px;
	}
}
</style>
