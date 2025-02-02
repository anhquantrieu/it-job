const express = require("express");
const router = express.Router();
const {authenticate} = require("../middlewares/authMiddleware");
const {getNotificationByRecruiter, getNotificationByUser, markAllNotificationsAsRead, cvResponse, toggleNotificationAsRead, getNotificationBySubmissionId} = require("../controllers/notificationController");
router.get("/recruiter", authenticate, getNotificationByRecruiter);
router.get("/user", authenticate, getNotificationByUser);
router.patch("/mark-all-read", authenticate, markAllNotificationsAsRead);
router.put("/cv-response/:submissionId", authenticate, cvResponse);
router.put("/toggle-read/:notificationId", authenticate, toggleNotificationAsRead);
router.get("/submission/:submissionId", authenticate, getNotificationBySubmissionId);

module.exports = router;
