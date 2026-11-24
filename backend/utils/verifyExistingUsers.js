// utils/verifyExistingUsers.js
// One-time migration: marks the pre-existing/seeded accounts as email-verified.
// This is required because the `isEmailVerified` field was introduced along with
// the email-verification flow, and Mongoose applies its `default: false` when
// loading legacy documents that do not have the field stored in MongoDB.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const SEEDED_EMAILS = [
  'admin@GyaanLMS.com',
  'priya@GyaanLMS.com',
  'rajesh@GyaanLMS.com',
  'rohan@student.com',
  'sneha@student.com',
  'amit@student.com',
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');

  const result = await User.updateMany(
    { email: { $in: SEEDED_EMAILS } },
    { $set: { isEmailVerified: true } }
  );

  const stillUnverified = await User.find({
    email: { $in: SEEDED_EMAILS },
    isEmailVerified: { $ne: true },
  }).select('email');

  console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  console.log(
    stillUnverified.length === 0
      ? '✅ All seeded accounts are now email-verified and can log in.'
      : `⚠️ Still unverified: ${stillUnverified.map(u => u.email).join(', ')}`
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
