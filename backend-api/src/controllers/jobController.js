const pool = require("../config/db");
const AppError = require("../utils/AppError");
const { validateAssetId } = require("./assetController");
const jobService = require("../services/jobService");

const ALLOWED_OPERATIONS = ["transcription", "noise_reduction"];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function createJob(req, res, next) {
	try {
		validateAssetId(req.params.assetId);

		const assetResult = await pool.query(
			"SELECT id FROM assets WHERE id = $1",
			[req.params.assetId]
		);

		if (assetResult.rowCount === 0) {
			throw new AppError(404, "Asset not found");
		}

		const operation = req.body && req.body.operation;
		if (!ALLOWED_OPERATIONS.includes(operation)) {
			throw new AppError(400, "Operation must be transcription or noise_reduction");
		}

		const job = await jobService.createJob(req.params.assetId, operation);
		jobService.startSimulatedProcessing(job.id);

		return res.status(202).json(job);
	} catch (error) {
		return next(error);
	}
}

async function getJob(req, res, next) {
	try {
		if (!UUID_PATTERN.test(req.params.jobId)) {
			throw new AppError(400, "Invalid job ID");
		}

		const result = await pool.query(
			`SELECT id, asset_id, operation, status, created_at, completed_at
			 FROM jobs
			 WHERE id = $1`,
			[req.params.jobId]
		);

		if (result.rowCount === 0) {
			throw new AppError(404, "Job not found");
		}

		return res.status(200).json(result.rows[0]);
	} catch (error) {
		return next(error);
	}
}

async function listAssetJobs(req, res, next) {
	try {
		validateAssetId(req.params.assetId);

		const assetResult = await pool.query(
			"SELECT id FROM assets WHERE id = $1",
			[req.params.assetId]
		);

		if (assetResult.rowCount === 0) {
			throw new AppError(404, "Asset not found");
		}

		const jobsResult = await pool.query(
			`SELECT id, operation, status, created_at, completed_at
			 FROM jobs
			 WHERE asset_id = $1
			 ORDER BY created_at DESC`,
			[req.params.assetId]
		);

		return res.status(200).json({
			asset_id: req.params.assetId,
			jobs: jobsResult.rows,
		});
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createJob,
	getJob,
	listAssetJobs,
};
