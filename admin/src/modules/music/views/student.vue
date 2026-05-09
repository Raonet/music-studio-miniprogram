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
				<template #column-slot-user="{ scope }">
					<div class="user-cell">
						<el-avatar :size="32" :src="scope.row.avatarUrl">
							{{ (scope.row.nickName || '?').charAt(0) }}
						</el-avatar>
						<div class="user-info">
							<div class="user-name">{{ scope.row.nickName || '未设置昵称' }}</div>
							<div class="user-phone">{{ scope.row.phone || '' }}</div>
						</div>
					</div>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<cl-pagination />
		</cl-row>

		<cl-upsert ref="Upsert">
			<template #slot-userId>
				<el-select
					v-model="upsertUserId"
					placeholder="搜索昵称或手机号"
					filterable
					style="width:100%"
					@change="onUserSelect"
				>
					<el-option
						v-for="u in userList"
						:key="u.id"
						:label="u.label"
						:value="u.id"
					>
						<div class="user-option">
							<el-avatar :size="28" :src="u.avatarUrl">{{ u.nickName.charAt(0) }}</el-avatar>
							<div class="user-option-info">
								<span class="user-option-name">{{ u.nickName }}</span>
								<span class="user-option-phone">{{ u.phone }}</span>
							</div>
						</div>
					</el-option>
				</el-select>
			</template>
		</cl-upsert>
	</cl-crud>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-student' });

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { ref, computed, watch, onMounted } from 'vue';

const { service, browser } = useCool();
const dialogWidth = computed(() => (browser.isMobile ? '95%' : '520px'));

const userList = ref<any[]>([]);
const upsertUserId = ref<number | null>(null);

async function loadUserList(studentId?: number) {
	const res = await service.music.student.request({
		url: '/userList',
		method: 'POST',
		data: studentId ? { studentId } : {}
	});
	userList.value = res || [];
}

onMounted(() => {
	loadUserList();
});

function onUserSelect(val: number) {
	Upsert.value?.setForm('userId', val);
}

// 编辑时同步回显 userId 到自定义选择器
watch(() => Upsert.value?.form?.userId, (val) => {
	upsertUserId.value = val != null ? Number(val) : null;
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '关联用户', type: 'slot', prop: 'slot-user', minWidth: 180 },
		{ label: '学员编号', prop: 'studentNo', minWidth: 110 },
		{ label: '专长方向', prop: 'specialty', minWidth: 120 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 160 },
		{ type: 'op', buttons: ['edit', 'delete'] }
	]
});

const Upsert = useUpsert({
	dialog: { width: dialogWidth },
	onOpened(data: any) {
		const sid = data?.id ? Number(data.id) : undefined;
		loadUserList(sid);
		upsertUserId.value = data?.userId != null ? Number(data.userId) : null;
	},
	items: [
		{
			prop: 'userId',
			label: '关联用户',
			required: true,
			component: { name: 'slot-userId' }
		},
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

<style scoped>
.user-cell {
	display: flex;
	align-items: center;
	gap: 10px;
}

.user-info {
	display: flex;
	flex-direction: column;
}

.user-name {
	font-size: 13px;
	font-weight: 500;
	color: #303133;
}

.user-phone {
	font-size: 12px;
	color: #909399;
}

.user-option {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 2px 0;
}

.user-option-info {
	display: flex;
	flex-direction: column;
}

.user-option-name {
	font-size: 13px;
	color: #303133;
}

.user-option-phone {
	font-size: 11px;
	color: #909399;
}
</style>
