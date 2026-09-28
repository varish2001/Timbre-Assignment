const pool = require("../config/db");

const PROCESSING_DELAY_MS = 1000;
const COMPLETION_DELAY_MS = 2000;

async function createJob(assetId, operation) {
	const result = await pool.query(
		`INSERT INTO jobs (asset_id, operation, status)
		 VALUES ($1, $2, 'queued')
		 RETURNING id, asset_id, operation, status, created_at, completed_at`,
		[assetId, operation]
	);

	return result.rows[0];
}

function startSimulatedProcessing(jobId) {
	setTimeout(async () => {
		try {
			await pool.query(
				"UPDATE jobs SET status = 'processing' WHERE id = $1",
				[jobId]
			);
		} catch (error) {
			console.error("Could not update job to processing:", error.message);
			return;
		}

		setTimeout(async () => {
			try {
				await pool.query(
					"UPDATE jobs SET status = 'completed', completed_at = NOW() WHERE id = $1",
					[jobId]
				);
			} catch (error) {
				console.error("Could not complete job:", error.message);
			}
		}, COMPLETION_DELAY_MS);
	}, PROCESSING_DELAY_MS);
}

module.exports = {
	createJob,
	startSimulatedProcessing,
};
