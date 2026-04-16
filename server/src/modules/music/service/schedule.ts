import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
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
  }

  /**
   * 获取某月的课程（按日期分组 + 有课日期集合）
   */
  async byMonth(userId: number, year: number, month: number) {
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
    const today = new Date().toISOString().slice(0, 10);

    const schedule = await this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.studentId = :studentId', { studentId: student.id })
      .andWhere('s.scheduleDate >= :today', { today })
      .andWhere('s.status = 0')
      .orderBy('s.scheduleDate', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getOne();

    if (!schedule) return null;

    // 计算时间戳
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
   * 获取近期已上课程（首页用）
   */
  async recent(userId: number, limit = 3) {
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
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const prefix = date === today ? '今天' : date === tomorrow ? '明天' : date;
    return `${prefix} ${time}`;
  }
}
