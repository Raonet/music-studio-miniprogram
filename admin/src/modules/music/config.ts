import { type ModuleConfig, service } from '/@/cool';
import MusicStudentService from './service/student';
import MusicCourseService from './service/course';
import MusicPackageService from './service/package';
import MusicScheduleService from './service/schedule';
import MusicLeaveService from './service/leave';
import MusicStatService from './service/stat';

export default (): ModuleConfig => {
	return {
		install() {
			if (!service.music) {
				(service as any).music = {
					student: new MusicStudentService(),
					course: new MusicCourseService(),
					package: new MusicPackageService(),
					schedule: new MusicScheduleService(),
					leave: new MusicLeaveService(),
					stat: new MusicStatService(),
				};
			}
		},
		views: [
			{
				path: '/music/home',
				meta: { label: '统计看板', isHome: true },
				component: () => import('./views/home.vue')
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
				meta: { label: '排课日历' },
				component: () => import('./views/schedule-calendar.vue')
			},
			{
				path: '/music/schedule-teacher',
				meta: { label: '教师总览' },
				component: () => import('./views/schedule-teacher.vue')
			},
			{
				path: '/music/leave',
				meta: { label: '请假审批' },
				component: () => import('./views/leave.vue')
			}
		]
	};
};
