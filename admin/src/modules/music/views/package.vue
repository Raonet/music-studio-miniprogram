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
			<cl-table ref="Table" />
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert" />
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-package' });

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { reactive, ref, onMounted, computed } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '500px'));

const options = reactive({
	status: [
		{ label: '未开始', value: 0, type: 'info' },
		{ label: '进行中', value: 1, type: 'success' },
		{ label: '已结束', value: 2, type: 'warning' }
	]
});

const studentList = ref<any[]>([]);

onMounted(async () => {
	const res = await service.music.student.list();
	studentList.value = (res || []).map((s: any) => ({
		label: `${s.studentNo || s.id} ${s.specialty ? '(' + s.specialty + ')' : ''}`,
		value: s.id
	}));
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '学员ID', prop: 'studentId', minWidth: 80 },
		{ label: '套餐名称', prop: 'name', minWidth: 130 },
		{ label: '总课时', prop: 'totalLessons', minWidth: 80 },
		{ label: '已用课时', prop: 'usedLessons', minWidth: 80 },
		{ label: '有效期至', prop: 'expireDate', minWidth: 110 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 90 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 160 },
		{ type: 'op', buttons: ['edit', 'delete'] }
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
			prop: 'name',
			label: '套餐名称',
			required: true,
			component: { name: 'el-input', props: { placeholder: '如：年度套餐100课时' } }
		},
		{
			prop: 'totalLessons',
			label: '总课时',
			required: true,
			component: { name: 'el-input-number', props: { min: 1, style: 'width:100%' } }
		},
		{
			prop: 'expireDate',
			label: '有效期至',
			component: {
				name: 'el-date-picker',
				props: { type: 'date', valueFormat: 'YYYY-MM-DD', style: 'width:100%' }
			}
		},
		{
			prop: 'status',
			label: '状态',
			value: 1,
			component: { name: 'el-radio-group', options: options.status }
		}
	]
});

const Search = useSearch({
	items: [
		{
			prop: 'keyWord',
			component: { name: 'el-input', props: { placeholder: '搜索套餐名称', clearable: true } }
		}
	]
});

const Crud = useCrud({ service: service.music.package }, app => {
	app.refresh();
});
</script>
