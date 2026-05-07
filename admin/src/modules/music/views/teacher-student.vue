<template>
	<div class="teacher-student">
		<el-row :gutter="16">
			<!-- 左侧：教师列表 -->
			<el-col :span="8">
				<el-card header="教师列表">
					<el-input
						v-model="teacherSearch"
						placeholder="搜索教师"
						clearable
						style="margin-bottom: 12px"
					/>
					<el-scrollbar height="500px">
						<div
							v-for="t in filteredTeachers"
							:key="t.id"
							:class="['teacher-item', { active: selectedTeacherId === t.id }]"
							@click="selectTeacher(t)"
						>
							<div class="teacher-avatar">{{ t.label?.charAt(0) }}</div>
							<div class="teacher-name">{{ t.label }}</div>
						</div>
						<div v-if="!filteredTeachers.length" class="empty-tip">暂无教师</div>
					</el-scrollbar>
				</el-card>
			</el-col>

			<!-- 右侧：已关联学员 -->
			<el-col :span="16">
				<el-card>
					<template #header>
						<div class="card-header">
							<span>{{ selectedTeacherName ? `${selectedTeacherName} 的学员` : '请先选择教师' }}</span>
							<el-button
								type="primary"
								size="small"
								:disabled="!selectedTeacherId"
								@click="openAddDialog"
							>
								添加学员
							</el-button>
						</div>
					</template>

					<el-table :data="linkedStudents" v-loading="loading" style="width:100%">
						<el-table-column label="学员" prop="label" />
						<el-table-column label="专长" prop="specialty" width="160" />
						<el-table-column label="操作" width="100" align="center">
							<template #default="{ row }">
								<el-button type="danger" size="small" text @click="unbind(row)">移除</el-button>
							</template>
						</el-table-column>
					</el-table>
				</el-card>
			</el-col>
		</el-row>

		<!-- 添加学员弹窗 -->
		<el-dialog v-model="addDialogVisible" title="添加学员" width="400px" destroy-on-close>
			<el-select
				v-model="selectedStudentIds"
				multiple
				filterable
				placeholder="请选择学员"
				style="width:100%"
			>
				<el-option
					v-for="s in unlinkedStudents"
					:key="s.id"
					:label="s.label"
					:value="s.id"
				/>
			</el-select>
			<template #footer>
				<el-button @click="addDialogVisible = false">取消</el-button>
				<el-button type="primary" :loading="addLoading" @click="submitAdd">确认添加</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'music-teacher-student' });

import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useCool } from '/@/cool';

const { service } = useCool();

const teacherList = ref<any[]>([]);
const allStudents = ref<any[]>([]);
const linkedStudents = ref<any[]>([]);
const selectedTeacherId = ref<number | null>(null);
const selectedTeacherName = ref('');
const teacherSearch = ref('');
const loading = ref(false);

const filteredTeachers = computed(() =>
	teacherSearch.value
		? teacherList.value.filter(t => t.label.includes(teacherSearch.value))
		: teacherList.value
);

const unlinkedStudents = computed(() => {
	const linkedIds = new Set(linkedStudents.value.map(s => s.id));
	return allStudents.value.filter(s => !linkedIds.has(s.id));
});

async function selectTeacher(t: any) {
	selectedTeacherId.value = t.id;
	selectedTeacherName.value = t.label;
	await loadLinked();
}

async function loadLinked() {
	if (!selectedTeacherId.value) return;
	loading.value = true;
	try {
		const data = await service.music.teacherStudent.request({
			url: '/list',
			method: 'GET',
			params: { teacherUserId: selectedTeacherId.value },
		});
		linkedStudents.value = data || [];
	} finally {
		loading.value = false;
	}
}

async function unbind(student: any) {
	await ElMessageBox.confirm(`确认移除学员 [${student.label}]？`, '提示', { type: 'warning' });
	await service.music.teacherStudent.request({
		url: '/unbind',
		method: 'POST',
		data: { teacherUserId: selectedTeacherId.value, studentId: student.id },
	});
	ElMessage.success('已移除');
	loadLinked();
}

// 添加学员
const addDialogVisible = ref(false);
const addLoading = ref(false);
const selectedStudentIds = ref<number[]>([]);

function openAddDialog() {
	selectedStudentIds.value = [];
	addDialogVisible.value = true;
}

async function submitAdd() {
	if (!selectedStudentIds.value.length) return ElMessage.warning('请选择学员');
	addLoading.value = true;
	try {
		await Promise.all(
			selectedStudentIds.value.map(studentId =>
				service.music.teacherStudent.request({
					url: '/bind',
					method: 'POST',
					data: { teacherUserId: selectedTeacherId.value, studentId },
				})
			)
		);
		ElMessage.success('添加成功');
		addDialogVisible.value = false;
		loadLinked();
	} finally {
		addLoading.value = false;
	}
}

onMounted(async () => {
	const [teachers, students] = await Promise.all([
		service.music.course.teacherUsers(),
		service.music.student.studentUsers(),
	]);
	teacherList.value = teachers || [];
	allStudents.value = (students || []).map((s: any) => ({ id: s.id, label: s.label, specialty: s.specialty }));

	if (teacherList.value.length > 0) {
		await selectTeacher(teacherList.value[0]);
	}
});
</script>

<style scoped>
.teacher-student {
	padding: 16px;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.teacher-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	border-radius: 8px;
	cursor: pointer;
	margin-bottom: 4px;
	transition: background 0.15s;
}

.teacher-item:hover {
	background: #f5f7fa;
}

.teacher-item.active {
	background: #ecf5ff;
}

.teacher-avatar {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: linear-gradient(135deg, #409eff, #79bbff);
	color: #fff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-weight: 600;
	flex-shrink: 0;
}

.teacher-name {
	font-size: 14px;
	color: #303133;
}

.empty-tip {
	text-align: center;
	color: #c0c4cc;
	padding: 40px 0;
	font-size: 13px;
}
</style>
