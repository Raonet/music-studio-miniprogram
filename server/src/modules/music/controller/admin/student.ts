import { CoolController, BaseController } from '@cool-midway/core';
import { MusicStudentEntity } from '../../entity/student';

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
export class AdminMusicStudentController extends BaseController {}
