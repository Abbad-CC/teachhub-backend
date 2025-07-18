import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { User } from './user.model';
import { Course } from './course.model';

@Table
export class Enrollment extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  studentId!: string;

  @BelongsTo(() => User)
  student!: User;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID }) 
  courseId!: string;

  @BelongsTo(() => Course)
  course!: Course;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  enrolledAt!: Date;
}
