import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicPackageEntity } from '../../entity/package';
import { MusicStudentEntity } from '../../entity/student';
import { MusicCourseEntity } from '../../entity/course';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 套餐管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list'],
  entity: MusicPackageEntity,
})
export class AdminMusicPackageController extends BaseController {
  @InjectEntityModel(MusicPackageEntity)
  packageEntity: Repository<MusicPackageEntity>;

  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(MusicCourseEntity)
  courseEntity: Repository<MusicCourseEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /** 分页查询，带学员姓名、电话和课程名称 */
  @Post('/page', { summary: '套餐分页列表' })
  // @ts-ignore override with body param
  async page(@Body() body: any) {
    const { page = 1, size = 20, keyWord = '', studentId } = body;
    const skip = (page - 1) * size;

    const qb = this.packageEntity
      .createQueryBuilder('p')
      .leftJoin(MusicStudentEntity, 's', 's.id = p.studentId')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .leftJoin(MusicCourseEntity, 'c', 'c.id = p.courseId')
      .select([
        'p.id AS id',
        'p.studentId AS studentId',
        'p.courseId AS courseId',
        'p.name AS name',
        'p.totalLessons AS totalLessons',
        'p.usedLessons AS usedLessons',
        'p.expireDate AS expireDate',
        'p.status AS status',
        'p.createTime AS createTime',
        'p.updateTime AS updateTime',
        'u.nickName AS nickName',
        'u.phone AS phone',
        'c.name AS courseName',
        'c.price AS coursePrice',
      ]);

    if (studentId) {
      qb.where('p.studentId = :studentId', { studentId: Number(studentId) });
    }
    if (keyWord) {
      qb.andWhere('p.name LIKE :kw', { kw: `%${keyWord}%` });
    }

    const total = await qb.getCount();
    const list = await qb
      .orderBy('p.createTime', 'DESC')
      .skip(skip)
      .take(size)
      .getRawMany();

    const rows = list.map(r => ({
      ...r,
      id: Number(r.id),
      studentId: Number(r.studentId),
      courseId: r.courseId ? Number(r.courseId) : null,
      totalLessons: Number(r.totalLessons),
      usedLessons: Number(r.usedLessons),
      status: Number(r.status),
      coursePrice: r.coursePrice ? Number(r.coursePrice) : null,
    }));

    return this.ok({ list: rows, pagination: { total, page: Number(page), size: Number(size) } });
  }
}
