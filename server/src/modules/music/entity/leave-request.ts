import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 请假申请
 */
@Entity('music_leave_request')
export class MusicLeaveRequestEntity extends BaseEntity {
  @Index()
  @Column({ comment: '学员ID' })
  studentId: number;

  @Column({ comment: '课程名称' })
  courseName: string;

  @Column({ comment: '请假日期', type: 'varchar', length: 10 })
  leaveDate: string;

  @Column({ comment: '请假原因', type: 'text', nullable: true })
  reason: string;

  @Column({ comment: '状态 0审批中 1已批准 2已拒绝', default: 0 })
  status: number;

  @Column({ comment: '审批备注', nullable: true })
  remark: string;
}
