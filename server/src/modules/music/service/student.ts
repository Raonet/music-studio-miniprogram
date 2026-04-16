import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MusicStudentEntity } from '../entity/student';
import { MusicPackageEntity } from '../entity/package';
import { MusicScheduleEntity } from '../entity/schedule';

@Provide()
export class MusicStudentService extends BaseService {
  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(MusicPackageEntity)
  packageEntity: Repository<MusicPackageEntity>;

  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  @Inject()
  ctx;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.studentEntity);
  }

  /**
   * 获取或创建学员记录
   */
  async getOrCreate(userId: number): Promise<MusicStudentEntity> {
    let student = await this.studentEntity.findOneBy({ userId });
    if (!student) {
      const count = await this.studentEntity.count();
      const studentNo = `MU-${new Date().getFullYear()}${String(count + 1).padStart(4, '0')}`;
      student = await this.studentEntity.save({ userId, studentNo, specialty: '' });
    }
    return student;
  }

  /**
   * 获取学员个人信息（含套餐和统计）
   */
  async profile(userId: number) {
    const student = await this.getOrCreate(userId);

    // 获取进行中的套餐
    const pkg = await this.packageEntity.findOne({
      where: { studentId: student.id, status: 1 },
      order: { createTime: 'DESC' },
    });

    const totalLessons = pkg?.totalLessons || 0;
    const usedLessons = pkg?.usedLessons || 0;
    const remainingLessons = totalLessons - usedLessons;

    return {
      studentNo: student.studentNo,
      specialty: student.specialty,
      totalLessons,
      usedLessons,
      remainingLessons,
      package: pkg
        ? {
            name: pkg.name,
            totalLessons: pkg.totalLessons,
            usedLessons: pkg.usedLessons,
            expireDate: pkg.expireDate,
            status: pkg.status,
          }
        : null,
    };
  }
}
