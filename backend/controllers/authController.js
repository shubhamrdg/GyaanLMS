// controllers/authController.js
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const validatePassword = require('../utils/passwordValidator');
const buildVerificationEmail = require('../utils/verificationEmailTemplate');

// A 6-digit code is short, so limit how many wrong guesses are allowed.
const MAX_VERIFICATION_CODE_ATTEMPTS = 5;
const VERIFICATION_CODE_LENGTH = 6;

// Dev convenience: when SMTP is not configured we still want the code visible
// locally instead of losing it. Never runs in production.
const logVerificationCodeInDevelopment = (email, code, verifyUrl) => {
  if (process.env.NODE_ENV === 'production') return;
  console.warn(`[DEV] Verification code for ${email}: ${code}`);
  console.warn(`[DEV] Verification link for ${email}: ${verifyUrl}`);
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  // Prevent admin self-registration
  const safeRole = role === 'admin' ? 'student' : role || 'student';

  const user = new User({ name, email, password, role: safeRole, isEmailVerified: false });
  const verificationToken = user.getEmailVerificationToken();
  const verificationCode = user.getEmailVerificationCode();
  await user.save();

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;

  const message = buildVerificationEmail({
    name: user.name,
    code: verificationCode,
    verifyUrl,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: `Your GyaanLMS Verification Code: ${verificationCode}`,
      html: message,
    });
  } catch (emailErr) {
    console.error('Failed to send verification email:', emailErr.message);
    logVerificationCodeInDevelopment(user.email, verificationCode, verifyUrl);
  }

  res.status(201).json({
    message: 'Registration successful! A 6-digit verification code has been sent to your email address. Please verify your email before logging in.',
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    requiresVerification: true
  });
};

// @desc    Verify email
// @route   POST /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  user.isEmailVerified = true;
  user.clearEmailVerification();
  await user.save();

  res.status(200).json({
    message: 'Email verified successfully! You can now log in.',
    email: user.email
  });
};

// @desc    Verify email with the 6-digit code sent by email
// @route   POST /api/auth/verify-email-code
exports.verifyEmailCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required' });
  }

  const cleanCode = String(code).trim();
  if (!new RegExp(`^\\d{${VERIFICATION_CODE_LENGTH}}$`).test(cleanCode)) {
    return res.status(400).json({ message: `Verification code must be ${VERIFICATION_CODE_LENGTH} digits` });
  }

  // Emails are stored lowercased, so normalise whatever the user typed
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ message: 'User not found with this email' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified. You can log in.' });
  }

  const codeExpired = !user.emailVerificationCode
    || !user.emailVerificationCodeExpire
    || user.emailVerificationCodeExpire.getTime() < Date.now();

  if (codeExpired) {
    user.clearEmailVerification();
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
  }

  if (user.emailVerificationCodeAttempts >= MAX_VERIFICATION_CODE_ATTEMPTS) {
    user.clearEmailVerification();
    await user.save({ validateBeforeSave: false });
    return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new verification code.' });
  }

  if (!user.matchEmailVerificationCode(cleanCode)) {
    user.emailVerificationCodeAttempts += 1;
    await user.save({ validateBeforeSave: false });

    const attemptsLeft = Math.max(MAX_VERIFICATION_CODE_ATTEMPTS - user.emailVerificationCodeAttempts, 0);
    return res.status(400).json({
      message: attemptsLeft > 0
        ? `Invalid verification code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} left.`
        : 'Invalid verification code. Please request a new one.',
      attemptsLeft,
    });
  }

  user.isEmailVerified = true;
  user.clearEmailVerification();
  await user.save();

  res.status(200).json({
    message: 'Email verified successfully! You can now log in.',
    email: user.email
  });
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found with this email' });
  }

  if (user.isEmailVerified) {
    return res.status(400).json({ message: 'Email is already verified. You can log in.' });
  }

  const verificationToken = user.getEmailVerificationToken();
  const verificationCode = user.getEmailVerificationCode();
  await user.save({ validateBeforeSave: false });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email/${verificationToken}`;

  const message = buildVerificationEmail({
    name: user.name,
    code: verificationCode,
    verifyUrl,
    isResend: true,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: `Your GyaanLMS Verification Code: ${verificationCode}`,
      html: message,
    });
    res.status(200).json({ message: 'A new verification code has been sent. Please check your inbox.' });
  } catch (err) {
    console.error('Failed to resend verification email:', err);
    logVerificationCodeInDevelopment(user.email, verificationCode, verifyUrl);
    res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  if (user.isBlocked) return res.status(403).json({ message: 'Account is blocked. Contact admin.' });
  if (user.isEmailVerified === false) {
    return res.status(403).json({
      message: 'Please verify your email before logging in. Enter the 6-digit verification code we sent to your inbox.',
      requiresVerification: true,
      email: user.email
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

  res.json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar, bio: user.bio, phone: user.phone,
    token: generateToken(user._id),
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id).populate('enrolledCourses', 'title thumbnail price');
  res.json(user);
};

// @desc    Update user profile
// @route   PUT /api/auth/update
exports.updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.name) user.name = req.body.name;
  if (req.body.bio) user.bio = req.body.bio;
  if (req.body.phone) user.phone = req.body.phone;
  if (req.file) user.avatar = req.file.path;
  if (req.body.password) {
    const passwordCheck = validatePassword(req.body.password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ message: passwordCheck.message });
    }
    user.password = req.body.password;
  }

  await user.save();

  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio, phone: user.phone });
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: 'User not found with this email' });
  }

  // Get reset token (unhashed)
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    `;
    
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: 'Email service is not configured on the server. Please contact administrator.' });
    }

    await sendEmail({
      to: user.email,
      subject: 'GyaanLMS Password Reset',
      html: message,
    });
    res.status(200).json({ message: 'Email sent successfully. Please check your inbox.' });
  } catch (err) {
    console.error('Email sending failed:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again later.' });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  // Hash token from URL
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  // Set new password
  const passwordCheck = validatePassword(req.body.password);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }
  
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful' });
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id);

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  // Set new password
  const passwordCheck = validatePassword(req.body.newPassword);
  if (!passwordCheck.isValid) {
    return res.status(400).json({ message: passwordCheck.message });
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({ message: 'Password updated successfully' });
};
