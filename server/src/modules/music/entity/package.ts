import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 学员课时记录
 */
@Entity('music_package')
export class MusicPackageEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '学员ID' })
  studentId: number;

  @Column({ comment: '剩余课时数', default: 0 })
  totalLessons: number;

  @Column({ comment: '已用课时数', default: 0 })
  usedLessons: number;
}
