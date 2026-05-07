<template>
	<div class="schedule-calendar">
		<!-- 工具栏 -->
		<div class="toolbar">
			<el-select
				v-model="selectedStudentId"
				placeholder="请选择学员"
				filterable
				clearable
				style="width: 220px"
				@change="loadSchedules"
			>
				<el-option v-for="s in studentList" :key="s.value" :label="s.label" :value="s.value" />
			</el-select>

			<el-select
				v-model="selectedStatus"
				placeholder="全部状态"
				clearable
				style="width: 130px"
				@change="loadSchedules"
			>
				<el-option label="待上课" :value="0" />
				<el-option label="已上课" :value="1" />
				<el-option label="已请假" :value="2" />
				<el-option label="待补课" :value="3" />
				<el-option label="已取消" :value="4" />
			</el-select>

			<div class="month-nav">
				<el-button :icon="ArrowLeft" circle @click="changeMonth(-1)" />
				<span class="month-label">{{ currentMonthLabel }}</span>
				<el-button :icon="ArrowRight" circle @click="changeMonth(1)" />
				<el-button @click="goToday">今天</el-button>
			</div>

			<el-button type="primary" :disabled="!selectedStudentId" @click="openBatchDialog">
				快速排课
			</el-button>
		</div>

		<!-- 日历 -->
		<div class="calendar-wrap">
			<table class="cal-table">
				<thead>
					<tr>
						<th v-for="d in weekDays" :key="d">{{ d }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(week, wi) in calendarWeeks" :key="wi">
						<td
							v-for="day in week"
							:key="day.date"
							:class="['cal-cell', { 'other-month': !day.currentMonth, 'today': day.isToday }]"
							@click="onCellClick(day)"
						>
							<div class="cell-date">{{ day.day }}</div>
							<div class="cell-lessons">
								<div
									v-for="lesson in day.lessons"
									:key="lesson.id"
									:class="['lesson-tag', statusClass(lesson.status)]"
									@click.stop="onLessonClick(lesson)"
								>
									{{ lesson.startTime }} {{ lesson.courseName }}
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<!-- 快速排课弹窗 -->
		<el-dialog v-model="batchDialogVisible" title="快速排课" width="520px" destroy-on-close>
			<el-form :model="batchForm" label-width="90px">
				<el-form-item label="选择课程">
					<el-select
						v-model="batchForm.courseId"
						placeholder="选课程后自动填入教师"
						filterable
						style="width:100%"
						@change="onBatchCourseChange"
					>
						<el-option v-for="c in courseList" :key="c.value" :label="c.label" :value="c.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="课程名称">
					<el-input v-model="batchForm.courseName" />
				</el-form-item>
				<el-form-item label="教师">
					<el-input v-model="batchForm.teacherName" />
				</el-form-item>
				<el-form-item label="教室">
					<el-input v-model="batchForm.room" placeholder="如：A101" />
				</el-form-item>
				<el-form-item label="重复星期">
					<el-checkbox-group v-model="batchForm.weekdays">
						<el-checkbox v-for="w in weekdayOptions" :key="w.value" :label="w.value">{{ w.label }}</el-checkbox>
					</el-checkbox-group>
				</el-form-item>
				<el-form-item label="开始时间">
					<el-time-select
						v-model="batchForm.startTime"
						start="08:00" step="00:30" end="22:00"
						placeholder="开始时间"
						style="width:100%"
						@change="calcBatchEndTime"
					/>
				</el-form-item>
				<el-form-item label="结束时间">
					<el-input :value="batchForm.endTime" disabled placeholder="根据课程时长自动计算" />
				</el-form-item>
				<el-form-item label="日期范围">
					<el-date-picker
						v-model="batchForm.dateRange"
						type="daterange"
						value-format="YYYY-MM-DD"
						range-separator="至"
						start-placeholder="开始日期"
						end-placeholder="结束日期"
						style="width:100%"
					/>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="batchDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="batchLoading" @click="submitBatch">确认排课</el-button>
			</template>
		</el-dialog>

		<!-- 单节课新增/编辑弹窗 -->
		<el-dialog v-model="addDialogVisible" :title="addForm.id ? '编辑排课' : '新增排课'" width="480px" destroy-on-close>
			<el-form :model="addForm" label-width="90px">
				<el-form-item label="上课日期">
					<el-date-picker
						v-model="addForm.scheduleDate"
						type="date"
						value-format="YYYY-MM-DD"
						style="width:100%"
					/>
				</el-form-item>
				<el-form-item label="选择课程">
					<el-select
						v-model="addForm.courseId"
						placeholder="选课程后自动填入教师"
						filterable
						style="width:100%"
						@change="onAddCourseChange"
					>
						<el-option v-for="c in courseList" :key="c.value" :label="c.label" :value="c.value" />
					</el-select>
				</el-form-item>
				<el-form-item label="课程名称">
					<el-input v-model="addForm.courseName" />
				</el-form-item>
				<el-form-item label="教师">
					<el-input v-model="addForm.teacherName" />
				</el-form-item>
				<el-form-item label="教室">
					<el-input v-model="addForm.room" placeholder="如：A101" />
				</el-form-item>
				<el-form-item label="开始时间">
					<el-time-select
						v-model="addForm.startTime"
						start="08:00" step="00:30" end="22:00"
						placeholder="开始时间"
						style="width:100%"
						@change="calcAddEndTime"
					/>
				</el-form-item>
				<el-form-item label="结束时间">
					<el-input :value="addForm.endTime" disabled placeholder="根据课程时长自动计算" />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="addDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="addLoading" @click="submitAdd">确认</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-schedule-calendar' });

import { ref, computed, onMounted } from 'vue';
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';

const { service } = useCool();

// 状态
const selectedStudentId = ref<number | null>(null);
const selectedStatus = ref<number | null>(null);
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const schedules = ref<any[]>([]);
const allSchedules = ref<any[]>([]);
const isTeacher = ref(false);
const studentList = ref<any[]>([]);
const courseList = ref<any[]>([]);
const courseMap = ref<Record<number, any>>({});

const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const weekdayOptions = [
	{ label: '周日', value: 0 },
	{ label: '周一', value: 1 },
	{ label: '周二', value: 2 },
	{ label: '周三', value: 3 },
	{ label: '周四', value: 4 },
	{ label: '周五', value: 5 },
	{ label: '周六', value: 6 },
];

const currentMonthLabel = computed(() => `${currentYear.value} 年 ${currentMonth.value} 月`);

// 日历格子数据
const calendarWeeks = computed(() => {
	const year = currentYear.value;
	const month = currentMonth.value;
	const firstDay = new Date(year, month - 1, 1).getDay(); // 0=周日
	const daysInMonth = new Date(year, month, 0).getDate();
	const today = new Date();
	const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

	// 按日期建索引
	const lessonMap: Record<string, any[]> = {};
	schedules.value.forEach(s => {
		if (!lessonMap[s.scheduleDate]) lessonMap[s.scheduleDate] = [];
		lessonMap[s.scheduleDate].push(s);
	});

	const cells: any[] = [];
	// 补前面空格（上月末尾）
	const prevDays = new Date(year, month - 1, 0).getDate();
	for (let i = firstDay - 1; i >= 0; i--) {
		const d = prevDays - i;
		const m = month - 1 === 0 ? 12 : month - 1;
		const y = month - 1 === 0 ? year - 1 : year;
		const dateStr = `${y}-${pad(m)}-${pad(d)}`;
		cells.push({ date: dateStr, day: d, currentMonth: false, isToday: false, lessons: lessonMap[dateStr] || [] });
	}
	// 本月
	for (let d = 1; d <= daysInMonth; d++) {
		const dateStr = `${year}-${pad(month)}-${pad(d)}`;
		cells.push({ date: dateStr, day: d, currentMonth: true, isToday: dateStr === todayStr, lessons: lessonMap[dateStr] || [] });
	}
	// 补后面空格（下月开头）
	const remaining = 42 - cells.length;
	for (let d = 1; d <= remaining; d++) {
		const m = month + 1 === 13 ? 1 : month + 1;
		const y = month + 1 === 13 ? year + 1 : year;
		const dateStr = `${y}-${pad(m)}-${pad(d)}`;
		cells.push({ date: dateStr, day: d, currentMonth: false, isToday: false, lessons: lessonMap[dateStr] || [] });
	}

	// 分成 6 行
	const weeks: any[][] = [];
	for (let i = 0; i < cells.length; i += 7) {
		weeks.push(cells.slice(i, i + 7));
	}
	return weeks;
});

function pad(n: number) { return String(n).padStart(2, '0'); }

function statusClass(status: number) {
	return { 0: 'status-pending', 1: 'status-done', 2: 'status-leave', 3: 'status-makeup', 4: 'status-cancel' }[status] || '';
}

async function loadSchedules() {
	if (!selectedStudentId.value) { schedules.value = []; allSchedules.value = []; return; }
	const month = `${currentYear.value}-${pad(currentMonth.value)}`;
	const data = await service.music.schedule.request({
		url: '/byStudent',
		method: 'GET',
		params: { studentId: selectedStudentId.value, month }
	});
	allSchedules.value = data || [];
	applyStatusFilter();
}

function applyStatusFilter() {
	if (selectedStatus.value === null || selectedStatus.value === undefined) {
		schedules.value = allSchedules.value;
	} else {
		schedules.value = allSchedules.value.filter(s => s.status === selectedStatus.value);
	}
}

function changeMonth(delta: number) {
	let m = currentMonth.value + delta;
	let y = currentYear.value;
	if (m > 12) { m = 1; y++; }
	if (m < 1) { m = 12; y--; }
	currentMonth.value = m;
	currentYear.value = y;
	loadSchedules();
}

function goToday() {
	const now = new Date();
	currentYear.value = now.getFullYear();
	currentMonth.value = now.getMonth() + 1;
	loadSchedules();
}

// 点击空白格 → 新增
function onCellClick(day: any) {
	if (!selectedStudentId.value) {
		ElMessage.warning('请先选择学员');
		return;
	}
	addForm.value = { id: null, scheduleDate: day.date, courseId: null, courseName: '', teacherName: '', teacherAvatar: '', room: '', startTime: '', endTime: '', duration: 60 };
	addDialogVisible.value = true;
}

// 点击课程 → 取消
async function onLessonClick(lesson: any) {
	if (lesson.status === 4) return;
	try {
		await ElMessageBox.confirm(
			`[${lesson.scheduleDate} ${lesson.startTime} ${lesson.courseName}]`,
			'操作排课',
			{
				distinguishCancelAndClose: true,
				confirmButtonText: '编辑',
				cancelButtonText: '取消排课',
				type: 'info',
			}
		);
		// 点「编辑」
		addForm.value = {
			id: lesson.id,
			scheduleDate: lesson.scheduleDate,
			courseId: null,
			courseName: lesson.courseName,
			teacherName: lesson.teacherName,
			teacherAvatar: lesson.teacherAvatar,
			room: lesson.room,
			startTime: lesson.startTime,
			endTime: lesson.endTime,
			duration: lesson.duration || 60,
		};
		addDialogVisible.value = true;
	} catch (action) {
		// 点「取消排课」（action === 'cancel'），关闭弹窗（action === 'close'）不处理
		if (action === 'cancel') {
			await ElMessageBox.confirm('确认取消该节课？', '提示', { type: 'warning', confirmButtonText: '确认', cancelButtonText: '返回' });
			await service.music.schedule.update({ id: lesson.id, status: 4 });
			ElMessage.success('已取消');
			loadSchedules();
		}
	}
}

// 批量排课
const batchDialogVisible = ref(false);
const batchLoading = ref(false);
const batchForm = ref<any>({
	courseId: null, courseName: '', teacherName: '', teacherAvatar: '',
	room: '', weekdays: [], startTime: '', endTime: '', dateRange: [], duration: 60
});

function openBatchDialog() {
	batchForm.value = { courseId: null, courseName: '', teacherName: '', teacherAvatar: '', room: '', weekdays: [], startTime: '', endTime: '', dateRange: [], duration: 60 };
	batchDialogVisible.value = true;
}

function calcEndTime(startTime: string, duration: number): string {
	if (!startTime || !duration) return '';
	const [h, m] = startTime.split(':').map(Number);
	const totalMin = h * 60 + m + duration;
	const eh = Math.floor(totalMin / 60);
	const em = totalMin % 60;
	return `${pad(eh)}:${pad(em)}`;
}

function onBatchCourseChange(val: number) {
	const c = courseMap.value[val];
	if (c) {
		batchForm.value.courseName = c.name;
		batchForm.value.teacherName = c.teacherName || '';
		batchForm.value.teacherAvatar = c.teacherAvatar || '';
		batchForm.value.duration = c.duration || 60;
		if (batchForm.value.startTime) calcBatchEndTime(batchForm.value.startTime);
	}
}

function calcBatchEndTime(startTime: string) {
	batchForm.value.endTime = calcEndTime(startTime, batchForm.value.duration || 60);
}

async function submitBatch() {
	const f = batchForm.value;
	if (!f.courseName) return ElMessage.warning('请选择或填写课程名称');
	if (!f.weekdays.length) return ElMessage.warning('请选择重复星期');
	if (!f.startTime || !f.endTime) return ElMessage.warning('请选择上课时间');
	if (!f.dateRange || f.dateRange.length < 2) return ElMessage.warning('请选择日期范围');
	batchLoading.value = true;
	try {
		const res = await service.music.schedule.request({
			url: '/batchCreate',
			method: 'POST',
			data: {
				studentId: selectedStudentId.value,
				courseName: f.courseName,
				teacherName: f.teacherName,
				teacherAvatar: f.teacherAvatar,
				room: f.room,
				weekdays: f.weekdays,
				startTime: f.startTime,
				endTime: f.endTime,
				dateFrom: f.dateRange[0],
				dateTo: f.dateRange[1],
			}
		});
		ElMessage.success(`排课成功，共创建 ${res?.created ?? 0} 节课`);
		batchDialogVisible.value = false;
		loadSchedules();
	} finally {
		batchLoading.value = false;
	}
}

// 单节新增
const addDialogVisible = ref(false);
const addLoading = ref(false);
const addForm = ref<any>({ id: null, scheduleDate: '', courseId: null, courseName: '', teacherName: '', teacherAvatar: '', room: '', startTime: '', endTime: '', duration: 60 });

function onAddCourseChange(val: number) {
	const c = courseMap.value[val];
	if (c) {
		addForm.value.courseName = c.name;
		addForm.value.teacherName = c.teacherName || '';
		addForm.value.teacherAvatar = c.teacherAvatar || '';
		addForm.value.duration = c.duration || 60;
		if (addForm.value.startTime) calcAddEndTime(addForm.value.startTime);
	}
}

function calcAddEndTime(startTime: string) {
	addForm.value.endTime = calcEndTime(startTime, addForm.value.duration || 60);
}

async function submitAdd() {
	const f = addForm.value;
	if (!f.scheduleDate || !f.courseName || !f.startTime || !f.endTime) {
		return ElMessage.warning('请填写完整信息');
	}
	addLoading.value = true;
	try {
		if (f.id) {
			await service.music.schedule.update({
				id: f.id,
				scheduleDate: f.scheduleDate,
				courseName: f.courseName,
				teacherName: f.teacherName,
				teacherAvatar: f.teacherAvatar,
				room: f.room,
				startTime: f.startTime,
				endTime: f.endTime,
			});
			ElMessage.success('修改成功');
		} else {
			await service.music.schedule.add({
				studentId: selectedStudentId.value,
				scheduleDate: f.scheduleDate,
				courseName: f.courseName,
				teacherName: f.teacherName,
				teacherAvatar: f.teacherAvatar,
				room: f.room,
				startTime: f.startTime,
				endTime: f.endTime,
				status: 0,
			});
			ElMessage.success('排课成功');
		}
		addDialogVisible.value = false;
		loadSchedules();
	} finally {
		addLoading.value = false;
	}
}

onMounted(async () => {
	// 获取当前用户角色信息
	const myInfo = await service.music.teacherStudent.request({ url: '/myInfo', method: 'GET' });
	isTeacher.value = myInfo?.isTeacher || false;

	const [students, courses] = await Promise.all([
		// 教师角色只加载自己的学员
		isTeacher.value
			? service.music.teacherStudent.request({ url: '/myStudents', method: 'GET' })
			: service.music.student.studentUsers(),
		service.music.course.list()
	]);
	studentList.value = (students || []).map((s: any) => ({ label: s.label, value: s.id }));
	courseList.value = (courses || []).map((c: any) => ({
		label: `${c.name}（${c.teacherName || '无教师'}）`,
		value: c.id,
		raw: c
	}));
	const map: Record<number, any> = {};
	(courses || []).forEach((c: any) => { map[c.id] = c; });
	courseMap.value = map;

	// 默认选中第一个学员
	if (studentList.value.length > 0) {
		selectedStudentId.value = studentList.value[0].value;
		loadSchedules();
	}
});
</script>

<style scoped>
.schedule-calendar {
	padding: 16px;
}

.toolbar {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 16px;
	flex-wrap: wrap;
}

.month-nav {
	display: flex;
	align-items: center;
	gap: 8px;
}

.month-label {
	font-size: 16px;
	font-weight: 600;
	min-width: 120px;
	text-align: center;
}

.calendar-wrap {
	overflow-x: auto;
}

.cal-table {
	width: 100%;
	border-collapse: collapse;
	table-layout: fixed;
}

.cal-table th {
	padding: 8px 4px;
	text-align: center;
	font-size: 13px;
	color: #606266;
	border-bottom: 1px solid #ebeef5;
}

.cal-cell {
	vertical-align: top;
	border: 1px solid #ebeef5;
	min-height: 100px;
	padding: 4px;
	cursor: pointer;
	transition: background 0.15s;
}

.cal-cell:hover {
	background: #f5f7fa;
}

.cal-cell.other-month {
	background: #fafafa;
}

.cal-cell.today .cell-date {
	background: #409eff;
	color: #fff;
	border-radius: 50%;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.cell-date {
	font-size: 13px;
	color: #303133;
	margin-bottom: 4px;
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.other-month .cell-date {
	color: #c0c4cc;
}

.cell-lessons {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.lesson-tag {
	font-size: 11px;
	padding: 2px 4px;
	border-radius: 3px;
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.lesson-tag:hover {
	opacity: 0.8;
}

.status-pending  { background: #ecf5ff; color: #409eff; }
.status-done     { background: #f0f9eb; color: #67c23a; }
.status-leave    { background: #fdf6ec; color: #e6a23c; }
.status-makeup   { background: #f4f4f5; color: #909399; }
.status-cancel   { background: #fef0f0; color: #f56c6c; text-decoration: line-through; }
</style>
