const express = require('express');

// Import các routers
const authRoutes = require('./authRoutes');
const jobRoutes = require('./jobRoutes');
const recruiterRoutes = require('./recruiterRoutes');
const jobPostRoutes = require("./jobPostRoutes");
const cvSubmissionRoutes = require("./cvSubmissionRoutes");
const applicationsRoutes = require("./applicationsRoutes");
const notificationRoutes = require("./notificationRoutes");
const conversationRoutes = require("./conversationRoutes");
const messageRoutes = require("./messageRoutes");

// Khởi tạo router
const router = express.Router();


router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/jobs', jobRoutes);
router.use('/api/v1/recruiter', recruiterRoutes);
router.use("/api/v1/job-post", jobPostRoutes);
router.use("/api/v1/submit-cv", cvSubmissionRoutes);
router.use("/api/v1/applications", applicationsRoutes);
router.use("/api/v1/notification", notificationRoutes);
router.use("/api/v1/conversation", conversationRoutes);
router.use("/api/v1/message", messageRoutes);

module.exports = router;
