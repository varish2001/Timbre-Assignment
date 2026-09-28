const fs = require("fs");
const path = require("path");
const pool = require("../config/db");
const AppError = require("../utils/AppError");

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateAssetId(assetId) {
	if (!UUID_PATTERN.test(assetId)) {
		throw new AppError(400, "Invalid asset ID");
	}
}

async function createAsset(req, res, next) {
	if (!req.file) {
		return next(new AppError(400, "A file is required"));
	}

	try {
		const storagePath = path.posix.join("uploads", req.file.filename);
		const result = await pool.query(
			`INSERT INTO assets (original_name, mime_type, size, storage_path)
			 VALUES ($1, $2, $3, $4)
			 RETURNING id, original_name, mime_type, size, storage_path, created_at`,
			[req.file.originalname, req.file.mimetype, req.file.size, storagePath]
		);

		const asset = result.rows[0];
		asset.size = Number(asset.size);

		return res.status(201).json(asset);
	} catch (error) {
		await fs.promises.unlink(req.file.path).catch(() => {});
		return next(error);
	}
}

async function getAsset(req, res, next) {
	try {
		validateAssetId(req.params.assetId);

		const result = await pool.query(
			`SELECT id, original_name, mime_type, size, storage_path, created_at
			 FROM assets
			 WHERE id = $1`,
			[req.params.assetId]
		);

		if (result.rowCount === 0) {
			throw new AppError(404, "Asset not found");
		}

		const asset = result.rows[0];
		asset.size = Number(asset.size);

		return res.status(200).json(asset);
	} catch (error) {
		return next(error);
	}
}

module.exports = {
	createAsset,
	getAsset,
	validateAssetId,
};
