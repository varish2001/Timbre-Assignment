const crypto = require("crypto");

const extensionsByMimeType = {
	"audio/mpeg": ".mp3",
	"audio/wav": ".wav",
	"audio/mp4": ".m4a",
	"video/mp4": ".mp4",
	"video/webm": ".webm",
	"video/quicktime": ".mov",
};

function generateFilename(mimeType) {
	const extension = extensionsByMimeType[mimeType] || ".bin";
	return `${crypto.randomUUID()}${extension}`;
}

module.exports = generateFilename;
