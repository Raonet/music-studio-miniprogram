import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 课程安排
 */
@Entity('music_schedule')
export class MusicScheduleEntity extends BaseEntity {
  @Index()
  @Column({ comment: '学员ID' })
  studentId: number;

  @Column({ comment: '课程名称' })
  courseName: string;

  @Column({ comment: '教师姓名', nullable: true })
  teacherName: string;

  @Column({ comment: '教师头像(首字)', length: 4, nullable: true })
  teacherAvatar: string;

  @Column({ comment: '教室', nullable: true })
  room: string;

  @Index()
  @Column({ comment: '上课日期', type: 'varchar', length: 10 })
  scheduleDate: string;

  @Column({ comment: '开始时间', type: 'varchar', length: 5 })
  startTime: string;

  @Column({ comment: '结束时间', type: 'varchar', length: 5 })
  endTime: string;

  @Column({ comment: '状态 0待上课 1已上课 2已请假 3待补课', default: 0 })
  status: number;
}
