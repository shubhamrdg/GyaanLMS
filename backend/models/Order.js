// models/Order.js
const mongoose = require('mongoose');

// Enrollment / transaction record. There is no external payment gateway:
// `paymentMethod` tells whether access was free or collected offline (manual).
const orderSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled'], default: 'paid' },
  paymentMethod: { type: String, enum: ['free', 'offline'], default: 'offline' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
