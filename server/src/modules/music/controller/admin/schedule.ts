import { CoolCommException, CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MusicScheduleEntity } from '../../entity/schedule';
import { MusicTeacherService } from '../../service/teacher';

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

  @Inject()
  musicTeacherService: MusicTeacherService;

  /** 按月份查询所有排课，用于日历视图 */
  @Get('/byMonth', { summary: '按月份查询所有排课' })
  async byMonth(
    @Query('month') month: string,
    @Query('teacherName') teacherName?: string,
  ) {
    if (!month) return this.ok([]);
    const dateFrom = `${month}-01`;
    const dateTo = `${month}-31`;

    if (await this.musicTeacherService.isTeacher()) {
      // 教师角色只能看自己的排课
      const myIds = await this.musicTeacherService.getMyStudentIds();
      if (!myIds.length) return this.ok([]);
      const list = await this.scheduleEntity.find({
        where: myIds.map(id => ({ studentId: id, scheduleDate: Between(dateFrom, dateTo) })),
        order: { scheduleDate: 'ASC', startTime: 'ASC' },
      });
      return this.ok(list);
    }

    // 管理员：可按教师名过滤
    const qb = this.scheduleEntity.createQueryBuilder('s')
      .where('s.scheduleDate BETWEEN :from AND :to', { from: dateFrom, to: dateTo })
      .orderBy('s.scheduleDate', 'ASC')
      .addOrderBy('s.startTime', 'ASC');
    if (teacherName) {
      qb.andWhere('s.teacherName = :teacherName', { teacherName });
    }
    return this.ok(await qb.getMany());
  }

  /** 按学员+月份查询排课，用于日历视图 */
  @Get('/byStudent', { summary: '按学员和月份查询排课' })
  async byStudent(
    @Query('studentId') studentId: number,
    @Query('month') month: string,
  ) {
    if (!studentId || !month) return this.ok([]);

    // 教师角色只能查自己学员的排课
    if (await this.musicTeacherService.isTeacher()) {
      const myIds = await this.musicTeacherService.getMyStudentIds();
      if (!myIds.includes(Number(studentId))) {
        throw new CoolCommException('无权查看该学员排课', 403);
      }
    }

    const dateFrom = `${month}-01`;
    const dateTo = `${month}-31`;
    const list = await this.scheduleEntity.find({
      where: { studentId: Number(studentId), scheduleDate: Between(dateFrom, dateTo) },
      order: { scheduleDate: 'ASC', startTime: 'ASC' },
    });
    return this.ok(list);
  }

  /** 按教师+周查询排课，用于教师周视图 */
  @Get('/byTeacher', { summary: '按教师和周查询排课' })
  async byTeacher(
    @Query('teacherName') teacherName: string,
    @Query('weekStart') weekStart: string,
  ) {
    // 教师角色强制使用自己的姓名
    if (await this.musicTeacherService.isTeacher()) {
      teacherName = await this.musicTeacherService.getTeacherName();
    }
    if (!teacherName || !weekStart) return this.ok([]);

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
    @Body('weekdays') weekdays: number[],
    @Body('startTime') startTime: string,
    @Body('endTime') endTime: string,
    @Body('dateFrom') dateFrom: string,
    @Body('dateTo') dateTo: string,
  ) {
    // 教师角色校验学员归属，并强制使用自己的姓名
    if (await this.musicTeacherService.isTeacher()) {
      const myIds = await this.musicTeacherService.getMyStudentIds();
      if (!myIds.includes(Number(studentId))) {
        throw new CoolCommException('无权给该学员排课', 403);
      }
      teacherName = await this.musicTeacherService.getTeacherName();
    }

    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const records: Partial<MusicScheduleEntity>[] = [];
    const pad = (n: number) => String(n).padStart(2, '0');

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      if (weekdays.includes(d.getDay())) {
        const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        records.push({ studentId: Number(studentId), courseName, teacherName, teacherAvatar, room, scheduleDate: dateStr, startTime, endTime, status: 0 });
      }
    }

    if (records.length > 0) await this.scheduleEntity.insert(records);
    return this.ok({ created: records.length });
  }
}

