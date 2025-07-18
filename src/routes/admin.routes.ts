import express from 'express';
import { adminLogin } from '../controllers/auth.controller';
import {
  getAllStudents,
  getAllTeachers,
  getAllCourses,
  toggleStudentStatus,
  toggleTeacherStatus,
  unpublishCourse,
  publishCourse,
} from '../controllers/admin.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';



const router = express.Router();

router.post('/login', adminLogin); // admin login only

// Get all students 
router.get('/users/students', authenticate, isAdmin, getAllStudents);

router.get('/users/teachers', authenticate, isAdmin, getAllTeachers);

// Get all courses
router.get('/courses', authenticate, isAdmin, getAllCourses);

// Enable/disable a student
router.patch('/student/:id/status', authenticate, isAdmin, toggleStudentStatus);

// Enable/disable a teacher (also unpublishes their courses if disabled)
router.patch('/teacher/:id/status', authenticate, isAdmin, toggleTeacherStatus);

// Unpublish a specific course
router.patch('/course/:id/unpublish', authenticate, isAdmin, unpublishCourse);

router.patch('/course/:id/publish', authenticate, isAdmin, publishCourse);


export default router;


