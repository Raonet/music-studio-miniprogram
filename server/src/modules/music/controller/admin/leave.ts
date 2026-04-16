import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicLeaveRequestEntity } from '../../entity/leave-request';
import { MusicScheduleEntity } from '../../entity/schedule';

/**
 * 请假审批 - Admin
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MusicLeaveRequestEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.courseName'],
    fieldEq: ['a.studentId', 'a.status'],
    fieldLike: ['a.leaveDate'],
  },
})
export class AdminMusicLeaveController extends BaseController {
  @InjectEntityModel(MusicLeaveRequestEntity)
  leaveEntity: Repository<MusicLeaveRequestEntity>;

  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  @Post('/approve', { summary: '批准请假' })
  async approve(@Body('id') id: number, @Body('remark') remark: string) {
    await this.leaveEntity.update(id, { status: 1, remark });

    // 将对应课程标记为已请假
    const leave = await this.leaveEntity.findOneBy({ id });
    if (leave) {
      await this.scheduleEntity.update(
        {
          studentId: leave.studentId,
          scheduleDate: leave.leaveDate,
          courseName: leave.courseName,
        },
        { status: 2 }
      );
    }

    return this.ok();
  }

  @Post('/reject', { summary: '拒绝请假' })
  async reject(@Body('id') id: number, @Body('remark') remark: string) {
    await this.leaveEntity.update(id, { status: 2, remark });
    return this.ok();
  }
}
