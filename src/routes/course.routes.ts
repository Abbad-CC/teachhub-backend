import express from 'express';
import {
  createCourse,
  editCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getMyCourses,
  getEnrolledStudents,
  getAllPublishedCourses,
  getMyEnrolledCourses,
  sendBroadcastEmail,
  getBroadcastEmails,
} from '../controllers/course.controller';
import { authenticate, isStudent, isTeacher } from '../middlewares/auth.middleware';
import { videoUpload } from '../middlewares/multer.middleware';


const router = express.Router();

router.post('/', authenticate, isTeacher, videoUpload.single('demoVideo'), createCourse);
router.put('/:id', authenticate, isTeacher, videoUpload.single('demoVideo'), editCourse);
router.delete('/:id', authenticate, isTeacher, deleteCourse);
router.patch('/:id/publish', authenticate, isTeacher, publishCourse);
router.patch('/:id/unpublish', authenticate, isTeacher, unpublishCourse);

router.post('/announcement/send/:id', authenticate, isTeacher, sendBroadcastEmail);
router.get('/announcement/get/:id', authenticate, isTeacher, getBroadcastEmails);

// routes/teacher.routes.ts
router.get('/mycourses', authenticate, isTeacher, getMyCourses);
router.get('/mycourses/:id/students', authenticate, isTeacher, getEnrolledStudents); //no need for this route. 

// routes/student.routes.ts
router.get('/all', getAllPublishedCourses);
router.get('/enrolled', authenticate, isStudent, getMyEnrolledCourses);


export default router;
