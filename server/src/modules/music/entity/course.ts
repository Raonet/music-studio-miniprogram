import { BaseEntity } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

/**
 * 课程
 */
@Entity('music_course')
export class MusicCourseEntity extends BaseEntity {
  @Column({ comment: '课程名称' })
  name: string;

  @Column({ comment: '教师姓名', nullable: true })
  teacherName: string;

  @Column({ comment: '教师头像(首字)', length: 4, nullable: true })
  teacherAvatar: string;

  @Column({ comment: '课程时长(分钟)', default: 60 })
  duration: number;

  @Column({ comment: '状态 0禁用 1启用', default: 1 })
  status: number;
}
