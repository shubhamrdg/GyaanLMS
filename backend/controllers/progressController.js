// controllers/progressController.js
const Progress = require('../models/Progress');
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');

// @desc    Update progress (mark lecture complete)
// @route   PUT /api/progress/update
exports.updateProgress = async (req, res) => {
  const { courseId, lectureId } = req.body;

  if (!courseId || !lectureId) {
    return res.status(400).json({ message: 'courseId and lectureId are required' });
  }

  const lecture = await Lecture.findById(lectureId);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

  let progress = await Progress.findOne({ student: req.user._id, course: courseId });

  if (!progress) {
    progress = await Progress.create({ student: req.user._id, course: courseId });
  }

  // ObjectId-safe duplicate check (includes() fails on ObjectId vs string)
  if (!progress.completedLectures.some(id => String(id) === String(lectureId))) {
    progress.completedLectures.push(lectureId);
  }

  // Calculate percentage — count only lectures that still exist in the course
  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  const totalLectures = course.lectures.length;
  const validCompleted = progress.completedLectures.filter(id =>
    course.lectures.some(l => String(l) === String(id))
  ).length;
  progress.percentage = totalLectures > 0
    ? Math.round((validCompleted / totalLectures) * 100)
    : 0;

  progress.completed = progress.percentage === 100;

  progress.lastAccessed = Date.now();
  await progress.save();

  res.json(progress);
};

// @desc    Get progress for a course
// @route   GET /api/progress/:courseId
exports.getProgress = async (req, res) => {
  const progress = await Progress.findOne({
    student: req.user._id,
    course: req.params.courseId
  }).populate('completedLectures', 'title');

  if (!progress) return res.json({ percentage: 0, completedLectures: [], completed: false });
  res.json(progress);
};

// @desc    Get all progress for student
exports.getMyProgress = async (req, res) => {
  const progressList = await Progress.find({ student: req.user._id })
    .populate('course', 'title thumbnail');
  
  // Filter out any entries where the course has been deleted
  const filteredProgress = progressList.filter(p => !!p.course);
  
  res.json(filteredProgress);
};
