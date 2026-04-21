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
defineOptions({ name: 'music-student' });

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { computed } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '500px'));

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '学员编号', prop: 'studentNo', minWidth: 120 },
		{ label: '专长方向', prop: 'specialty', minWidth: 120 },
		{ label: '关联用户ID', prop: 'userId', minWidth: 100 },
		{
			label: '创建时间',
			prop: 'createTime',
			sortable: 'desc',
			minWidth: 160
		},
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

const Upsert = useUpsert({
	dialog: { width: dialogWidth },
	items: [
		{
			prop: 'studentNo',
			label: '学员编号',
			required: true,
			component: { name: 'el-input', props: { placeholder: '如：S001' } }
		},
		{
			prop: 'specialty',
			label: '专长方向',
			component: { name: 'el-input', props: { placeholder: '如：钢琴、吉他' } }
		},
		{
			prop: 'userId',
			label: '关联用户ID',
			required: true,
			component: {
				name: 'el-input-number',
				props: { min: 1, placeholder: '小程序注册用户ID', style: 'width:100%' }
			}
		}
	]
});

const Search = useSearch({
	items: [
		{
			prop: 'keyWord',
			component: { name: 'el-input', props: { placeholder: '搜索学员编号/专长', clearable: true } }
		}
	]
});

const Crud = useCrud({ service: service.music.student }, app => {
	app.refresh();
});
</script>
