import { CoolController, BaseController } from '@cool-midway/core';
import { MusicCourseEntity } from '../../entity/course';

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
export class AdminMusicCourseController extends BaseController {}
