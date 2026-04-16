import { CoolController, BaseController } from '@cool-midway/core';
import { Get, Inject } from '@midwayjs/core';
import { MusicStudentService } from '../../service/student';

/**
 * 学员信息 - App
 */
@CoolController()
export class AppMusicStudentController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  musicStudentService: MusicStudentService;

  @Get('/profile', { summary: '获取学员个人信息' })
  async profile() {
    return this.ok(await this.musicStudentService.profile(this.ctx.user.id));
  }
}
