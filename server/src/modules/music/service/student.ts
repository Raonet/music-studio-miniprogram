import { Init, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { InjectDataSource } from '@midwayjs/typeorm';
import { DataSource, Equal, Repository } from 'typeorm';
import { MusicStudentEntity } from '../entity/student';
import { MusicPackageEntity } from '../entity/package';
import { MusicScheduleEntity } from '../entity/schedule';
import { UserInfoEntity } from '../../user/entity/info';

@Provide()
export class MusicStudentService extends BaseService {
  @InjectEntityModel(MusicStudentEntity)
  studentEntity: Repository<MusicStudentEntity>;

  @InjectEntityModel(MusicPackageEntity)
  packageEntity: Repository<MusicPackageEntity>;

  @InjectEntityModel(MusicScheduleEntity)
  scheduleEntity: Repository<MusicScheduleEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectDataSource()
  dataSource: DataSource;

  @Inject()
  ctx;

  @Init()
  async init() {
    await super.init();
    this.setEntity(this.studentEntity);
    await this._ensureColumns();
  }

  /** 检查并补全各表缺失的列 */
  private async _ensureColumns() {
    // music_student.contactPhone
    const contactPhoneCols = await this.dataSource.query(
      `SHOW COLUMNS FROM music_student LIKE 'contactPhone'`
    );
    if (contactPhoneCols.length === 0) {
      await this.dataSource.query(
        `ALTER TABLE music_student ADD COLUMN contactPhone VARCHAR(255) NULL COMMENT '联系手机号（展示用，不影响登录）'`
      );
    }

    // music_package.courseId
    const courseIdCols = await this.dataSource.query(
      `SHOW COLUMNS FROM music_package LIKE 'courseId'`
    );
    if (courseIdCols.length === 0) {
      await this.dataSource.query(
        `ALTER TABLE music_package ADD COLUMN courseId INT NULL COMMENT '关联课程ID'`
      );
    }

    // music_course.price
    const priceCols = await this.dataSource.query(
      `SHOW COLUMNS FROM music_course LIKE 'price'`
    );
    if (priceCols.length === 0) {
      await this.dataSource.query(
        `ALTER TABLE music_course ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '课时费（元）'`
      );
    }
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

    // 获取用户基本信息
    const userInfo = await this.userInfoEntity.findOneBy({ id: Equal(userId) });

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
      // 用户基本信息
      nickName: userInfo?.nickName || '',
      contactPhone: userInfo?.phone || student.contactPhone || '',
      gender: userInfo?.gender ?? 0,
      avatarUrl: userInfo?.avatarUrl || '',
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
