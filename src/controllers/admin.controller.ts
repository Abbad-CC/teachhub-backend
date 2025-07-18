import { Request, Response } from 'express';
import { Course } from '../models/course.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../models/user.model';
// import { Enrollment } from '../models/enrollment.model';
import { Sequelize } from 'sequelize';


export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const students = await User.findAll({ where: { role: 'student' } });
   

    res.status(200).json({ students});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error });
  }
};

export const getAllTeachers = async (req:AuthRequest, res:Response)=>{
    try {
         const teachers = await User.findAll({ where: { role: 'teacher' } });
        res.status(200).json({teachers})


    } catch (error) {
        res.status(500).json({error:"failed to fetch teachers", details: error})
    }
}


export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }],
    });

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses', details: error });
  }
};


export const toggleStudentStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const student = await User.findOne({ where: { id, role: 'student' } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    student.isActive = isActive;
    await student.save();

    res.status(200).json({ message: `Student ${isActive ? 'enabled' : 'disabled'}`, student });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update student status', details: error });
  }
};


export const toggleTeacherStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;
    console.log("this is status we want of teacher - isActive:", isActive)
  try {
    const teacher = await User.findOne({ where: { id, role: 'teacher' }, include: [Course] });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });


    teacher.isActive = isActive;
       console.log("this is status we created of teacher - isActive:", teacher.isActive)
    await teacher.save();

    // if (!isActive) {
    //   // Unpublish all their courses
    //      console.log("this is status we created of teacher and are now unpublishing courses - isActive:", isActive)
    //   await Course.update({ published: false }, { where: { teacherId: id } });
    // }

    res.status(200).json({ message: `Teacher ${isActive ? 'enabled' : 'disabled'} successfully`, teacher });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update teacher status', details: error });
  }
};


export const unpublishCourse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.published = false;
    await course.save();

    res.status(200).json({ message: 'Course unpublished successfully', course });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish course', details: error });
  }
};


export const publishCourse = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    course.published = true;
    await course.save();

    res.status(200).json({ message: 'Course published successfully', course });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish course', details: error });
  }
};