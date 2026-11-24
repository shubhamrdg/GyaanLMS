// controllers/courseController.js
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const Lecture = require('../models/Lecture');
const Assignment = require('../models/Assignment');
const Feedback = require('../models/Feedback');
const Query = require('../models/Query');
const LiveSession = require('../models/LiveSession');
const fs = require('fs');
const path = require('path');

// Parse + validate the pricing/offer fields coming from multipart form data.
// Returns { error } when the offer is invalid, otherwise the normalised values.
const parseOfferFields = (body, price) => {
  const rawOfferPrice = body.offerPrice === undefined || body.offerPrice === '' ? 0 : Number(body.offerPrice);
  const offerLabel = (body.offerLabel || '').toString().trim();
  let offerEndsAt = null;

  if (body.offerEndsAt) {
    const parsed = new Date(body.offerEndsAt);
    if (Number.isNaN(parsed.getTime())) {
      return { error: 'Invalid offer end date' };
    }
    offerEndsAt = parsed;
  }

  if (Number.isNaN(rawOfferPrice) || rawOfferPrice < 0) {
    return { error: 'Offer price must be a positive number' };
  }

  if (rawOfferPrice > 0 && rawOfferPrice > Number(price)) {
    return { error: 'Offer price cannot be greater than the course price' };
  }

  return { offerPrice: rawOfferPrice, offerLabel, offerEndsAt };
};

