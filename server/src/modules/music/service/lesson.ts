import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicScheduleEntity } from '../entity/schedule';
import { MusicStudentService } from './student';

// status 映射
const STATUS_MAP = {
  completed: 1,
  leave: 2,
  makeup: 3,
};

const STATUS_LABEL = ['待上课', '已上课', '已请假', '待补课'];
const STATUS_KEY = ['pending', 'completed', 'leave', 'makeup'];

@Provide()
export class MusicLessonService extends BaseService {
  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  @Inject()
  studentService: MusicStudentService;

  @Inject()
  ctx;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.scheduleEntity);
  }

  /**
   * 获取课时记录列表 + 汇总
   */
  async records(userId: number, filter: string) {
    const student = await this.studentService.getOrCreate(userId);

    const qb = this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.studentId = :studentId', { studentId: student.id })
      .andWhere('s.status IN (1, 2, 3)')
      .orderBy('s.scheduleDate', 'DESC')
      .addOrderBy('s.startTime', 'DESC');

    if (filter && STATUS_MAP[filter] !== undefined) {
      qb.andWhere('s.status = :status', { status: STATUS_MAP[filter] });
    }

    const schedules = await qb.getMany();

    const records = schedules.map(s => ({
      id: s.id,
      date: `${s.scheduleDate} ${s.startTime}`,
      course: s.courseName,
      teacher: s.teacherName,
      duration: `${this.calcDuration(s.startTime, s.endTime)}分钟`,
      status: STATUS_LABEL[s.status],
      statusKey: STATUS_KEY[s.status],
    }));

    // 汇总：已上课 + 已请假 都算消耗课时
    const completedRecords = schedules.filter(s => s.status === 1);
    const usedLessons = completedRecords.length;
    const totalMinutes = completedRecords.reduce(
      (sum, s) => sum + this.calcDuration(s.startTime, s.endTime),
      0,
    );
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    return { records, summary: { usedLessons, totalHours } };
  }

  private calcDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }
}
