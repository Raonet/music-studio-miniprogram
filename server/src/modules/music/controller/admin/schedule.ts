import { CoolController, BaseController } from '@cool-midway/core';
import { MusicScheduleEntity } from '../../entity/schedule';

/**
 * 排课管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicScheduleEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.courseName', 'a.teacherName'],
    fieldEq: ['a.studentId', 'a.status'],
    fieldLike: ['a.scheduleDate'],
  },
})
export class AdminMusicScheduleController extends BaseController {}
