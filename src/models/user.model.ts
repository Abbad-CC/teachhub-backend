import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Course } from './course.model';
import { Enrollment } from './enrollment.model';

@Table
export class User extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @Column
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column
  password!: string;

  @Column({ type: DataType.ENUM('student', 'teacher', 'admin') })
  role!: 'student' | 'teacher' | 'admin';

  @Column({ defaultValue: true })
  isActive!: boolean;

  @HasMany(() => Course)
  courses!: Course[];

  @HasMany(() => Enrollment, 'studentId')
  enrollments!: Enrollment[];
}
