import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject, Query } from '@midwayjs/core';
import { MusicLessonService } from '../../service/lesson';

/**
 * 课时记录 - App
 */
@CoolController()
export class AppMusicLessonController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  musicLessonService: MusicLessonService;

  @Get('/records', { summary: '获取课时记录列表' })
  async records(@Query('status') status: string) {
    return this.ok(
      await this.musicLessonService.records(this.ctx.user.id, status)
    );
  }
}
