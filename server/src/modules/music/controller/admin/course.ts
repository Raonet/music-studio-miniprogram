import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MusicCourseEntity } from '../../entity/course';
import { BaseSysRoleEntity } from '../../../base/entity/sys/role';
import { BaseSysUserEntity } from '../../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../../base/entity/sys/user_role';

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
  @InjectEntityModel(BaseSysRoleEntity)
  sysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  sysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  sysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  /** 获取 teacher 角色账号列表（没有角色则自动创建） */
  @Get('/teacherUsers', { summary: '教师账号列表（用于选择器）' })
  async teacherUsers() {
    // 获取或创建 teacher 角色
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

    // 查找该角色下的用户
    const userRoles = await this.sysUserRoleEntity.findBy({ roleId: Equal(role.id) });
    if (!userRoles.length) return this.ok([]);

    const userIds = userRoles.map(r => r.userId);
    const users = await this.sysUserEntity
      .createQueryBuilder('u')
      .where('u.id IN (:...ids)', { ids: userIds })
      .select(['u.id AS id', 'u.name AS name', 'u.phone AS phone'])
      .getRawMany();

    const data = users.map(u => ({
      id: u.id,
      label: u.name || u.phone,
      name: u.name,
    }));
    return this.ok(data);
  }
}
