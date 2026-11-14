import { Activity, ArrowLeft, AudioLines, Film, RefreshCw, WandSparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InlineNotice from "../components/InlineNotice.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useStudio } from "../context/StudioContext.jsx";
import { api } from "../services/api.js";
import { formatBytes, formatDate, formatFileType, formatOperation } from "../utils/format.js";

export default function AssetDetailPage() {
  const { assetId } = useParams();
  const { rememberAsset, refresh } = useStudio();
  const [asset, setAsset] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState("");
  const [notice, setNotice] = useState("");

  const loadAsset = useCallback(async () => {
    try {
      const [assetResult, jobsResult] = await Promise.all([
        api.getAsset(assetId),
        api.listAssetJobs(assetId),
      ]);
      setAsset(assetResult);
      setJobs(jobsResult);
      rememberAsset(assetResult);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [assetId, rememberAsset]);

  useEffect(() => {
    setAsset(null);
    setJobs([]);
    setError("");
    setLoading(true);
    loadAsset();
  }, [loadAsset]);

  const hasActiveJobs = jobs.some((job) => job.status === "queued" || job.status === "processing");
  useEffect(() => {
    if (!hasActiveJobs) return undefined;
    const timer = window.setTimeout(loadAsset, 2000);
    return () => window.clearTimeout(timer);
  }, [hasActiveJobs, jobs, loadAsset]);

  async function startJob(operation) {
    setStarting(operation);
    setError("");
    setNotice("");
    try {
      const job = await api.createJob(assetId, operation);
      setNotice(`${formatOperation(job.operation)} job created with status ${job.status}.`);
      await loadAsset();
      await refresh();
    } catch (jobError) {
      setError(jobError.message);
    } finally {
      setStarting("");
    }
  }

  if (loading) {
    return <div className="loading-block"><span className="spinner" /> Loading asset details from the API…</div>;
  }
  if (!asset) {
    return (
      <div className="detail-error">
        <Link to="/assets" className="text-action text-action-muted"><ArrowLeft size={15} /> Back to assets</Link>
        <InlineNotice tone="error">{error || "This asset could not be loaded from the API."}</InlineNotice>
      </div>
    );
  }

  const FileIcon = asset.mime_type.startsWith("video/") ? Film : AudioLines;

  return (
    <>
      <PageHeader
        eyebrow="ASSET DETAILS"
        title={asset.original_name}
        description="Review metadata and start a simulated processing job."
        actions={<Link to="/assets" className="text-action text-action-muted"><ArrowLeft size={15} /> All assets</Link>}
      />
      {(error || notice) && (
        <InlineNotice tone={error ? "error" : "success"} className="mb-5">
          {error || notice}
        </InlineNotice>
      )}

      <div className="detail-grid">
        <section className="surface detail-main">
          <div className="asset-hero">
            <span className="asset-hero-icon"><FileIcon size={24} /></span>
            <div className="asset-hero-name">
              <span className="eyebrow">SOURCE FILE</span>
              <h2>{asset.original_name}</h2>
              <p>{formatFileType(asset.mime_type)}</p>
            </div>
          </div>
          <div className="metadata-grid">
            <div><span>FILE SIZE</span><strong>{formatBytes(asset.size)}</strong></div>
            <div><span>UPLOADED</span><strong>{formatDate(asset.created_at)}</strong></div>
            <div className="metadata-id"><span>ASSET ID</span><strong title={asset.id}>{asset.id}</strong></div>
          </div>
        </section>

        <section className="surface process-panel">
          <div className="panel-title-row">
            <span className="panel-title-icon"><WandSparkles size={17} /></span>
            <div><p className="eyebrow">PROCESSING</p><h2>Start a job</h2></div>
          </div>
          <p className="process-disclaimer">The API simulates job progress. These actions do not perform transcription or noise reduction.</p>
          <button className="operation-button" onClick={() => startJob("transcription")} disabled={Boolean(starting)}>
            <span><Activity size={17} /><strong>Transcription</strong></span>
            {starting === "transcription" ? <span className="button-spinner" /> : <span className="operation-arrow">Start</span>}
          </button>
          <button className="operation-button" onClick={() => startJob("noise_reduction")} disabled={Boolean(starting)}>
            <span><WandSparkles size={17} /><strong>Noise reduction</strong></span>
            {starting === "noise_reduction" ? <span className="button-spinner" /> : <span className="operation-arrow">Start</span>}
          </button>
        </section>
      </div>

      <section className="surface table-section detail-jobs" id="jobs">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ASSET ACTIVITY</p>
            <h2>Job history</h2>
          </div>
          <button className="button button-quiet" onClick={loadAsset} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
        {jobs.length ? (
          <div className="job-history-list">
            {jobs.map((job) => (
              <div className="job-history-item" key={job.id}>
                <span className="history-icon"><Activity size={17} /></span>
                <div className="history-main">
                  <strong>{formatOperation(job.operation)}</strong>
                  <span>
                    {formatDate(job.created_at)} ·{" "}
                    <Link to={`/jobs/${job.id}`} className="history-job-link">{job.id}</Link>
                  </span>
                </div>
                <div className="history-completed">
                  <span>COMPLETED</span>
                  <strong>{formatDate(job.completed_at)}</strong>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-inline">
            <Activity size={18} />
            <span>No jobs have been created for this asset.</span>
          </div>
        )}
      </section>
    </>
  );
}
