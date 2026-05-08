import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicPackageEntity } from '../../entity/package';
import { MusicStudentEntity } from '../../entity/student';
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

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /** 分页查询，带学员姓名和电话 */
  @Post('/page', { summary: '套餐分页列表' })
  // @ts-ignore override with body param
  async page(@Body() body: any) {
    const { page = 1, size = 20, keyWord = '', studentId } = body;
    const skip = (page - 1) * size;

    const qb = this.packageEntity
      .createQueryBuilder('p')
      .leftJoin(MusicStudentEntity, 's', 's.id = p.studentId')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .select([
        'p.id AS id',
        'p.studentId AS studentId',
        'p.name AS name',
        'p.totalLessons AS totalLessons',
        'p.usedLessons AS usedLessons',
        'p.expireDate AS expireDate',
        'p.status AS status',
        'p.createTime AS createTime',
        'p.updateTime AS updateTime',
        'u.nickName AS nickName',
        'u.phone AS phone',
      ]);

    if (studentId) {
      qb.where('p.studentId = :studentId', { studentId: Number(studentId) });
    }
    if (keyWord) {
      const clause = studentId
        ? 'AND p.name LIKE :kw'
        : 'p.name LIKE :kw';
      qb.andWhere('p.name LIKE :kw', { kw: `%${keyWord}%` });
    }

    const total = await qb.getCount();
    const list = await qb
      .orderBy('p.createTime', 'DESC')
      .skip(skip)
      .take(size)
      .getRawMany();

    // 转换数字类型
    const rows = list.map(r => ({
      ...r,
      id: Number(r.id),
      studentId: Number(r.studentId),
      totalLessons: Number(r.totalLessons),
      usedLessons: Number(r.usedLessons),
      status: Number(r.status),
    }));

    return this.ok({ list: rows, pagination: { total, page: Number(page), size: Number(size) } });
  }
}
