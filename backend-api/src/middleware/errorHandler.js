const multer = require("multer");
const AppError = require("../utils/AppError");

function errorHandler(error, req, res, next) {
	if (res.headersSent) {
		return next(error);
	}

	if (error instanceof multer.MulterError) {
		const message = error.code === "LIMIT_FILE_SIZE"
			? "File is too large (maximum size is 100 MB)"
			: "Invalid file upload";

		return res.status(400).json({ success: false, message });
	}

	if (error instanceof AppError) {
		return res.status(error.statusCode).json({
			success: false,
			message: error.message,
		});
	}

	if (error.type === "entity.parse.failed") {
		return res.status(400).json({
			success: false,
			message: "Invalid JSON request body",
		});
	}

	console.error("Unexpected API error:", error.message);
	return res.status(500).json({
		success: false,
		message: "Internal server error",
	});
}

module.exports = errorHandler;
