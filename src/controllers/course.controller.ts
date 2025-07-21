import { Request, Response } from 'express';
import { Course } from '../models/course.model';
import { AuthRequest } from '../middlewares/auth.middleware';
import cloudinary from '../utils/cloudinary';
import { Enrollment } from '../models/enrollment.model';
import { sendBulkEmail } from '../utils/mailer';
import { EmailBroadcast } from '../models/emailBroadcast.model';
import { User } from '../models/user.model';
// import { Enrollment } from '../models/enrollment.model';
import { Sequelize } from 'sequelize';


export const createCourse = async (req: AuthRequest, res: Response) => {
    const { title, description, price } = req.body;
    let demoVideoUrl = req.body.demoVideoUrl || req.body.demoVideo;

    if (!req.body) {
        return res.status(400).json({ error: 'Missing form data in body' });
    }


    try {
        // If video file is uploaded then this will run
        if (req.file) {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', folder: 'teachhub/videos' },
                async (error, result) => {
                    if (error || !result) {
                        return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
                    }

                    console.log("This is running the cloudinary function and this is the demoVideoURL : ", result.secure_url)
                    const course = await Course.create({
                        title,
                        description,
                        price,
                        demoVideoUrl: result.secure_url,
                        teacherId: req.user.userId,
                        published: false,
                    });

                    return res.status(201).json({ message: 'Course created with uploaded video', course });
                }
            );


            stream.end(req.file.buffer);

            return;
        }

        // If no file, but link provided
        const course = await Course.create({
            title,
            description,
            price,
            demoVideoUrl,
            teacherId: req.user.userId,
            published: false,
        });

        res.status(201).json({ message: 'Course created with video link', course });

    } catch (err) {
        res.status(500).json({ error: 'Failed to create course', details: err });
    }
};

// export const editCourse = async (req: AuthRequest, res: Response) => {
//     const { id } = req.params;
//     const { title, description, price } = req.body;
//     let demoVideoUrl = req.body.demoVideoUrl || req.body.demoVideo;

//     try {
//         const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
//         if (!course) {
//             return res.status(404).json({ error: 'Course not found or not owned by you' });
//         }

//         if (req.file) {
//             const stream = cloudinary.uploader.upload_stream(
//                 { resource_type: 'video', folder: 'teachhub/videos' },
//                 async (error, result) => {
//                     if (error || !result) {
//                         return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
//                     }

//                     course.demoVideoUrl = result.secure_url;
//                     course.title = title || course.title;
//                     course.description = description || course.description;
//                     course.price = price || course.price;

//                     await course.save();
//                     return res.status(200).json({ message: 'Course updated with uploaded video', course });
//                 }
//             );

//             // ✅ This is where the actual upload happens
//             stream.end(req.file.buffer);
//             return;
//         }

//         // ✅ If no file uploaded, use link if provided
//         course.demoVideoUrl = demoVideoUrl || course.demoVideoUrl;
//         course.title = title || course.title;
//         course.description = description || course.description;
//         course.price = price || course.price;

//         await course.save();
//         res.status(200).json({ message: 'Course updated', course });
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to edit course', details: err });
//     }
// };

const getPublicIdFromCloudinaryUrl = (url: string): string | null => {
  const regex = /\/videos\/([^/]+)\.\w+$/;
  const match = url.match(regex);
  return match ? `teachhub/videos/${match[1]}` : null;
};

export const editCourse = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, description, price } = req.body;
    let demoVideoUrl = req.body.demoVideoUrl || req.body.demoVideo;

    try {
        const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
        if (!course) {
            return res.status(404).json({ error: 'Course not found or not owned by you' });
        }

        const previousVideoUrl = course.demoVideoUrl;

        if (req.file) {
            const stream = cloudinary.uploader.upload_stream(
                { resource_type: 'video', folder: 'teachhub/videos' },
                async (error, result) => {
                    if (error || !result) {
                        return res.status(500).json({ error: 'Cloudinary upload failed', details: error });
                    }

                    // Delete previous video if it was from Cloudinary
                    if (previousVideoUrl?.includes('res.cloudinary.com')) {
                        const publicId = getPublicIdFromCloudinaryUrl(previousVideoUrl);
                        if (publicId) {
                            await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                        }
                    }

                    // Save new video
                    course.demoVideoUrl = result.secure_url;
                    course.title = title || course.title;
                    course.description = description || course.description;
                    course.price = price || course.price;

                    await course.save();
                    return res.status(200).json({ message: 'Course updated with uploaded video', course });
                }
            );

            stream.end(req.file.buffer);
            return;
        }

        // ✅ If a new demoVideoUrl (text) is provided and it's different from the existing one
        if (demoVideoUrl && demoVideoUrl !== course.demoVideoUrl) {
            // Delete old Cloudinary video if exists
            if (previousVideoUrl?.includes('res.cloudinary.com')) {
                const publicId = getPublicIdFromCloudinaryUrl(previousVideoUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
                }
            }
            course.demoVideoUrl = demoVideoUrl;
        }

        // Update other fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.price = price || course.price;

        await course.save();
        res.status(200).json({ message: 'Course updated', course });
    } catch (err) {
        res.status(500).json({ error: 'Failed to edit course', details: err });
    }
};




// export const deleteCourse = async (req: AuthRequest, res: Response) => {
//     const { id } = req.params;

//     try {
//         const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
//         if (!course) return res.status(404).json({ error: 'Course not found or not owned by you' });

