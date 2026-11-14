export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(value, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function formatOperation(operation) {
  return operation === "noise_reduction" ? "Noise reduction" : "Transcription";
}

export function formatFileType(mimeType) {
  const labels = {
    "audio/mpeg": "MP3 audio",
    "audio/wav": "WAV audio",
    "audio/mp4": "M4A audio",
    "video/mp4": "MP4 video",
    "video/webm": "WebM video",
    "video/quicktime": "QuickTime video",
  };
  return labels[mimeType] || mimeType || "Unknown";
}
