<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
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
import { ref, onMounted, computed } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '400px'));

const studentList = ref<any[]>([]);

onMounted(async () => {
	// 先确保所有学员都有课时记录
	await service.music.package.request({ url: '/ensureAll', method: 'GET' });
	const res = await service.music.student.studentUsers();
	studentList.value = (res || []).map((s: any) => ({ label: s.label, value: s.id }));
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{
			label: '学员',
			prop: 'studentId',
			minWidth: 150,
			formatter: (row: any) => {
				const s = studentList.value.find(s => s.value === row.studentId);
				return s?.label || row.studentId;
			}
		},
		{ label: '剩余课时', prop: 'totalLessons', minWidth: 100 },
		{ label: '已用课时', prop: 'usedLessons', minWidth: 100 },
		{ label: '更新时间', prop: 'updateTime', sortable: 'desc', minWidth: 160 },
		{ type: 'op', buttons: ['edit'] }
	]
});

const Upsert = useUpsert({
	dialog: { width: dialogWidth },
	items: [
		{
			prop: 'totalLessons',
			label: '剩余课时',
			required: true,
			component: { name: 'el-input-number', props: { min: 0, style: 'width:100%' } }
		},
		{
			prop: 'usedLessons',
			label: '已用课时',
			component: { name: 'el-input-number', props: { min: 0, disabled: true, style: 'width:100%' } }
		}
	]
});

const Search = useSearch({
	items: [
		{
			prop: 'studentId',
			component: {
				name: 'el-select',
				props: { placeholder: '按学员筛选', filterable: true, clearable: true, style: 'width:200px' },
				options: studentList
			}
		}
	]
});

const Crud = useCrud({ service: service.music.package }, app => {
	app.refresh();
});
</script>
