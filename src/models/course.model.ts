import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { User } from './user.model';
import { Enrollment } from './enrollment.model';
import { EmailBroadcast } from './emailBroadcast.model';

@Table
export class Course extends Model {
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, primaryKey: true })
  id!: string;

  @Column
  title!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column({ type: DataType.FLOAT, defaultValue: 0 })
  price!: number;

  @Column
  demoVideoUrl!: string;

  @Column({ defaultValue: false })
  published!: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID })
  teacherId!: string;

  @BelongsTo(() => User)
  teacher!: User;

  @HasMany(() => Enrollment)
  enrollments!: Enrollment[];

  @HasMany(() => EmailBroadcast)
  broadcasts!: EmailBroadcast[];
}
