const express = require("express");
const jobController = require("../controllers/jobController");

const router = express.Router();

router.get("/:jobId", jobController.getJob);

module.exports = router;
