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
defineOptions({ name: 'music-course' });

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { reactive, computed } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '500px'));

const options = reactive({
	status: [
		{ label: '禁用', value: 0, type: 'danger' },
		{ label: '启用', value: 1, type: 'success' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '课程名称', prop: 'name', minWidth: 130 },
		{ label: '教师姓名', prop: 'teacherName', minWidth: 100 },
		{ label: '教师头像', prop: 'teacherAvatar', minWidth: 80 },
		{ label: '时长(分钟)', prop: 'duration', minWidth: 90 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 80 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 160 },
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

const Upsert = useUpsert({
	dialog: { width: dialogWidth },
	items: [
		{
			prop: 'name',
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
			component: { name: 'el-input', props: { maxlength: 1, placeholder: '取教师名第一个字' } }
		},
		{
			prop: 'duration',
			label: '时长(分钟)',
			value: 60,
			component: { name: 'el-input-number', props: { min: 1, style: 'width:100%' } }
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
			component: { name: 'el-input', props: { placeholder: '搜索课程/教师', clearable: true } }
		}
	]
});

const Crud = useCrud({ service: service.music.course }, app => {
	app.refresh();
});
</script>
