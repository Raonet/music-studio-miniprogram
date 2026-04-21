import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/music/student',
				meta: { label: '学员管理' },
				component: () => import('./views/student.vue')
			},
			{
				path: '/music/course',
				meta: { label: '课程管理' },
				component: () => import('./views/course.vue')
			},
			{
				path: '/music/package',
				meta: { label: '套餐管理' },
				component: () => import('./views/package.vue')
			},
			{
				path: '/music/schedule',
				meta: { label: '排课管理' },
				component: () => import('./views/schedule.vue')
			},
			{
				path: '/music/leave',
				meta: { label: '请假审批' },
				component: () => import('./views/leave.vue')
			}
		]
	};
};
