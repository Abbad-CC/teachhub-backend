import { Request, Response } from 'express';
import { Enrollment } from '../models/enrollment.model';
import { Course } from '../models/course.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findByPk(courseId);
    if (!course || !course.published) {
      return res.status(404).json({ error: 'Course not found or not published' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      where: { courseId, studentId: req.user.userId },
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      courseId,
      studentId: req.user.userId,
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    res.status(500).json({ error: 'Enrollment failed', details: err });
  }
};

export const unenrollFromCourse = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;

  try {
    const enrollment = await Enrollment.findOne({
      where: { courseId, studentId: req.user.userId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await enrollment.destroy();
    res.status(200).json({ message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unenroll', details: err });
  }
};
