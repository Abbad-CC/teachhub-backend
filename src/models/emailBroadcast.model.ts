import { Table, Column, Model, ForeignKey, DataType, BelongsTo } from 'sequelize-typescript';
import { Course } from './course.model';

@Table
export class EmailBroadcast extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID }) 
  courseId!: string;

  @BelongsTo(() => Course)
  course!: Course;

  @Column
  subject!: string;

  @Column(DataType.TEXT)
  message!: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  sentAt!: Date;
}
