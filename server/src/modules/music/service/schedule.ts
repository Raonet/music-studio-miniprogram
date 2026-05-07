import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { MusicScheduleEntity } from '../entity/schedule';
import { MusicStudentService } from './student';

@Provide()
export class MusicScheduleService extends BaseService {
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
    // 启动时把历史过期的待上课记录批量标记为已上课
    await this._autoFinishExpired();
  }

  /** 把日期已过且状态仍为待上课(0)的记录自动标记为已上课(1) */
  private async _autoFinishExpired() {
    const today = new Date().toISOString().slice(0, 10);
    await this.scheduleEntity.update(
      { status: 0, scheduleDate: LessThan(today) },
      { status: 1 }
    );
  }

  /** 获取今天的日期字符串 YYYY-MM-DD */
  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * 获取某月的课程（按日期分组 + 有课日期集合）
   */
  async byMonth(userId: number, year: number, month: number) {
    await this._autoFinishExpired();
    const student = await this.studentService.getOrCreate(userId);
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;

    const schedules = await this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.studentId = :studentId', { studentId: student.id })
      .andWhere('s.scheduleDate LIKE :month', { month: `${monthStr}%` })
      .orderBy('s.scheduleDate', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();

    const lessonDates = [...new Set(schedules.map(s => s.scheduleDate))];
    const lessonsByDate: Record<string, any[]> = {};
    for (const s of schedules) {
      if (!lessonsByDate[s.scheduleDate]) lessonsByDate[s.scheduleDate] = [];
      lessonsByDate[s.scheduleDate].push({
        id: s.id,
        time: `${s.startTime}-${s.endTime}`,
        course: s.courseName,
        teacher: s.teacherName,
        teacherAvatar: s.teacherAvatar,
        room: s.room,
        status: this.statusLabel(s.status),
      });
    }

    return { lessonDates, lessonsByDate };
  }

  /**
   * 获取下一节课
   */
  async next(userId: number) {
    const student = await this.studentService.getOrCreate(userId);
    const today = this.today();

    const schedule = await this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.studentId = :studentId', { studentId: student.id })
      .andWhere('s.scheduleDate >= :today', { today })
      .andWhere('s.status = 0')
      .orderBy('s.scheduleDate', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getOne();

    if (!schedule) return null;

    const [h, m] = schedule.startTime.split(':').map(Number);
    const [y, mo, d] = schedule.scheduleDate.split('-').map(Number);
    const lessonTime = new Date(y, mo - 1, d, h, m, 0).getTime();

    return {
      id: schedule.id,
      date: schedule.scheduleDate,
      time: `${schedule.startTime}-${schedule.endTime}`,
      course: schedule.courseName,
      teacher: schedule.teacherName,
      room: schedule.room,
      lessonTime,
      displayDate: this.formatDisplayDate(schedule.scheduleDate, schedule.startTime),
    };
  }

  /**
   * 获取近期课程（首页用，包含已上课/已请假/待补课及过期自动完成的记录）
   */
  async recent(userId: number, limit = 3) {
    await this._autoFinishExpired();
    const student = await this.studentService.getOrCreate(userId);

    const schedules = await this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.studentId = :studentId', { studentId: student.id })
      .andWhere('s.status IN (1, 2, 3)')
      .orderBy('s.scheduleDate', 'DESC')
      .limit(limit)
      .getMany();

    return schedules.map(s => ({
      id: s.id,
      date: s.scheduleDate,
      type: s.courseName,
      teacher: s.teacherName,
      duration: `${this.calcDuration(s.startTime, s.endTime)}分钟`,
      status: this.statusLabel(s.status),
    }));
  }

  private statusLabel(status: number) {
    return ['待上课', '已上课', '已请假', '待补课'][status] || '未知';
  }

  private calcDuration(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  private formatDisplayDate(date: string, time: string): string {
    const today = this.today();
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const prefix = date === today ? '今天' : date === tomorrow ? '明天' : date;
    return `${prefix} ${time}`;
  }
}
