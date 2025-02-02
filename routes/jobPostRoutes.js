const express = require("express");
const {
    createJobPost,
    getAllJobPosts,
    getJobPostById,
    updateJobPost,
    deleteJobPost,
    getJobPostsRelate
} = require("../controllers/jobPostController");

const router = express.Router();

// Định nghĩa các route
router.post("/", createJobPost);
router.get("/", getAllJobPosts);
router.get("/relate", getJobPostsRelate);
router.get("/:id", getJobPostById);
router.put("/:id", updateJobPost);
router.delete("/:id", deleteJobPost);

module.exports = router;
