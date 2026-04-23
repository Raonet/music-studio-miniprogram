import { CoolController, BaseController } from '@cool-midway/core';
import { Body, Get, Inject, Post, Put } from '@midwayjs/core';
import { MusicStudentService } from '../../service/student';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoEntity } from '../../../user/entity/info';

/**
 * 学员信息 - App
 */
@CoolController()
export class AppMusicStudentController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  musicStudentService: MusicStudentService;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Get('/profile', { summary: '获取学员个人信息' })
  async profile() {
    return this.ok(await this.musicStudentService.profile(this.ctx.user.id));
  }

  @Put('/updateProfile', { summary: '更新个人信息' })
  async updateProfile(
    @Body('nickName') nickName: string,
    @Body('phone') phone: string,
    @Body('gender') gender: number,
    @Body('avatarUrl') avatarUrl: string,
    @Body('specialty') specialty: string,
  ) {
    const userId = this.ctx.user.id;

    // 更新 user_info
    const updateUser: any = {};
    if (nickName !== undefined) updateUser.nickName = nickName;
    if (phone !== undefined) updateUser.phone = phone;
    if (gender !== undefined) updateUser.gender = gender;
    if (avatarUrl !== undefined) updateUser.avatarUrl = avatarUrl;
    if (Object.keys(updateUser).length > 0) {
      await this.userInfoEntity.update(userId, updateUser);
    }

    // 更新 music_student.specialty
    if (specialty !== undefined) {
      const student = await this.musicStudentService.getOrCreate(userId);
      await this.musicStudentService.studentEntity.update(student.id, { specialty });
    }

    return this.ok();
  }
}
