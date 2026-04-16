import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 课时套餐
 */
@Entity('music_package')
export class MusicPackageEntity extends BaseEntity {
  @Index()
  @Column({ comment: '学员ID' })
  studentId: number;

  @Column({ comment: '套餐名称' })
  name: string;

  @Column({ comment: '总课时数', default: 0 })
  totalLessons: number;

  @Column({ comment: '已用课时数', default: 0 })
  usedLessons: number;

  @Column({ comment: '有效期至', type: 'varchar', length: 10, nullable: true })
  expireDate: string;

  @Column({ comment: '状态 0未开始 1进行中 2已结束', default: 1 })
  status: number;
}
