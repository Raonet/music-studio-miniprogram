import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicCourseEntity } from '../../entity/course';

/**
 * 课程列表 - App（用于请假表单选课）
 */
@CoolController()
export class AppMusicCourseController extends BaseController {
  @InjectEntityModel(MusicCourseEntity)
  courseEntity: Repository<MusicCourseEntity>;

  @Get('/list', { summary: '获取课程列表' })
  async list() {
    const courses = await this.courseEntity.find({ where: { status: 1 } });
    return this.ok(courses.map(c => ({ id: c.id, name: c.name, teacherName: c.teacherName })));
  }
}
