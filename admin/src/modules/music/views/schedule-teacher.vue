<template>
	<div class="schedule-teacher">
		<!-- 工具栏 -->
		<div class="toolbar">
			<el-select
				v-model="selectedTeacher"
				placeholder="请选择教师"
				filterable
				clearable
				style="width: 200px"
				@change="loadSchedules"
			>
				<el-option v-for="t in teacherList" :key="t.value" :label="t.label" :value="t.value" />
			</el-select>

			<div class="week-nav">
				<el-button :icon="ArrowLeft" circle @click="changeWeek(-1)" />
				<span class="week-label">{{ weekLabel }}</span>
				<el-button :icon="ArrowRight" circle @click="changeWeek(1)" />
				<el-button @click="goThisWeek">本周</el-button>
			</div>
		</div>

		<!-- 周视图 -->
		<div class="week-wrap">
			<table class="week-table">
				<thead>
					<tr>
						<th class="time-col">时间</th>
						<th v-for="(d, i) in weekDates" :key="i" :class="{ today: d.isToday }">
							<div>{{ weekDayNames[i] }}</div>
							<div class="date-sub">{{ d.label }}</div>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="slot in timeSlots" :key="slot">
						<td class="time-col">{{ slot }}</td>
						<td
							v-for="(d, di) in weekDates"
							:key="di"
							class="slot-cell"
						>
							<template v-for="lesson in getLessons(d.date, slot)" :key="lesson.id">
								<el-popover placement="top" :width="220" trigger="hover">
									<template #reference>
										<div :class="['lesson-block', colorClass(lesson.studentId)]">
											<div class="lesson-student">{{ lesson.studentName || '学员' }}</div>
											<div class="lesson-course">{{ lesson.courseName }}</div>
											<div class="lesson-time">{{ lesson.startTime }}~{{ lesson.endTime }}</div>
										</div>
									</template>
									<div>
										<p><b>学员：</b>{{ lesson.studentName || lesson.studentId }}</p>
										<p><b>课程：</b>{{ lesson.courseName }}</p>
										<p><b>教室：</b>{{ lesson.room || '未指定' }}</p>
										<p><b>时间：</b>{{ lesson.startTime }}~{{ lesson.endTime }}</p>
										<p><b>状态：</b>{{ statusLabel(lesson.status) }}</p>
									</div>
								</el-popover>
							</template>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-schedule-teacher' });

import { ref, computed, onMounted } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { useCool } from '/@/cool';

const { service } = useCool();

const selectedTeacher = ref('');
const teacherList = ref<any[]>([]);
const schedules = ref<any[]>([]);
const studentMap = ref<Record<number, string>>({});

// 当前周的周一日期
const weekMonday = ref(getMonday(new Date()));

const weekDayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

// 时间段：08:00 ~ 21:30，每30分钟
const timeSlots = computed(() => {
	const slots: string[] = [];
	for (let h = 8; h <= 21; h++) {
		slots.push(`${pad(h)}:00`);
		if (h < 21) slots.push(`${pad(h)}:30`);
	}
	slots.push('21:30');
	return slots;
});

const weekDates = computed(() => {
	const monday = weekMonday.value;
	const today = new Date();
	const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
	return Array.from({ length: 7 }, (_, i) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + i);
		const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		return {
			date: dateStr,
			label: `${d.getMonth() + 1}/${d.getDate()}`,
			isToday: dateStr === todayStr,
		};
	});
});

const weekLabel = computed(() => {
	const first = weekDates.value[0];
	const last = weekDates.value[6];
	return `${first.label} ~ ${last.label}`;
});

