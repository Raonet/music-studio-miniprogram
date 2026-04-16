import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject, Query } from '@midwayjs/core';
import { MusicScheduleService } from '../../service/schedule';

/**
 * 课程表 - App
 */
@CoolController()
export class AppMusicScheduleController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  musicScheduleService: MusicScheduleService;

  @Get('/month', { summary: '获取某月课程' })
  async month(@Query('year') year: number, @Query('month') month: number) {
    return this.ok(
      await this.musicScheduleService.byMonth(this.ctx.user.id, year, month)
    );
  }

  @Get('/next', { summary: '获取下一节课' })
  async next() {
    return this.ok(await this.musicScheduleService.next(this.ctx.user.id));
  }

  @Get('/recent', { summary: '获取近期已上课程' })
  async recent(@Query('limit') limit: number) {
    return this.ok(
      await this.musicScheduleService.recent(this.ctx.user.id, limit || 3)
    );
  }
}
