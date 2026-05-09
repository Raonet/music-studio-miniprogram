import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Put } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MusicCourseEntity } from '../../entity/course';
import { BaseSysRoleEntity } from '../../../base/entity/sys/role';
import { BaseSysUserEntity } from '../../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../../base/entity/sys/user_role';
import { MusicTeacherService } from '../../service/teacher';

/**
 * 课程管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicCourseEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.name', 'a.teacherName'],
    fieldEq: ['a.status'],
  },
})
export class AdminMusicCourseController extends BaseController {
  @InjectEntityModel(MusicCourseEntity)
  courseEntity: Repository<MusicCourseEntity>;

  @InjectEntityModel(BaseSysRoleEntity)
  sysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  sysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  sysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @Inject()
  musicTeacherService: MusicTeacherService;

  /** 新增课程，教师角色强制锁定自己为教师 */
  @Post('/add', { summary: '新增课程' })
  // @ts-ignore override with body param
  async add(@Body() body: any) {
    if (await this.musicTeacherService.isTeacher()) {
      body.teacherName = await this.musicTeacherService.getTeacherName();
      body.teacherAvatar = body.teacherName?.charAt(0) || '';
    }
    const result = await this.courseEntity.insert(body);
    return this.ok(result.identifiers[0]);
  }

  /** 编辑课程，教师角色强制锁定自己为教师 */
  @Post('/update', { summary: '编辑课程' })
  // @ts-ignore override with body param
  async update(@Body() body: any) {
    if (await this.musicTeacherService.isTeacher()) {
      body.teacherName = await this.musicTeacherService.getTeacherName();
      body.teacherAvatar = body.teacherName?.charAt(0) || '';
    }
    await this.courseEntity.update(body.id, body);
    return this.ok();
  }

  /** 获取 teacher 角色账号列表（没有角色则自动创建） */
  @Get('/teacherUsers', { summary: '教师账号列表（用于选择器）' })
  async teacherUsers() {
    let role = await this.sysRoleEntity.findOneBy({ label: Equal('teacher') });
    if (!role) {
      const result = await this.sysRoleEntity.insert({
        name: '教师',
        label: 'teacher',
        remark: '授课教师',
        relevance: false,
        menuIdList: [],
        departmentIdList: [],
        userId: '1',
      });
      role = await this.sysRoleEntity.findOneBy({ id: result.identifiers[0].id });
    }

    const userRoles = await this.sysUserRoleEntity.findBy({ roleId: Equal(role.id) });
    if (!userRoles.length) return this.ok([]);

    const userIds = userRoles.map(r => r.userId);
    const users = await this.sysUserEntity
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids: userIds })
      .select(['u.id AS id', 'u.name AS name', 'u.phone AS phone'])
      .getRawMany();

    return this.ok(users.filter(u => u.name).map(u => ({ id: Number(u.id), label: u.name || u.phone, name: u.name })));
  }
}

