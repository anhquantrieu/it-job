const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CVSubmission',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
  },
  message: {
    type: String,
    required: true,
  },
  isReadByRecruiter: {
    type: Boolean,
    default: false,
  },
  isReadByUser: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending' ,'seen', 'not_suitable', 'suitable'],
    default: 'pending',
  },
  responseTime: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', NotificationSchema);

