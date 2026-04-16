import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 音乐学员
 */
@Entity('music_student')
export class MusicStudentEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID' })
  userId: number;

  @Index({ unique: true })
  @Column({ comment: '学员编号', nullable: true })
  studentNo: string;

  @Column({ comment: '专长方向', nullable: true })
  specialty: string;
}
