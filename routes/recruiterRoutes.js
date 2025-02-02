const express = require("express");
const router = express.Router();
const recruiterController = require("../controllers/recruiterController");
const upload = require("../middlewares/multer");
router.post("/", upload.single("file") ,recruiterController.createRecruiter);
router.get("/", recruiterController.getAllRecruiters);
router.get("/:id", recruiterController.getRecruiterById);
router.put("/:id", recruiterController.updateRecruiter);
router.delete("/:id", recruiterController.deleteRecruiter);

module.exports = router;
