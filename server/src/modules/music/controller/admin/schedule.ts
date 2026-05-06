import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MusicScheduleEntity } from '../../entity/schedule';

/**
 * 排课管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicScheduleEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.courseName', 'a.teacherName'],
    fieldEq: ['a.studentId', 'a.status'],
    fieldLike: ['a.scheduleDate'],
  },
})
export class AdminMusicScheduleController extends BaseController {
  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  /** 按学员+月份查询排课，用于日历视图 */
  @Get('/byStudent', { summary: '按学员和月份查询排课' })
  async byStudent(
    @Query('studentId') studentId: number,
    @Query('month') month: string, // YYYY-MM
  ) {
    if (!studentId || !month) return this.ok([]);
    const dateFrom = `${month}-01`;
    const dateTo = `${month}-31`;
    const list = await this.scheduleEntity.find({
      where: {
        studentId: Number(studentId),
        scheduleDate: Between(dateFrom, dateTo),
      },
      order: { scheduleDate: 'ASC', startTime: 'ASC' },
    });
    return this.ok(list);
  }

  /** 按教师+周查询排课，用于教师周视图 */
  @Get('/byTeacher', { summary: '按教师和周查询排课' })
  async byTeacher(
    @Query('teacherName') teacherName: string,
    @Query('weekStart') weekStart: string, // YYYY-MM-DD 周一
  ) {
    if (!teacherName || !weekStart) return this.ok([]);
    // 计算周日日期
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const pad = (n: number) => String(n).padStart(2, '0');
    const weekEnd = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;

    const list = await this.scheduleEntity
      .createQueryBuilder('s')
      .where('s.teacherName = :teacherName', { teacherName })
      .andWhere('s.scheduleDate BETWEEN :start AND :end', { start: weekStart, end: weekEnd })
      .orderBy('s.scheduleDate', 'ASC')
      .addOrderBy('s.startTime', 'ASC')
      .getMany();
    return this.ok(list);
  }

  /** 批量创建排课（按星期循环） */
  @Post('/batchCreate', { summary: '批量循环排课' })
  async batchCreate(
    @Body('studentId') studentId: number,
    @Body('courseName') courseName: string,
    @Body('teacherName') teacherName: string,
    @Body('teacherAvatar') teacherAvatar: string,
    @Body('room') room: string,
    @Body('weekdays') weekdays: number[], // 0=周日 1=周一 ... 6=周六
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @Body('dateFrom') dateFrom: string, // YYYY-MM-DD
    @Body('dateTo') dateTo: string,     // YYYY-MM-DD
  ) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const records: Partial<MusicScheduleEntity>[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) {
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        records.push({
          studentId: Number(studentId),
          courseName,
          teacherName,
          teacherAvatar,
          room,
          scheduleDate: dateStr,
          startTime,
          endTime,
          status: 0,
        });
      }
    }

    if (records.length > 0) {
      await this.scheduleEntity.insert(records);
    }
    return this.ok({ created: records.length });
  }
}
