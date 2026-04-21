<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-flex1 />
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<cl-table ref="Table">
				<template #slot-approve="{ scope }">
					<template v-if="scope.row.status === 0">
						<el-button size="small" type="success" @click="handleApprove(scope.row)">批准</el-button>
						<el-button size="small" type="danger" @click="handleReject(scope.row)">拒绝</el-button>
					</template>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-leave' });

import { useCrud, useSearch, useTable } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const { service } = useCool();

const options = reactive({
	status: [
		{ label: '审批中', value: 0, type: 'warning' },
		{ label: '已批准', value: 1, type: 'success' },
		{ label: '已拒绝', value: 2, type: 'danger' }
	]
});

async function handleApprove(row: any) {
	const { value: remark } = await ElMessageBox.prompt('请输入审批备注（可留空）', '批准请假', {
		confirmButtonText: '确认批准',
		cancelButtonText: '取消',
		inputPlaceholder: '备注...',
		inputValidator: () => true
	});
	await service.music.leave.approve({ id: row.id, remark: remark || '' });
	ElMessage.success('已批准');
	Crud.value?.refresh();
}

async function handleReject(row: any) {
	const { value: remark } = await ElMessageBox.prompt('请输入拒绝原因', '拒绝请假', {
		confirmButtonText: '确认拒绝',
		cancelButtonText: '取消',
		inputPlaceholder: '原因...',
		inputValidator: (v: string) => (v ? true : '请输入拒绝原因')
	});
	await service.music.leave.reject({ id: row.id, remark });
	ElMessage.success('已拒绝');
	Crud.value?.refresh();
}

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '学员ID', prop: 'studentId', minWidth: 80 },
		{ label: '课程名称', prop: 'courseName', minWidth: 120 },
		{ label: '请假日期', prop: 'leaveDate', minWidth: 110 },
		{ label: '原因', prop: 'reason', minWidth: 150, showOverflowTooltip: true },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 90 },
		{ label: '备注', prop: 'remark', minWidth: 120, showOverflowTooltip: true },
		{ label: '申请时间', prop: 'createTime', sortable: 'desc', minWidth: 160 },
		{
			type: 'op',
			width: 160,
			buttons: [{ name: 'slot-approve' }, 'delete']
		}
	]
});

const Search = useSearch({
	items: [
		{
			prop: 'keyWord',
			component: { name: 'el-input', props: { placeholder: '搜索课程名称', clearable: true } }
		},
		{
			prop: 'status',
			component: {
				name: 'el-select',
				props: { placeholder: '审批状态', clearable: true, style: 'width:110px' },
				options: options.status
			}
		}
	]
});

const Crud = useCrud({ service: service.music.leave }, app => {
	app.refresh();
});
</script>
