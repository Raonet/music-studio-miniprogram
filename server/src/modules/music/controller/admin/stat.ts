import { BaseController } from '@cool-midway/core';
import { CoolController } from '@cool-midway/core';
import { Get, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicScheduleEntity } from '../../entity/schedule';
import { MusicStudentEntity } from '../../entity/student';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 统计 - Admin
 */
@CoolController()
export class AdminMusicStatController extends BaseController {
  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /** 全年每月已上课节数 */
  @Get('/lessonsByMonth', { summary: '全年每月已上课节数' })
  async lessonsByMonth(@Query('year') year: string) {
    const y = year || new Date().getFullYear().toString();
    const rows = await this.scheduleEntity
      .createQueryBuilder('s')
      .select("DATE_FORMAT(s.scheduleDate, '%m')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where("s.scheduleDate LIKE :prefix", { prefix: `${y}-%` })
      .andWhere('s.status = 1')
      .groupBy("DATE_FORMAT(s.scheduleDate, '%m')")
      .orderBy("month", 'ASC')
      .getRawMany();

    // 补全 01~12 月，没有数据的月份填 0
    const map: Record<string, number> = {};
    rows.forEach(r => { map[r.month] = Number(r.count); });
    const result = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      return { month: m, count: map[m] || 0 };
    });
    return this.ok(result);
  }

  /** 某月各教师上课节数 */
  @Get('/lessonsByTeacher', { summary: '某月各教师上课节数' })
  async lessonsByTeacher(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = year || new Date().getFullYear().toString();
    const m = month || String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m.padStart(2, '0')}`;

    const rows = await this.scheduleEntity
      .createQueryBuilder('s')
      .select('s.teacherName', 'teacherName')
      .addSelect('COUNT(*)', 'count')
      .where("s.scheduleDate LIKE :prefix", { prefix: `${prefix}%` })
      .andWhere('s.status = 1')
      .andWhere("s.teacherName IS NOT NULL AND s.teacherName != ''")
      .groupBy('s.teacherName')
      .orderBy('count', 'DESC')
      .getRawMany();

    return this.ok(rows.map(r => ({ teacherName: r.teacherName, count: Number(r.count) })));
  }

  /** 某月各学生上课节数 */
  @Get('/lessonsByStudent', { summary: '某月各学生上课节数' })
  async lessonsByStudent(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const y = year || new Date().getFullYear().toString();
    const m = month || String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `${y}-${m.padStart(2, '0')}`;

    const rows = await this.scheduleEntity
      .createQueryBuilder('s')
      .leftJoin(MusicStudentEntity, 'st', 'st.id = s.studentId')
      .leftJoin(UserInfoEntity, 'u', 'u.id = st.userId')
      .select('s.studentId', 'studentId')
      .addSelect('COALESCE(u.nickName, st.studentNo)', 'studentName')
      .addSelect('COUNT(*)', 'count')
      .where("s.scheduleDate LIKE :prefix", { prefix: `${prefix}%` })
      .andWhere('s.status = 1')
      .groupBy('s.studentId')
      .addGroupBy('u.nickName')
      .addGroupBy('st.studentNo')
      .orderBy('count', 'DESC')
      .getRawMany();

    return this.ok(rows.map(r => ({ studentName: r.studentName || r.studentId, count: Number(r.count) })));
  }

  /** 汇总统计（本月/本年节数、学员数、教师数） */
  @Get('/summary', { summary: '汇总统计' })
  async summary() {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthPrefix = `${year}-${month}`;

    const [monthCount, yearCount, studentCount, teacherCount] = await Promise.all([
      this.scheduleEntity.createQueryBuilder('s')
        .where("s.scheduleDate LIKE :p", { p: `${monthPrefix}%` })
        .andWhere('s.status = 1')
        .getCount(),
      this.scheduleEntity.createQueryBuilder('s')
        .where("s.scheduleDate LIKE :p", { p: `${year}-%` })
        .andWhere('s.status = 1')
        .getCount(),
      this.studentEntity.count(),
      this.scheduleEntity.createQueryBuilder('s')
        .select('COUNT(DISTINCT s.teacherName)', 'cnt')
        .where("s.teacherName IS NOT NULL AND s.teacherName != ''")
        .getRawOne().then(r => Number(r?.cnt || 0)),
    ]);

    return this.ok({ monthCount, yearCount, studentCount, teacherCount });
  }
}
