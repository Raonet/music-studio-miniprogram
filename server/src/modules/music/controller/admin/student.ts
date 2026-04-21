import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicStudentEntity } from '../../entity/student';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 学员管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicStudentEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.studentNo', 'a.specialty'],
    fieldEq: ['a.userId'],
  },
})
export class AdminMusicStudentController extends BaseController {
  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

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

    const data = students.map(s => ({
      id: s.id,
      label: `${s.nickName || s.phone || s.studentNo}${s.specialty ? '（' + s.specialty + '）' : ''}`,
      specialty: s.specialty,
    }));
    return this.ok(data);
  }
}
