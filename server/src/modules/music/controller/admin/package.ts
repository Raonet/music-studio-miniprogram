import { CoolController, BaseController } from '@cool-midway/core';
import { MusicPackageEntity } from '../../entity/package';

/**
 * 课时套餐管理 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicPackageEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.name'],
    fieldEq: ['a.studentId', 'a.status'],
  },
})
export class AdminMusicPackageController extends BaseController {}
