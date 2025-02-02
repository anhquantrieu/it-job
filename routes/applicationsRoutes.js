const express = require("express");
const router = express.Router();
const applicationsController = require("../controllers/applicationsController");
router.get("/", applicationsController.getApplicationsByRecruiter);

module.exports = router;
