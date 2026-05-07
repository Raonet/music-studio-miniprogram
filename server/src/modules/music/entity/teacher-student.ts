import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 教师-学员关联
 */
@Entity('music_teacher_student')
export class MusicTeacherStudentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '教师 sys_user.id' })
  teacherUserId: number;

  @Index()
  @Column({ comment: '学员 music_student.id' })
  studentId: number;
}
