import { BaseService } from '/@/cool';

class MusicStudentService extends BaseService {
	constructor() {
		super('admin/music/student');
	}

	studentUsers() {
		return this.request({ url: '/studentUsers', method: 'GET' });
	}
}

export default MusicStudentService;
