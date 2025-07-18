import { Sequelize } from 'sequelize-typescript';
import { User } from './user.model';
import { Course } from './course.model';
import { Enrollment } from './enrollment.model';
import { EmailBroadcast } from './emailBroadcast.model';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  models: [User, Course, Enrollment, EmailBroadcast],
  logging: false,
});

// Define associations
User.hasMany(Course, { foreignKey: 'teacherId' });
Course.belongsTo(User, { foreignKey: 'teacherId' });

User.hasMany(Enrollment, { foreignKey: 'studentId' });
Enrollment.belongsTo(User, { foreignKey: 'studentId' });

Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(EmailBroadcast, { foreignKey: 'courseId' });
EmailBroadcast.belongsTo(Course, { foreignKey: 'courseId' });