function getMonday(d: Date) {
	const day = d.getDay(); // 0=周日
	const diff = day === 0 ? -6 : 1 - day;
	const monday = new Date(d);
	monday.setDate(d.getDate() + diff);
	monday.setHours(0, 0, 0, 0);
	return monday;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

function changeWeek(delta: number) {
	const d = new Date(weekMonday.value);
	d.setDate(d.getDate() + delta * 7);
	weekMonday.value = d;
	loadSchedules();
}

function goThisWeek() {
	weekMonday.value = getMonday(new Date());
	loadSchedules();
}

async function loadSchedules() {
	if (!selectedTeacher.value) { schedules.value = []; return; }
	const weekStart = `${weekMonday.value.getFullYear()}-${pad(weekMonday.value.getMonth() + 1)}-${pad(weekMonday.value.getDate())}`;
	const data = await service.music.schedule.request({
		url: '/byTeacher',
		method: 'GET',
		params: { teacherName: selectedTeacher.value, weekStart }
	});
	schedules.value = data || [];
}

// 获取某天某时间段的课程（startTime <= slot < endTime）
function getLessons(date: string, slot: string) {
	return schedules.value.filter(s => {
		if (s.scheduleDate !== date) return false;
		if (s.status === 4) return false; // 已取消不显示
		return s.startTime === slot;
	}).map(s => ({
		...s,
		studentName: studentMap.value[s.studentId] || '',
	}));
}

// 根据 studentId 分配颜色
const colorPalette = ['color-a', 'color-b', 'color-c', 'color-d', 'color-e', 'color-f'];
const studentColorMap = ref<Record<number, string>>({});
let colorIdx = 0;

function colorClass(studentId: number) {
	if (!studentColorMap.value[studentId]) {
		studentColorMap.value[studentId] = colorPalette[colorIdx % colorPalette.length];
		colorIdx++;
	}
	return studentColorMap.value[studentId];
}

function statusLabel(status: number) {
	return { 0: '待上课', 1: '已上课', 2: '已请假', 3: '待补课', 4: '已取消' }[status] ?? '未知';
}

onMounted(async () => {
	const [teachers, students] = await Promise.all([
		service.music.course.teacherUsers(),
		service.music.student.studentUsers(),
	]);
	teacherList.value = (teachers || []).map((t: any) => ({ label: t.label, value: t.name }));
	const map: Record<number, string> = {};
	(students || []).forEach((s: any) => { map[s.id] = s.label; });
	studentMap.value = map;
});
</script>

<style scoped>
.schedule-teacher {
	padding: 16px;
}

.toolbar {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
	flex-wrap: wrap;
}

.week-nav {
	display: flex;
	align-items: center;
	gap: 8px;
}

.week-label {
	font-size: 15px;
	font-weight: 600;
	min-width: 140px;
	text-align: center;
}

.week-wrap {
	overflow-x: auto;
}

.week-table {
	width: 100%;
	border-collapse: collapse;
	min-width: 700px;
}

.week-table th,
.week-table td {
	border: 1px solid #ebeef5;
	padding: 4px;
	vertical-align: top;
}

.week-table th {
	text-align: center;
	background: #f5f7fa;
	font-size: 13px;
	color: #606266;
}

.week-table th.today {
	background: #ecf5ff;
	color: #409eff;
}

.date-sub {
	font-size: 12px;
	color: #909399;
	font-weight: normal;
}

.time-col {
	width: 56px;
	text-align: center;
	font-size: 11px;
	color: #909399;
	white-space: nowrap;
}

.slot-cell {
	min-height: 32px;
	padding: 2px;
}

.lesson-block {
	border-radius: 4px;
	padding: 3px 5px;
	margin-bottom: 2px;
	cursor: pointer;
	font-size: 11px;
	line-height: 1.4;
}

.lesson-student { font-weight: 600; }
.lesson-course  { color: inherit; opacity: 0.85; }
.lesson-time    { opacity: 0.7; }

.color-a { background: #ecf5ff; color: #409eff; border-left: 3px solid #409eff; }
.color-b { background: #f0f9eb; color: #67c23a; border-left: 3px solid #67c23a; }
.color-c { background: #fdf6ec; color: #e6a23c; border-left: 3px solid #e6a23c; }
.color-d { background: #fef0f0; color: #f56c6c; border-left: 3px solid #f56c6c; }
.color-e { background: #f4f4f5; color: #909399; border-left: 3px solid #909399; }
.color-f { background: #f0f0ff; color: #7c4dff; border-left: 3px solid #7c4dff; }
</style>
