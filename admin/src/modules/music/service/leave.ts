import { BaseService } from '/@/cool';

class MusicLeaveService extends BaseService {
	constructor() {
		super('admin/music/leave');
	}

	approve(data: { id: number; remark: string }) {
		return this.request({ url: '/approve', method: 'POST', data });
	}

	reject(data: { id: number; remark: string }) {
		return this.request({ url: '/reject', method: 'POST', data });
	}
}

export default MusicLeaveService;
