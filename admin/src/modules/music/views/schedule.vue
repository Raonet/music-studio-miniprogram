<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table">
				<!-- 完成课程自定义按钮插槽 -->
				<template #slot-finish="{ scope }">
					<el-button
						v-if="scope.row.status === 0"
						size="small"
						type="success"
						@click="markFinish(scope.row)"
					>已上课</el-button>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-schedule' });

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { reactive, ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '600px'));

const options = reactive({
	status: [
		{ label: '待上课', value: 0, type: 'primary' },
		{ label: '已上课', value: 1, type: 'success' },
		{ label: '已请假', value: 2, type: 'warning' },
		{ label: '待补课', value: 3, type: 'info' }
	]
});

const studentList = ref<any[]>([]);
const courseList = ref<any[]>([]);
const courseMap = ref<Record<number, any>>({});

onMounted(async () => {
	const [students, courses] = await Promise.all([
		service.music.student.list(),
		service.music.course.list()
	]);
	studentList.value = (students || []).map((s: any) => ({
		label: `${s.studentNo || s.id} ${s.specialty ? '(' + s.specialty + ')' : ''}`,
		value: s.id
	}));
	courseList.value = (courses || []).map((c: any) => ({
		label: `${c.name}（${c.teacherName || '无教师'}）`,
		value: c.id,
		raw: c
	}));
	const map: Record<number, any> = {};
	(courses || []).forEach((c: any) => { map[c.id] = c; });
	courseMap.value = map;
});

// 标记已上课
async function markFinish(row: any) {
	await ElMessageBox.confirm(`确认将 [${row.courseName}] 标记为已上课？`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'info'
	});
	await service.music.schedule.update({ id: row.id, status: 1 });
	ElMessage.success('已标记为已上课');
	Crud.value?.refresh();
}

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '学员ID', prop: 'studentId', minWidth: 80 },
		{ label: '课程名称', prop: 'courseName', minWidth: 120 },
		{ label: '教师', prop: 'teacherName', minWidth: 90 },
		{ label: '教室', prop: 'room', minWidth: 80 },
		{ label: '上课日期', prop: 'scheduleDate', minWidth: 110 },
		{ label: '时间', prop: 'startTime', minWidth: 80,
			formatter: (row: any) => `${row.startTime}~${row.endTime}`
		},
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 90 },
		{
			type: 'op',
			width: 220,
			buttons: [
				{ name: 'slot-finish' },
				'edit',
				'delete'
			]
		}
	]
});

const Upsert = useUpsert({
	dialog: { width: dialogWidth },
	items: [
		{
			prop: 'studentId',
			label: '学员',
			required: true,
			component: {
				name: 'el-select',
				props: { placeholder: '请选择学员', filterable: true, style: 'width:100%' },
				options: studentList
			}
		},
		{
			prop: 'courseId',
			label: '选择课程',
			component: {
				name: 'el-select',
				props: {
					placeholder: '选课程后自动填入教师信息',
					filterable: true,
					style: 'width:100%',
					onChange: (val: number) => {
						const c = courseMap.value[val];
						if (c) {
							Upsert.value?.setForm('courseName', c.name);
							Upsert.value?.setForm('teacherName', c.teacherName || '');
							Upsert.value?.setForm('teacherAvatar', c.teacherAvatar || '');
						}
					}
				},
				options: courseList
			}
		},
		{
			prop: 'courseName',
			label: '课程名称',
			required: true,
			component: { name: 'el-input' }
		},
		{
			prop: 'teacherName',
			label: '教师姓名',
			component: { name: 'el-input' }
		},
		{
			prop: 'teacherAvatar',
			label: '教师头像(首字)',
			component: { name: 'el-input', props: { maxlength: 1 } }
		},
		{
			prop: 'room',
			label: '教室',
			component: { name: 'el-input', props: { placeholder: '如：A101' } }
		},
		{
			prop: 'scheduleDate',
			label: '上课日期',
			required: true,
			component: {
				name: 'el-date-picker',
				props: { type: 'date', valueFormat: 'YYYY-MM-DD', style: 'width:100%' }
			}
		},
		{
			prop: 'startTime',
			label: '开始时间',
			required: true,
			component: {
				name: 'el-time-select',
				props: {
					start: '08:00', step: '00:30', end: '22:00',
					placeholder: '选择开始时间', style: 'width:100%'
				}
			}
		},
		{
			prop: 'endTime',
			label: '结束时间',
			required: true,
			component: {
				name: 'el-time-select',
				props: {
					start: '08:30', step: '00:30', end: '22:30',
					placeholder: '选择结束时间', style: 'width:100%'
				}
			}
		},
		{
			prop: 'status',
			label: '状态',
			value: 0,
			component: { name: 'el-radio-group', options: options.status }
		}
	]
});

const Search = useSearch({
	items: [
		{
			prop: 'keyWord',
			component: { name: 'el-input', props: { placeholder: '搜索课程名称', clearable: true } }
		}
	]
});

const Crud = useCrud({ service: service.music.schedule }, app => {
	app.refresh();
});
</script>
