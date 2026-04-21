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
import { reactive, ref, onMounted, computed } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '500px'));

const options = reactive({
	status: [
		{ label: '禁用', value: 0, type: 'danger' },
		{ label: '启用', value: 1, type: 'success' }
	]
});

const teacherList = ref<any[]>([]);

onMounted(async () => {
	const res = await service.music.course.teacherUsers();
	teacherList.value = (res || []).map((t: any) => ({
		label: t.label,
		value: t.name,
		raw: t
	}));
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '课程名称', prop: 'name', minWidth: 130 },
		{ label: '教师', prop: 'teacherName', minWidth: 100 },
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
			label: '教师',
			required: true,
			component: {
				name: 'el-select',
				props: {
					placeholder: '请选择教师',
					filterable: true,
					style: 'width:100%',
					onChange: (val: string) => {
						const t = teacherList.value.find(t => t.value === val);
						if (t) {
							Upsert.value?.setForm('teacherAvatar', t.raw.name?.charAt(0) || '');
						}
					}
				},
				options: teacherList
			}
		},
		{
			prop: 'teacherAvatar',
			label: '教师头像(首字)',
			component: { name: 'el-input', props: { maxlength: 1, placeholder: '自动填入，可手动修改' } }
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
