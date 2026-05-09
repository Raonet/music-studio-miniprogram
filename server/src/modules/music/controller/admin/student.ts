import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MusicStudentEntity } from '../../entity/student';
import { UserInfoEntity } from '../../../user/entity/info';
import { UserLoginService } from '../../../user/service/login';

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

  @Inject()
  userLoginService: UserLoginService;

  /** 分页查询，带用户信息 */
  @Post('/page', { summary: '学员分页列表' })
  // @ts-ignore override with body param
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

    const rows = list.map(r => ({
      ...r,
      id: Number(r.id),
      userId: Number(r.userId),
    }));

    return this.ok({ list: rows, pagination: { total, page: Number(page), size: Number(size) } });
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
        id: Number(s.id),
        label: `${s.nickName || s.phone || s.studentNo}${s.specialty ? '（' + s.specialty + '）' : ''}`,
        specialty: s.specialty,
      }))
    );
  }

  /** 小程序用户列表（用于关联选择器）：只返回未被其他学员绑定的用户 */
  @Post('/userList', { summary: '小程序用户列表' })
  async userList(@Body() body: any) {
    const currentStudentId = body?.studentId ? Number(body.studentId) : null;

    // 找到已被绑定的 userId（排除当前编辑的学员自身）
    const boundQb = this.studentEntity
      .createQueryBuilder('s')
      .select('s.userId', 'userId')
      .where('s.userId IS NOT NULL');
    if (currentStudentId) {
      boundQb.andWhere('s.id != :id', { id: currentStudentId });
    }
    const boundRows = await boundQb.getRawMany();
    const boundUserIds = boundRows.map(r => Number(r.userId)).filter(Boolean);

    const qb = this.userInfoEntity
      .createQueryBuilder('u')
      .select(['u.id', 'u.nickName', 'u.avatarUrl', 'u.phone'])
      .where('u.status = 1');

    if (boundUserIds.length > 0) {
      qb.andWhere('u.id NOT IN (:...boundIds)', { boundIds: boundUserIds });
    }

    const users = await qb.orderBy('u.id', 'DESC').getMany();

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

  /** 新增学员，校验 userId 唯一，并同步创建系统用户 */
  @Post('/add', { summary: '新增学员' })
  // @ts-ignore
  async add(@Body() body: any) {
    if (body.userId) {
      const exists = await this.studentEntity.findOneBy({ userId: Equal(Number(body.userId)) });
      if (exists) return this.fail('该用户已绑定其他学员记录');
    }
    const result = await this.studentEntity.insert(body);
    // 同步创建系统用户
    if (body.userId) {
      await this.userLoginService.syncSysUserByAppUserId(Number(body.userId)).catch(() => null);
    }
    return this.ok(result.identifiers[0]);
  }

  /** 编辑学员，校验 userId 唯一，并同步创建系统用户 */
  @Post('/update', { summary: '编辑学员' })
  // @ts-ignore
  async update(@Body() body: any) {
    if (body.userId && body.id) {
      const exists = await this.studentEntity
        .createQueryBuilder('s')
        .where('s.userId = :userId AND s.id != :id', { userId: Number(body.userId), id: Number(body.id) })
        .getOne();
      if (exists) return this.fail('该用户已绑定其他学员记录');
    }
    await this.studentEntity.update(body.id, body);
    // 同步创建系统用户
    if (body.userId) {
      await this.userLoginService.syncSysUserByAppUserId(Number(body.userId)).catch(() => null);
    }
    return this.ok();
  }
}
