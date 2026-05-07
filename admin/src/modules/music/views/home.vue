<template>
	<el-scrollbar>
		<div class="music-home">
			<!-- 统计卡片 -->
			<el-row :gutter="12" class="stat-row">
				<el-col :lg="6" :md="12" :xs="24">
					<el-card class="stat-card">
						<div class="stat-label">本月已上课</div>
						<div class="stat-num">{{ summary.monthCount }}<span class="stat-unit">节</span></div>
					</el-card>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<el-card class="stat-card">
						<div class="stat-label">本年已上课</div>
						<div class="stat-num">{{ summary.yearCount }}<span class="stat-unit">节</span></div>
					</el-card>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<el-card class="stat-card">
						<div class="stat-label">学员总数</div>
						<div class="stat-num">{{ summary.studentCount }}<span class="stat-unit">人</span></div>
					</el-card>
				</el-col>
				<el-col :lg="6" :md="12" :xs="24">
					<el-card class="stat-card">
						<div class="stat-label">教师总数</div>
						<div class="stat-num">{{ summary.teacherCount }}<span class="stat-unit">人</span></div>
					</el-card>
				</el-col>
			</el-row>

			<!-- 月度趋势图 -->
			<el-card class="chart-card">
				<template #header>
					<div class="card-header">
						<span>月度上课趋势</span>
						<el-date-picker
							v-model="selectedYear"
							type="year"
							value-format="YYYY"
							placeholder="选择年份"
							style="width: 120px"
							@change="loadMonthly"
						/>
					</div>
				</template>
				<v-chart :option="monthlyOption" autoresize style="height: 280px" />
			</el-card>

			<!-- 教师/学生维度图 -->
			<el-card class="chart-card">
				<template #header>
					<div class="card-header">
						<el-radio-group v-model="dimTab" @change="loadDim">
							<el-radio-button label="teacher">按教师</el-radio-button>
							<el-radio-button label="student">按学生</el-radio-button>
						</el-radio-group>
						<el-date-picker
							v-model="selectedMonth"
							type="month"
							value-format="YYYY-MM"
							placeholder="选择月份"
							style="width: 140px"
							@change="loadDim"
						/>
					</div>
				</template>
				<v-chart :option="dimOption" autoresize style="height: 280px" />
			</el-card>
		</div>
	</el-scrollbar>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-home' });

import { ref, computed, onMounted } from 'vue';
import { useCool } from '/@/cool';

const { service } = useCool();

// 汇总数据
const summary = ref({ monthCount: 0, yearCount: 0, studentCount: 0, teacherCount: 0 });

// 月度趋势
const selectedYear = ref(String(new Date().getFullYear()));
const monthlyData = ref<{ month: string; count: number }[]>([]);

// 维度图
const dimTab = ref<'teacher' | 'student'>('teacher');
const now = new Date();
const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
const dimData = ref<{ name: string; count: number }[]>([]);

// 月度柱状图配置
const monthlyOption = computed(() => ({
	tooltip: { trigger: 'axis' },
	grid: { left: 40, right: 20, top: 20, bottom: 30 },
	xAxis: {
		type: 'category',
		data: monthlyData.value.map(d => `${d.month}月`),
		axisLine: { lineStyle: { color: '#ddd' } },
	},
	yAxis: {
		type: 'value',
		minInterval: 1,
		axisLine: { show: false },
		splitLine: { lineStyle: { color: '#f0f0f0' } },
	},
	series: [{
		type: 'bar',
		data: monthlyData.value.map(d => d.count),
		itemStyle: { color: '#409eff', borderRadius: [4, 4, 0, 0] },
		label: { show: true, position: 'top', fontSize: 11 },
	}],
}));

// 维度柱状图配置
const dimOption = computed(() => ({
	tooltip: { trigger: 'axis' },
	grid: { left: 40, right: 20, top: 20, bottom: 60 },
	xAxis: {
		type: 'category',
		data: dimData.value.map(d => d.name),
		axisLabel: { rotate: dimData.value.length > 6 ? 30 : 0, fontSize: 12 },
		axisLine: { lineStyle: { color: '#ddd' } },
	},
	yAxis: {
		type: 'value',
		minInterval: 1,
		axisLine: { show: false },
		splitLine: { lineStyle: { color: '#f0f0f0' } },
	},
	series: [{
		type: 'bar',
		data: dimData.value.map(d => d.count),
		itemStyle: { color: dimTab.value === 'teacher' ? '#67c23a' : '#e6a23c', borderRadius: [4, 4, 0, 0] },
		label: { show: true, position: 'top', fontSize: 11 },
	}],
}));

async function loadSummary() {
	const data = await service.music.stat.request({ url: '/summary', method: 'GET' });
	if (data) summary.value = data;
}

async function loadMonthly() {
	const data = await service.music.stat.request({
		url: '/lessonsByMonth',
		method: 'GET',
		params: { year: selectedYear.value },
	});
	monthlyData.value = data || [];
}

async function loadDim() {
	const [year, month] = (selectedMonth.value || '').split('-');
	const url = dimTab.value === 'teacher' ? '/lessonsByTeacher' : '/lessonsByStudent';
	const data = await service.music.stat.request({
		url,
		method: 'GET',
		params: { year, month },
	});
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
.music-home {
	padding: 16px;
}

.stat-row {
	margin-bottom: 12px;
}

.stat-card {
	margin-bottom: 12px;
	text-align: center;
}

.stat-label {
	font-size: 13px;
	color: #909399;
	margin-bottom: 8px;
}

.stat-num {
	font-size: 32px;
	font-weight: 700;
	color: #303133;
}

.stat-unit {
	font-size: 14px;
	font-weight: normal;
	color: #909399;
	margin-left: 4px;
}

.chart-card {
	margin-bottom: 12px;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-weight: 600;
}
</style>
