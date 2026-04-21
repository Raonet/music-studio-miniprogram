import { type ModuleConfig, service } from '/@/cool';
import MusicStudentService from './service/student';
import MusicCourseService from './service/course';
import MusicPackageService from './service/package';
import MusicScheduleService from './service/schedule';
import MusicLeaveService from './service/leave';

export default (): ModuleConfig => {
	return {
		install() {
			if (!service.music) {
				(service as any).music = {
					student: new MusicStudentService(),
					course: new MusicCourseService(),
					package: new MusicPackageService(),
					schedule: new MusicScheduleService(),
					leave: new MusicLeaveService()
				};
			}
		},
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
