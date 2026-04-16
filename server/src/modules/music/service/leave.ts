import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicLeaveRequestEntity } from '../entity/leave-request';
import { MusicStudentService } from './student';

// status 映射
const STATUS_MAP = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

const STATUS_LABEL = ['审批中', '已批准', '已拒绝'];
const STATUS_KEY = ['pending', 'approved', 'rejected'];

@Provide()
export class MusicLeaveService extends BaseService {
  @InjectEntityModel(MusicLeaveRequestEntity)
  leaveEntity: Repository<MusicLeaveRequestEntity>;

  @Inject()
  studentService: MusicStudentService;

  @Inject()
  ctx;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.leaveEntity);
  }

  /**
   * 提交请假申请
   */
  async submit(userId: number, body: { courseName: string; leaveDate: string; reason?: string }) {
    const student = await this.studentService.getOrCreate(userId);

    const record = await this.leaveEntity.save({
      studentId: student.id,
      courseName: body.courseName,
      leaveDate: body.leaveDate,
      reason: body.reason || '',
      status: 0,
    });

    return { id: record.id };
  }

  /**
   * 获取请假记录列表
   */
  async records(userId: number, filter: string) {
    const student = await this.studentService.getOrCreate(userId);

    const qb = this.leaveEntity
      .createQueryBuilder('l')
      .where('l.studentId = :studentId', { studentId: student.id })
      .orderBy('l.leaveDate', 'DESC')
      .addOrderBy('l.createTime', 'DESC');

    if (filter && STATUS_MAP[filter] !== undefined) {
      qb.andWhere('l.status = :status', { status: STATUS_MAP[filter] });
    }

    const leaves = await qb.getMany();

    return leaves.map(l => ({
      id: l.id,
      courseName: l.courseName,
      leaveDate: l.leaveDate,
      reason: l.reason,
      status: STATUS_LABEL[l.status],
      statusKey: STATUS_KEY[l.status],
      remark: l.remark,
    }));
  }
}
