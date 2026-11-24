// controllers/orderController.js
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Enroll the logged-in student in a course
// @route   POST /api/orders/create
// No payment gateway is involved: access is granted immediately and the
// enrollment is recorded (amount = live offer price, when an offer is running).
exports.createOrder = async (req, res) => {
  const { courseId } = req.body;

  if (!courseId) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const alreadyEnrolled = course.enrolledStudents.some(
    (studentId) => studentId.toString() === req.user._id.toString()
  );
  if (alreadyEnrolled) {
    return res.status(400).json({ message: 'Already enrolled in this course' });
  }

  const amount = course.getEffectivePrice();
  const isFree = amount === 0;

  const order = await Order.create({
    student: req.user._id,
    course: course._id,
    amount,
    status: 'paid',
    paymentMethod: isFree ? 'free' : 'offline',
  });

  await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: req.user._id } });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: courseId } });

  res.status(201).json({
    message: isFree ? 'Enrolled successfully (free course)' : 'Enrollment confirmed successfully!',
    enrolled: true,
    free: isFree,
    orderId: order._id,
    courseName: course.title,
    amount,
  });
};

// @desc    Get all enrollments (admin)
// @route   GET /api/orders
exports.getOrders = async (req, res) => {
  const orders = await Order.find({ status: 'paid' })
    .populate('student', 'name email')
    .populate('course', 'title price offerPrice')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// @desc    Get my enrollments (student)
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  const orders = await Order.find({ student: req.user._id })
    .populate('course', 'title thumbnail price offerPrice')
    .sort({ createdAt: -1 });
  res.json(orders);
};
