import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { MusicTeacherStudentEntity } from '../entity/teacher-student';
import { BaseSysRoleEntity } from '../../base/entity/sys/role';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../base/entity/sys/user_role';

@Provide()
export class MusicTeacherService extends BaseService {
  @InjectEntityModel(MusicTeacherStudentEntity)
  teacherStudentEntity: Repository<MusicTeacherStudentEntity>;

  @InjectEntityModel(BaseSysRoleEntity)
  sysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  sysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  sysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  @Inject()
  ctx;

  /** 判断当前 admin 用户是否是教师角色 */
  async isTeacher(): Promise<boolean> {
    const roleIds: number[] = this.ctx.admin?.roleIds || [];
    if (!roleIds.length) return false;
    const teacherRole = await this.sysRoleEntity.findOneBy({ label: Equal('teacher') });
    if (!teacherRole) return false;
    return roleIds.includes(teacherRole.id);
  }

  /** 获取当前教师的姓名 */
  async getTeacherName(): Promise<string> {
    const userId = this.ctx.admin?.userId;
    if (!userId) return '';
    const user = await this.sysUserEntity.findOneBy({ id: Equal(userId) });
    return user?.name || user?.username || '';
  }

  /** 获取当前教师关联的 studentId 列表 */
  async getMyStudentIds(): Promise<number[]> {
    const userId = this.ctx.admin?.userId;
    if (!userId) return [];
    const relations = await this.teacherStudentEntity.findBy({
      teacherUserId: Equal(userId),
    });
    return relations.map(r => r.studentId);
  }
}
