import { BaseService } from '/@/cool';

class MusicCourseService extends BaseService {
	constructor() {
		super('admin/music/course');
	}

	teacherUsers() {
		return this.request({ url: '/teacherUsers', method: 'GET' });
	}
}

export default MusicCourseService;
