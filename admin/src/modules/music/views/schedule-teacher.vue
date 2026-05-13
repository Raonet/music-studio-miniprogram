<template>
	<div class="schedule-teacher">
		<!-- 工具栏 -->
		<div class="toolbar">
			<el-select
				v-if="!isTeacher"
				v-model="selectedTeacher"
				placeholder="请选择教师"
				filterable
				clearable
				style="width: 200px"
				@change="loadSchedules"
			>
				<el-option v-for="t in teacherList" :key="t.value" :label="t.label" :value="t.value" />
			</el-select>
			<span v-else class="teacher-name-label">{{ selectedTeacher }}</span>

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
const isTeacher = ref(false);
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
	try {
		const myInfo = await service.music.teacherStudent.request({ url: '/myInfo', method: 'GET' }).catch(() => null);
		isTeacher.value = myInfo?.isTeacher || false;

		const [teachers, students] = await Promise.all([
			service.music.course.teacherUsers().catch(() => []),
			service.music.student.studentUsers().catch(() => []),
		]);
		teacherList.value = (teachers || []).map((t: any) => ({ label: t.label, value: t.name }));
		const map: Record<number, string> = {};
		(students || []).forEach((s: any) => { map[s.id] = s.label; });
		studentMap.value = map;

		if (isTeacher.value) {
			selectedTeacher.value = myInfo?.teacherName || '';
			loadSchedules();
		} else if (teacherList.value.length > 0) {
			selectedTeacher.value = teacherList.value[0].value;
			loadSchedules();
		}
	} catch (e) {
		console.error('[schedule-teacher] onMounted error:', e);
	}
});
</script>

<style scoped>
.schedule-teacher {
	padding: 20px;
	min-height: 100%;
	background: linear-gradient(135deg, #0e0d14 0%, #13111a 50%, #16141f 100%);
}

.toolbar {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 16px;
	flex-wrap: wrap;
	padding: 12px 16px;
	background: rgba(255, 255, 255, 0.03);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(201, 168, 76, 0.12);
	border-radius: 12px;
}

.week-nav {
	display: flex;
	align-items: center;
	gap: 8px;
}

.teacher-name-label {
	font-size: 14px;
	font-weight: 600;
	color: #C9A84C;
}

.week-label {
	font-size: 14px;
	font-weight: 700;
	min-width: 140px;
	text-align: center;
	color: #F0EDE6;
}

/* 周视图容器 */
.week-wrap {
	overflow-x: auto;
	border-radius: 14px;
	border: 1px solid rgba(201, 168, 76, 0.15);
	background: rgba(255, 255, 255, 0.02);
	backdrop-filter: blur(16px);
}

.week-table {
	width: 100%;
	border-collapse: collapse;
	min-width: 700px;
}

.week-table th,
.week-table td {
	border: 1px solid rgba(201, 168, 76, 0.08);
	padding: 4px;
	vertical-align: top;
}

.week-table th {
	text-align: center;
	background: rgba(28, 26, 38, 0.9);
	font-size: 12px;
	font-weight: 600;
	color: #A89F8C;
	padding: 10px 4px;
	border-bottom: 1px solid rgba(201, 168, 76, 0.2);
}

.week-table th.today {
	background: rgba(201, 168, 76, 0.12);
	color: #C9A84C;
}

.date-sub {
	font-size: 11px;
	color: rgba(168, 159, 140, 0.7);
	font-weight: normal;
	margin-top: 2px;
}

.time-col {
	width: 52px;
	text-align: center;
	font-size: 10px;
	color: rgba(168, 159, 140, 0.5);
	white-space: nowrap;
	background: rgba(28, 26, 38, 0.6) !important;
}

.slot-cell {
	min-height: 28px;
	padding: 2px;
	background: transparent;
	transition: background 0.1s;
}

.slot-cell:hover {
	background: rgba(201, 168, 76, 0.03);
}

/* 课程块 */
.lesson-block {
	border-radius: 5px;
	padding: 4px 6px;
	margin-bottom: 2px;
	cursor: pointer;
	font-size: 11px;
	line-height: 1.4;
	transition: opacity 0.15s, transform 0.15s;
}

.lesson-block:hover {
	opacity: 0.85;
	transform: translateY(-1px);
}

.lesson-student { font-weight: 700; }
.lesson-course  { opacity: 0.85; }
.lesson-time    { opacity: 0.65; font-size: 10px; }

/* 学员颜色 — 暗金系 */
.color-a { background: rgba(201,168,76,0.15);  color: #C9A84C;  border-left: 2px solid #C9A84C; }
.color-b { background: rgba(76,175,125,0.15);  color: #4CAF7D;  border-left: 2px solid #4CAF7D; }
.color-c { background: rgba(226,192,122,0.15); color: #E2C07A;  border-left: 2px solid #E2C07A; }
.color-d { background: rgba(224,90,90,0.15);   color: #E05A5A;  border-left: 2px solid #E05A5A; }
.color-e { background: rgba(139,105,20,0.2);   color: #B8943A;  border-left: 2px solid #B8943A; }
.color-f { background: rgba(168,130,200,0.15); color: #A882C8;  border-left: 2px solid #A882C8; }
</style>
