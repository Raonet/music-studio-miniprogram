import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicStudentEntity } from '../../entity/student';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 学员管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list'],
  entity: MusicStudentEntity,
})
export class AdminMusicStudentController extends BaseController {
  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  /** 分页查询，带用户信息 */
  @Post('/page', { summary: '学员分页列表' })
  async page(@Body() body: any) {
    const { page = 1, size = 20, keyWord = '' } = body;
    const skip = (page - 1) * size;

    const qb = this.studentEntity
      .createQueryBuilder('s')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .select([
        's.id AS id',
        's.studentNo AS studentNo',
        's.specialty AS specialty',
        's.userId AS userId',
        's.createTime AS createTime',
        'u.nickName AS nickName',
        'u.avatarUrl AS avatarUrl',
        'u.phone AS phone',
      ]);

    if (keyWord) {
      qb.where('s.studentNo LIKE :kw OR s.specialty LIKE :kw', { kw: `%${keyWord}%` });
    }

    const total = await qb.getCount();
    const list = await qb.orderBy('s.createTime', 'DESC').skip(skip).take(size).getRawMany();

    return this.ok({ list, pagination: { total, page: Number(page), size: Number(size) } });
  }

  /** 学员选择器数据：返回 { id(student.id), label(姓名/手机), specialty } */
  @Get('/studentUsers', { summary: '学员账号列表（用于选择器）' })
  async studentUsers() {
    const students = await this.studentEntity
      .createQueryBuilder('s')
      .leftJoin(UserInfoEntity, 'u', 'u.id = s.userId')
      .select([
        's.id AS id',
        's.studentNo AS studentNo',
        's.specialty AS specialty',
        'u.nickName AS nickName',
        'u.phone AS phone',
      ])
      .getRawMany();

    return this.ok(
      students.map(s => ({
        id: s.id,
        label: `${s.nickName || s.phone || s.studentNo}${s.specialty ? '（' + s.specialty + '）' : ''}`,
        specialty: s.specialty,
      }))
    );
  }

  /** 小程序用户列表（用于关联选择器） */
  @Get('/userList', { summary: '小程序用户列表' })
  async userList() {
    const users = await this.userInfoEntity
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickName', 'u.avatarUrl', 'u.phone'])
      .where('u.status = 1')
      .orderBy('u.id', 'DESC')
      .getMany();

    return this.ok(
      users.map(u => ({
        id: u.id,
        nickName: u.nickName || u.phone || `用户${u.id}`,
        avatarUrl: u.avatarUrl || '',
        phone: u.phone || '',
        label: `${u.nickName || '用户' + u.id}${u.phone ? '  ' + u.phone : ''}`,
      }))
    );
  }
}
