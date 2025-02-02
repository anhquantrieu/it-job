const express = require("express");
const router = express.Router();
const cvSubmissionController = require("../controllers/CVSubmissionController");
const upload = require("../middlewares/multer");
const {authenticate} = require("../middlewares/authMiddleware");

router.post("/", upload.single("file"), authenticate , cvSubmissionController.submitCV);
router.put("/:id", authenticate ,cvSubmissionController.updateSubmitCV);
router.get("/check-submit-cv/:id", authenticate ,cvSubmissionController.checkAndGetLatestSubmission);
router.get("/", cvSubmissionController.getCVSubmissions);
router.get("/latest",authenticate, cvSubmissionController.getCVLatest);
router.get("/user",authenticate, cvSubmissionController.getCVByUser);
router.get("/recruiter",authenticate, cvSubmissionController.getCVByCruiter);
router.get("/recruiters",authenticate, cvSubmissionController.getRecruiterSubmissions);
router.get("/applicants",authenticate, cvSubmissionController.getApplicantSubmissions);

module.exports = router;
