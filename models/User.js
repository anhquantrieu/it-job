const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CVSubmission = require('./CVSubmission');

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: {
    type: String,
    trim: true,
    match: [/^\d{10}$/, "Số điện thoại không hợp lệ"],
  },
  companyName: {
    type: String,
    trim: true,
  },
  employeeCount: {
    type: Number,
  },
  website: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
    ],
  },
  description: {
    type: String,
    trim: true,
  },
  logoInfo: {
    url: {
      type: String,
      match: [
        /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
        "URL không hợp lệ",
      ],
    },
    publicId: {
      type: String,
    },
  },
  avatarInfo: {
    url: {
      type: String,
      match: [
        /^(https?:\/\/)?([\w\-])+\.{1}([a-z]{2,63})([\/\w\.\-]*)*\/?$/,
        "URL không hợp lệ",
      ],
    },
    publicId: {
      type: String,
    },
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "recruiter", "admin"],
    default: "user",
  },
  jobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
    },
  ],
  CVSubmissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CVSubmission",
    }
  ],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobPost',
  }]
});

// Hash password trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
