const STORAGE_KEY = "timbre-studio:asset-ids";

export function getTrackedAssetIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored)
      ? [...new Set(stored.filter((id) => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}

export function rememberAssetId(assetId) {
  const ids = getTrackedAssetIds();
  if (!ids.includes(assetId)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, assetId]));
  }
}
