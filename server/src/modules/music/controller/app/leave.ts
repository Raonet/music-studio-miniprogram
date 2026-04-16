import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { MusicLeaveService } from '../../service/leave';

/**
 * 请假 - App
 */
@CoolController()
export class AppMusicLeaveController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  musicLeaveService: MusicLeaveService;

  @Get('/records', { summary: '获取请假记录' })
  async records(@Query('status') status: string) {
    return this.ok(
      await this.musicLeaveService.records(this.ctx.user.id, status)
    );
  }

  @Post('/submit', { summary: '提交请假申请' })
  async submit(@Body() body) {
    return this.ok(await this.musicLeaveService.submit(this.ctx.user.id, body));
  }
}