//         await course.destroy();
//         res.status(200).json({ message: 'Course deleted' });
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to delete course', details: err });
//     }
// };


export const deleteCourse = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
        if (!course) return res.status(404).json({ error: 'Course not found or not owned by you' });

        // If demoVideoUrl exists and is a Cloudinary video, delete it
        if (course.demoVideoUrl?.includes('res.cloudinary.com')) {
            const publicId = getPublicIdFromCloudinaryUrl(course.demoVideoUrl);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            }
        }

        await course.destroy();
        res.status(200).json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete course', details: err });
    }
};



export const publishCourse = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
        if (!course) return res.status(404).json({ error: 'Course not found or not owned by you' });

        course.published = true;
        await course.save();

        res.status(200).json({ message: 'Course published' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to publish course', details: err });
    }
};

export const unpublishCourse = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const course = await Course.findOne({ where: { id, teacherId: req.user.userId } });
        if (!course) return res.status(404).json({ error: 'Course not found or not owned by you' });

        //Add Later on!!

        // const enrollmentCount = await Enrollment.count({ where: { courseId } });
        // if (enrollmentCount > 0) {
        //     return res.status(403).json({ error: 'Cannot delete course with enrolled students' });
        // }


        course.published = false;
        await course.save();

        res.status(200).json({ message: 'Course unpublished' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unpublish course', details: err });
    }
};



export const sendBroadcastEmail = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, subject } = req.body;

    if (!message || !subject) {
        return res.status(400).json({ error: 'Message and subject are required' });
    }

    try {
        const course = await Course.findOne({
            where: { id, teacherId: req.user.userId },
            include: [{ model: Enrollment, include: [{ model: User, attributes: ['email'] }] }],
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found or not owned by you' });
        }

        const studentEmails = course.enrollments.map(enroll => enroll.student.email);

        if (studentEmails.length === 0) {
            return res.status(400).json({ error: 'No students enrolled in this course' });
        }

        await sendBulkEmail(
            studentEmails,
            subject,
            message,
            req.user.name,
            req.user.email
        );

        await EmailBroadcast.create({
          courseId: course.id,
          subject,
          message,
        });

        res.status(200).json({ message: 'Broadcast email sent successfully', recipients: studentEmails });

    } catch (err) {
        console.error('Broadcast email failed:', err);
        res.status(500).json({ error: 'Failed to send broadcast email', details: err });
    }
};


export const getBroadcastEmails = async (req: AuthRequest, res: Response) => {
  const { id: courseId } = req.params;

  try {
    // Verify the course belongs to the teacher
    const course = await Course.findOne({
      where: {
        id: courseId,
        
      }
    });

    if (!course) {
      return res.status(403).json({ error: 'course does not exist' });
    }

    // Get all broadcast emails for this course
    const broadcasts = await EmailBroadcast.findAll({
      where: { courseId },
      order: [['sentAt', 'DESC']]
    });

    res.status(200).json({
      message: 'Broadcast emails fetched successfully',
      broadcasts
    });

  } catch (err) {
    console.error('Failed to fetch broadcast emails:', err);
    res.status(500).json({ error: 'Failed to fetch broadcast emails', details: err });
  }
};



// [GET] /api/teacher/courses
export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.findAll({
      where: { teacherId: req.user.userId },
      include: [{ model: Enrollment, include: [{ model: User, attributes: ['id', 'name', 'email'] }] }]
    });

    res.status(200).json({ message: 'Courses retrieved', courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve courses', details: err });
  }
};


// [GET] /api/teacher/courses/:id/students
export const getEnrolledStudents = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const course = await Course.findOne({
      where: { id, teacherId: req.user.userId },
      include: [
        {
          model: Enrollment,
          include: [{ model: User, attributes: ['id' ,'name', 'email'] }]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found or not owned by you' });
    }

    const students = course.enrollments.map((enrollment) => enrollment.student);
    res.status(200).json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get enrolled students', details: err });
  }
};

// [GET] /api/student/courses/all

//this is the sql statements
// SELECT course.*, teacher.name, COUNT(enrollments.id) as studentCount
// FROM courses
// LEFT JOIN users AS teacher ON course.teacherId = teacher.id
// LEFT JOIN enrollments ON enrollments.courseId = course.id
// WHERE published = true
// GROUP BY course.id, teacher.id;


export const getAllPublishedCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.findAll({
      where: { published: true },
      attributes: {
        include: [
          // Add a virtual column for enrolled student count
          [
            Sequelize.fn('COUNT', Sequelize.col('enrollments.id')),
            'studentCount'
          ]
        ]
      },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Enrollment,
          attributes: [] // We don't need full enrollment records, just the count
        }
      ],
      group: ['Course.id', 'teacher.id'], // group by course and teacher for COUNT to work
    });

    res.status(200).json({ message: 'Published courses retrieved', courses });
  } catch (err) {
    console.error('Error fetching published courses:', err);
    res.status(500).json({ error: 'Failed to get courses', details: err });
  }
};



// [GET] /api/student/courses/enrolled
export const getMyEnrolledCourses = async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { studentId: req.user.userId },
      include: [
        {
          model: Course,
          include: [{ model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }]
        }
      ]
    });

    const courses = enrollments.map((enrollment) => enrollment.course);

    res.status(200).json({ message: 'Your enrolled courses', courses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve enrolled courses', details: err });
  }
};