// @desc    Get all published courses
// @route   GET /api/courses
exports.getCourses = async (req, res) => {
  const { page = 1, limit = 10, category, level, search } = req.query;
  const query = { isPublished: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.title = { $regex: search, $options: 'i' };

  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('faculty', 'name avatar')
    .select('-lectures')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({ courses, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @desc    Get all courses (admin)
// @route   GET /api/courses/all
exports.getAllCourses = async (req, res) => {
  const courses = await Course.find()
    .populate('faculty', 'name email')
    .sort({ createdAt: -1 });
  res.json(courses);
};

// @desc    Get single course
// @route   GET /api/courses/:id
exports.getCourse = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('faculty', 'name avatar bio')
    .populate('lectures', 'title description duration order isFree');

  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
};

// @desc    Create course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  console.log("========== CREATE COURSE ==========");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("==================================");
  const { title, description, price, category, level, tags, requirements, whatYouLearn, totalDuration } = req.body;

  const numericPrice = Number(price) || 0;
  const offer = parseOfferFields(req.body, numericPrice);
  if (offer.error) return res.status(400).json({ message: offer.error });

  const course = await Course.create({
    title, description, price: numericPrice, category, level, totalDuration,
    offerPrice: offer.offerPrice,
    offerLabel: offer.offerLabel,
    offerEndsAt: offer.offerEndsAt,
    tags: tags ? JSON.parse(tags) : [],
    requirements: requirements ? JSON.parse(requirements) : [],
    whatYouLearn: whatYouLearn ? JSON.parse(whatYouLearn) : [],
    faculty: req.user._id,
    thumbnail: req.file ? req.file.path : '',
  });

  res.status(201).json(course);
};

// @desc    Update course
// @route   PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  console.log("========== UPDATE COURSE ==========");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("==================================");
  let course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const updates = { ...req.body };
  if (req.file) {
    updates.thumbnail = req.file.path;
  }
  ['tags', 'requirements', 'whatYouLearn'].forEach((key) => {
    if (updates[key]) updates[key] = JSON.parse(updates[key]);
  });

  // Price + offer section (multipart values arrive as strings)
  if (updates.price !== undefined) updates.price = Number(updates.price) || 0;

  if (
    updates.offerPrice !== undefined ||
    updates.offerLabel !== undefined ||
    updates.offerEndsAt !== undefined
  ) {
    const basePrice = updates.price !== undefined ? updates.price : course.price;
    const offer = parseOfferFields(updates, basePrice);
    if (offer.error) return res.status(400).json({ message: offer.error });

    updates.offerPrice = offer.offerPrice;
    updates.offerLabel = offer.offerLabel;
    updates.offerEndsAt = offer.offerEndsAt;
  }

  course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json(course);
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check authorization: only admin or the course faculty can delete
    if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // 1. Delete associated local files (Thumbnail)
    if (course.thumbnail) {
      const thumbnailPath = path.join(__dirname, '..', course.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    // 2. Delete all Lectures and their associated local files
    const lectures = await Lecture.find({ course: course._id });
    for (const lecture of lectures) {
      if (lecture.videoUrl && lecture.videoUrl.startsWith('/uploads')) {
        const videoPath = path.join(__dirname, '..', lecture.videoUrl);
        if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
      }
      if (lecture.pdfUrl && lecture.pdfUrl.startsWith('/uploads')) {
        const pdfPath = path.join(__dirname, '..', lecture.pdfUrl);
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      }
      await lecture.deleteOne();
    }

    // 3. Delete all Assignments and their associated files/submissions
    const assignments = await Assignment.find({ course: course._id });
    for (const assignment of assignments) {
      if (assignment.fileUrl && assignment.fileUrl.startsWith('/uploads')) {
        const assignmentFilePath = path.join(__dirname, '..', assignment.fileUrl);
        if (fs.existsSync(assignmentFilePath)) fs.unlinkSync(assignmentFilePath);
      }
      // Also cleanup submission files if stored locally
      for (const sub of assignment.submissions) {
        if (sub.fileUrl && sub.fileUrl.startsWith('/uploads')) {
          const submissionFilePath = path.join(__dirname, '..', sub.fileUrl);
          if (fs.existsSync(submissionFilePath)) fs.unlinkSync(submissionFilePath);
        }
      }
      await assignment.deleteOne();
    }

    // 4. Delete all Progress records and any legacy certificate files
    const progressRecords = await Progress.find({ course: course._id });
    for (const p of progressRecords) {
      if (p.certificateUrl && p.certificateUrl.startsWith('/uploads')) {
        const certPath = path.join(__dirname, '..', p.certificateUrl);
        if (fs.existsSync(certPath)) fs.unlinkSync(certPath);
      }
      await p.deleteOne();
    }

    // 5. Delete all Feedback, Queries, and Live Sessions
    await Feedback.deleteMany({ course: course._id });
    await Query.deleteMany({ course: course._id });
    await LiveSession.deleteMany({ course: course._id });

    // 6. Remove course ID from all enrolled students' enrolledCourses array
    await User.updateMany(
      { _id: { $in: course.enrolledStudents } },
      { $pull: { enrolledCourses: course._id } }
    );

    // 7. Finally, delete the course itself
    await course.deleteOne();

    res.json({ message: 'Course and all related data (including certificates and files) deleted successfully' });
  } catch (error) {
    console.error('Delete Course Error:', error);
    res.status(500).json({ message: 'Server error while deleting course', error: error.message });
  }
};

// @desc    Get faculty's own courses
// @route   GET /api/courses/my-courses
exports.getMyCourses = async (req, res) => {
  const courses = await Course.find({ faculty: req.user._id })
    .populate('lectures', 'title duration')
    .populate('enrolledStudents', 'name email avatar phone createdAt')
    .sort({ createdAt: -1 });
  res.json(courses);
};

// @desc    Publish/unpublish course
// @route   PUT /api/courses/:id/publish
exports.togglePublish = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  course.isPublished = !course.isPublished;
  await course.save();
  res.json({ message: `Course ${course.isPublished ? 'published' : 'unpublished'}`, isPublished: course.isPublished });
};

// @desc    Add rating to course
// @route   POST /api/courses/:id/rate
exports.rateCourse = async (req, res) => {
  const { rating, review } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const existing = course.ratings.findIndex(r => r.user.toString() === req.user._id.toString());
  if (existing >= 0) {
    course.ratings[existing] = { user: req.user._id, rating, review };
  } else {
    course.ratings.push({ user: req.user._id, rating, review });
  }

  course.calculateAverageRating();
  await course.save();
  res.json({ message: 'Rating submitted', averageRating: course.averageRating });
};

// @desc    Get enrolled students with progress for a course
// @route   GET /api/courses/:id/students-progress
exports.getCourseStudentsWithProgress = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name email avatar phone bio createdAt');
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Verify ownership
  if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const Progress = require('../models/Progress');
  
  const studentsWithProgress = await Promise.all(course.enrolledStudents.map(async (student) => {
    const progress = await Progress.findOne({ student: student._id, course: course._id });
    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      avatar: student.avatar,
      phone: student.phone,
      bio: student.bio,
      joinedAt: student.createdAt,
      progress: progress ? progress.percentage : 0,
      completed: progress ? progress.completed : false,
      lastAccessed: progress ? progress.lastAccessed : null
    };
  }));

  res.json({
    courseTitle: course.title,
    students: studentsWithProgress
  });
};
