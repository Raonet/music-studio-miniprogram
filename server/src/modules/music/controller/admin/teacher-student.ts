import { BaseController, CoolController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MusicTeacherStudentEntity } from '../../entity/teacher-student';
import { MusicStudentEntity } from '../../entity/student';
import { UserInfoEntity } from '../../../user/entity/info';
import { MusicTeacherService } from '../../service/teacher';

/**
 * 教师-学员关联管理 - Admin
 */
@CoolController()
export class AdminMusicTeacherStudentController extends BaseController {
  @InjectEntityModel(MusicTeacherStudentEntity)
  teacherStudentEntity: Repository<MusicTeacherStudentEntity>;

  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  musicTeacherService: MusicTeacherService;

  /** 查询某教师已关联的学员列表 */
  @Get('/list', { summary: '查询教师关联学员' })
  // @ts-ignore override with query param
  async list(@Query('teacherUserId') teacherUserId: number) {
    if (!teacherUserId) return this.ok([]);
    const relations = await this.teacherStudentEntity.findBy({
      teacherUserId: Equal(Number(teacherUserId)),
    });
    if (!relations.length) return this.ok([]);

    const studentIds = relations.map(r => r.studentId);
    const students = await this.studentEntity
      .createQueryBuilder('s')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .select(['s.id AS id', 's.studentNo AS studentNo', 's.specialty AS specialty', 'u.nickName AS nickName', 'u.phone AS phone'])
      .where('s.id IN (:...ids)', { ids: studentIds })
      .getRawMany();

    return this.ok(students.map(s => ({
      id: Number(s.id),
      label: `${s.nickName || s.phone || s.studentNo}${s.specialty ? '（' + s.specialty + '）' : ''}`,
      specialty: s.specialty,
    })));
  }

  /** 绑定教师-学员 */
  @Post('/bind', { summary: '绑定教师学员' })
  async bind(
    @Body('teacherUserId') teacherUserId: number,
    @Body('studentId') studentId: number,
  ) {
    const exists = await this.teacherStudentEntity.findOneBy({
      teacherUserId: Equal(Number(teacherUserId)),
      studentId: Equal(Number(studentId)),
    });
    if (!exists) {
      await this.teacherStudentEntity.insert({ teacherUserId: Number(teacherUserId), studentId: Number(studentId) });
    }
    return this.ok();
  }

  /** 解绑教师-学员 */
  @Post('/unbind', { summary: '解绑教师学员' })
  async unbind(
    @Body('teacherUserId') teacherUserId: number,
    @Body('studentId') studentId: number,
  ) {
    await this.teacherStudentEntity.delete({
      teacherUserId: Equal(Number(teacherUserId)),
      studentId: Equal(Number(studentId)),
    });
    return this.ok();
  }

  /** 当前教师自己的学员列表（用于前端选择器） */
  @Get('/myStudents', { summary: '当前教师的学员列表' })
  async myStudents() {
    const isTeacher = await this.musicTeacherService.isTeacher();
    if (!isTeacher) {
      // 非教师角色返回全量学员
      return this.list(undefined as any);
    }
    const studentIds = await this.musicTeacherService.getMyStudentIds();
    if (!studentIds.length) return this.ok([]);

    const students = await this.studentEntity
      .createQueryBuilder('s')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .select(['s.id AS id', 's.studentNo AS studentNo', 's.specialty AS specialty', 'u.nickName AS nickName', 'u.phone AS phone'])
      .where('s.id IN (:...ids)', { ids: studentIds })
      .getRawMany();

    return this.ok(students.map(s => ({
      id: Number(s.id),
      label: `${s.nickName || s.phone || s.studentNo}${s.specialty ? '（' + s.specialty + '）' : ''}`,
      specialty: s.specialty,
    })));
  }

  /** 当前教师信息（姓名 + 是否教师角色） */
  @Get('/myInfo', { summary: '当前用户教师信息' })
  async myInfo() {
    const isTeacher = await this.musicTeacherService.isTeacher();
    const teacherName = isTeacher ? await this.musicTeacherService.getTeacherName() : '';
    return this.ok({ isTeacher, teacherName });
  }
}
