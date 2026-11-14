import { Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InlineNotice from "../components/InlineNotice.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../services/api.js";
import { formatDate, formatOperation } from "../utils/format.js";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJob = useCallback(async () => {
    try {
      const result = await api.getJob(jobId);
      setJob(result);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    setJob(null);
    setError("");
    setLoading(true);
    loadJob();
  }, [loadJob]);

  useEffect(() => {
    if (!job || (job.status !== "queued" && job.status !== "processing")) {
      return undefined;
    }
    const timer = window.setTimeout(loadJob, 2000);
    return () => window.clearTimeout(timer);
  }, [job, loadJob]);

  return (
    <>
      <PageHeader
        eyebrow="PROCESSING JOB"
        title="Job details"
        description="Status and timestamps returned by the processing API."
        actions={<Link to="/jobs" className="text-action text-action-muted"><ArrowLeft size={15} /> All jobs</Link>}
      />
      {error && <InlineNotice tone="error" className="mb-5">{error}</InlineNotice>}
      {loading && !job ? (
        <div className="loading-block"><span className="spinner" /> Loading job details from the API…</div>
      ) : job ? (
        <section className="surface job-detail-panel">
          <div className="job-detail-heading">
            <span className="history-icon"><Activity size={18} /></span>
            <div>
              <p className="eyebrow">{formatOperation(job.operation)}</p>
              <code>{job.id}</code>
            </div>
            <StatusBadge status={job.status} />
          </div>
          <div className="metadata-grid">
            <div>
              <span>ASSOCIATED ASSET</span>
              {job.asset_id ? (
                <Link to={`/assets/${job.asset_id}`} className="job-asset-link">Open asset <ArrowLeft size={13} className="rotate-180" /></Link>
              ) : (
                <strong>Not provided by API</strong>
              )}
            </div>
            <div><span>CREATED</span><strong>{formatDate(job.created_at)}</strong></div>
            <div><span>COMPLETED</span><strong>{formatDate(job.completed_at)}</strong></div>
          </div>
          <p className="process-disclaimer">Processing is simulated. This job status does not represent completed transcription or noise reduction.</p>
          <button className="button button-quiet" onClick={loadJob} disabled={loading}>
            <RefreshCw size={15} /> Refresh job
          </button>
        </section>
      ) : (
        <div className="detail-error">
          <p className="text-muted">This job could not be loaded from the API.</p>
          <Link to="/jobs" className="text-action text-action-muted"><ArrowLeft size={15} /> Back to jobs</Link>
        </div>
      )}
    </>
  );
}
