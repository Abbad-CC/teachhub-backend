import express from 'express';
import { authenticate, isStudent } from '../middlewares/auth.middleware';
import {
  enrollInCourse,
  unenrollFromCourse,
} from '../controllers/enrollment.controller';

const router = express.Router();

router.post('/:courseId', authenticate, isStudent, enrollInCourse);
router.delete('/:courseId', authenticate, isStudent, unenrollFromCourse);

export default router;
