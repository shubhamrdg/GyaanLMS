// controllers/lectureController.js
const Lecture = require('../models/Lecture');
const Course = require('../models/Course');

// @desc    Get single lecture
// @route   GET /api/lectures/:id
exports.getLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
  res.json(lecture);
};

// @desc    Get lectures for a course
// @route   GET /api/lectures/course/:courseId
exports.getLectures = async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.courseId }).sort('order');
  res.json(lectures);
};

// @desc    Create a lecture
// @route   POST /api/lectures
exports.createLecture = async (req, res) => {
  const { title, description, courseId, isFree, order } = req.body;

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  // Video source: uploaded file OR YouTube URL (embedded, plays within the site)
  const getUploadedUrl = (f) => {
    if (!f) return '';
    // CloudinaryStorage gives `path` (full URL); diskStorage gives `filename`
    if (f.path && /^https?:\/\//i.test(f.path)) return f.path;
    if (f.secure_url) return f.secure_url;
    if (f.filename) return `/uploads/videos/${f.filename}`;
    return '';
  };
  const rawYoutube =
    req.body.youtubeUrl ?? req.body.videoUrl ?? req.body.video_url ?? req.body.youtube_url ?? '';
  let videoUrl = '';
  let videoType = 'upload';
  if (req.files?.video?.[0]) {
    videoUrl = getUploadedUrl(req.files.video[0]);
  }
  if (!videoUrl && rawYoutube && String(rawYoutube).trim()) {
    videoUrl = String(rawYoutube).trim();
    // Auto-detect YouTube links so old running code that only reads videoUrl also works
    videoType = /youtu\.?be/i.test(videoUrl) ? 'youtube' : 'upload';
  }

  if (!videoUrl) {
    return res.status(400).json({ message: 'Please provide a video file or a YouTube URL' });
  }

  // PDF: Cloudinary gives `path` (full URL); local disk gives `filename`
  const pdfFile = req.files?.pdf?.[0];
  const pdfUrl = pdfFile
    ? (pdfFile.path && /^https?:\/\//i.test(pdfFile.path)
        ? pdfFile.path
        : pdfFile.secure_url || (pdfFile.filename ? `/uploads/pdfs/${pdfFile.filename}` : ''))
    : '';

  const lecture = await Lecture.create({
    title, description,
    course: courseId,
    videoUrl,
    videoType,
    pdfUrl,
    isFree: isFree === 'true' || isFree === true,
    order: order || 0,
  });

  // Add lecture to course
  await Course.findByIdAndUpdate(courseId, { $push: { lectures: lecture._id } });

  res.status(201).json(lecture);
};

// @desc    Update a lecture
// @route   PUT /api/lectures/:id
exports.updateLecture = async (req, res) => {
  let lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

  const course = await Course.findById(lecture.course);
  if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to update this lecture' });
  }

  const updates = { ...req.body };
  const getUploadedUrl = (f) => {
    if (!f) return '';
    if (f.path && /^https?:\/\//i.test(f.path)) return f.path;
    if (f.secure_url) return f.secure_url;
    if (f.filename) return `/uploads/videos/${f.filename}`;
    return '';
  };
  const getPdfUrl = (f) => {
    if (!f) return '';
    if (f.path && /^https?:\/\//i.test(f.path)) return f.path;
    if (f.secure_url) return f.secure_url;
    if (f.filename) return `/uploads/pdfs/${f.filename}`;
    return '';
  };
  if (req.files?.video?.[0]) {
    updates.videoUrl = getUploadedUrl(req.files.video[0]);
    updates.videoType = 'upload';
  } else if (typeof updates.youtubeUrl === 'string' && updates.youtubeUrl.trim()) {
    updates.videoUrl = updates.youtubeUrl.trim();
    updates.videoType = /youtu\.?be/i.test(updates.videoUrl) ? 'youtube' : 'upload';
  } else if (typeof updates.videoUrl === 'string' && updates.videoUrl.trim()) {
    // videoUrl sent directly (e.g. YouTube link) — accept it, auto-detect type
    if (/youtu\.?be/i.test(updates.videoUrl)) updates.videoType = 'youtube';
  } else if (typeof updates.videoUrl === 'string' && !updates.videoUrl.trim()) {
    // Empty videoUrl from form — drop it so we don't wipe the existing URL / trip required validation
    delete updates.videoUrl;
  }
  delete updates.youtubeUrl;
  delete updates.video_url;
  delete updates.youtube_url;
  if (typeof updates.isFree !== 'undefined') {
    updates.isFree = updates.isFree === 'true' || updates.isFree === true;
  }
  if (req.files?.pdf?.[0]) updates.pdfUrl = getPdfUrl(req.files.pdf[0]);

  lecture = await Lecture.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(lecture);
};

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:id
exports.deleteLecture = async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

  const course = await Course.findById(lecture.course);
  if (course.faculty.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to delete this lecture' });
  }

  await Course.findByIdAndUpdate(lecture.course, { $pull: { lectures: lecture._id } });
  await lecture.deleteOne();

  res.json({ message: 'Lecture deleted' });
};
