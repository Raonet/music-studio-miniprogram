import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Put } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicPackageEntity } from '../../entity/package';
import { MusicStudentEntity } from '../../entity/student';

/**
 * 课时管理 - Admin
 */
@CoolController({
  api: ['delete', 'info', 'list', 'page'],
  entity: MusicPackageEntity,
  pageQueryOp: {
    keyWordLikeFields: [],
    fieldEq: ['a.studentId'],
  },
})
export class AdminMusicPackageController extends BaseController {
  @InjectEntityModel(MusicPackageEntity)
  packageEntity: Repository<MusicPackageEntity>;

  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  /** 给所有学员补全课时记录（页面加载时调用） */
  @Get('/ensureAll', { summary: '初始化所有学员课时记录' })
  async ensureAll() {
    const students = await this.studentEntity.find({ select: ['id'] });
    for (const s of students) {
      const exists = await this.packageEntity.findOne({ where: { studentId: s.id } });
      if (!exists) {
        await this.packageEntity.save({ studentId: s.id, totalLessons: 0, usedLessons: 0 });
      }
    }
    return this.ok();
  }

  /** 只允许修改剩余课时 */
  @Put('/update', { summary: '修改课时' })
  async update(@Body('id') id: number, @Body('totalLessons') totalLessons: number) {
    if (id === undefined || totalLessons === undefined) {
      return this.fail('参数错误');
    }
    await this.packageEntity.update({ id }, { totalLessons });
    return this.ok();
  }
}
