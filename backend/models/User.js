// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'faculty', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  phone: { type: String, default: '' },
  isBlocked: { type: Boolean, default: false },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  emailVerificationCode: String,
  emailVerificationCodeExpire: Date,
  emailVerificationCodeAttempts: { type: Number, default: 0 },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const crypto = require('crypto');

const EMAIL_VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash email verification token
userSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(24).toString('hex');

  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// Generate and hash a 6-digit email verification code (OTP)
userSchema.methods.getEmailVerificationCode = function () {
  const verificationCode = crypto.randomInt(100000, 1000000).toString();

  this.emailVerificationCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
  this.emailVerificationCodeExpire = Date.now() + EMAIL_VERIFICATION_CODE_TTL_MS; // 10 minutes
  this.emailVerificationCodeAttempts = 0;

  return verificationCode;
};

// Compare a plain verification code against the stored hash
userSchema.methods.matchEmailVerificationCode = function (code) {
  const hashedCode = crypto.createHash('sha256').update(String(code)).digest('hex');
  return hashedCode === this.emailVerificationCode;
};

// Clear every email-verification artifact once the email is verified/expired
userSchema.methods.clearEmailVerification = function () {
  this.emailVerificationToken = undefined;
  this.emailVerificationExpire = undefined;
  this.emailVerificationCode = undefined;
  this.emailVerificationCodeExpire = undefined;
  this.emailVerificationCodeAttempts = 0;
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
