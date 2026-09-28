const fs = require("fs");
const path = require("path");
const multer = require("multer");
const AppError = require("../utils/AppError");
const generateFilename = require("../utils/generateFilename");

const uploadDirectory = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedMimeTypes = new Set([
	"audio/mpeg",
	"audio/wav",
	"audio/mp4",
	"video/mp4",
	"video/webm",
	"video/quicktime",
]);

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		callback(null, generateFilename(file.mimetype));
	},
});

function fileFilter(req, file, callback) {
	if (!allowedMimeTypes.has(file.mimetype)) {
		return callback(new AppError(400, "Unsupported file type"));
	}

	return callback(null, true);
}

module.exports = multer({
	storage,
	fileFilter,
	limits: { fileSize: 100 * 1024 * 1024 },
});
