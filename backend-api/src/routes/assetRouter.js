const express = require("express");
const assetController = require("../controllers/assetController");
const jobController = require("../controllers/jobController");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/", upload.single("file"), assetController.createAsset);
router.get("/:assetId/jobs", jobController.listAssetJobs);
router.post("/:assetId/process", jobController.createJob);
router.get("/:assetId", assetController.getAsset);

module.exports = router;
