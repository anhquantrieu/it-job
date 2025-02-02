const express = require('express');
const { register, login, refreshToken, getUsers, getCurrentUser, updateAvatar, updateUser, getSavedJobs, saveJob, getSavedJobIds } = require('../controllers/authController');
const { uploadFile } = require("../controllers/uploadController");
const router = express.Router();
const upload = require("../middlewares/multer");
const {authenticate} = require("../middlewares/authMiddleware");

router.get('/', getUsers);
router.put('/', authenticate, updateUser);
router.get('/current-user', authenticate, getCurrentUser);
router.get('/save-jobs', authenticate, getSavedJobs);
router.get('/save-job-ids', authenticate, getSavedJobIds);
router.post('/register', upload.single("file"),  register);
router.post('/avatar', authenticate, upload.single("file"),  updateAvatar);
router.post('/save-job', authenticate,  saveJob);
router.post('/login', login);
router.post("/refresh-token", refreshToken);
router.post("/upload", upload.single("file"), uploadFile); 
module.exports = router;
