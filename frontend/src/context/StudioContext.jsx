import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { getTrackedAssetIds, rememberAssetId } from "../services/assetRegistry.js";

const StudioContext = createContext(null);

export function StudioProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    const assetIds = getTrackedAssetIds();
    const [healthResults, assetResults] = await Promise.all([
      Promise.allSettled([api.getHealth()]),
      Promise.allSettled(assetIds.map((id) => api.getAsset(id))),
    ]);
    setApiStatus(healthResults[0].status === "fulfilled" ? "connected" : "unavailable");
    const foundAssets = assetResults
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const jobResults = await Promise.allSettled(
      foundAssets.map((asset) => api.listAssetJobs(asset.id)),
    );
    const foundJobs = jobResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);
    const failures = [...healthResults, ...assetResults, ...jobResults].filter(
      (result) => result.status === "rejected",
    );

    setAssets(foundAssets.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
    setJobs(foundJobs.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)));
    setError(
      failures.length
        ? `${failures.length} API request${failures.length === 1 ? "" : "s"} could not be completed. ${failures[0].reason.message}`
        : "",
    );
    setLoading(false);
    setRefreshing(false);
  }, []);

  const rememberAsset = useCallback((asset) => {
    rememberAssetId(asset.id);
    setAssets((current) => {
      const withoutAsset = current.filter((item) => item.id !== asset.id);
      return [asset, ...withoutAsset].sort(
        (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
      );
    });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const hasActiveJobs = jobs.some(
    (job) => job.status === "queued" || job.status === "processing",
  );

  useEffect(() => {
    if (!hasActiveJobs) return undefined;
    const timer = window.setTimeout(refresh, 2000);
    return () => window.clearTimeout(timer);
  }, [hasActiveJobs, refresh, jobs]);

  const value = useMemo(
    () => ({ assets, jobs, loading, refreshing, error, apiStatus, refresh, rememberAsset }),
    [assets, jobs, loading, refreshing, error, apiStatus, refresh, rememberAsset],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used within a StudioProvider.");
  return context;
}
