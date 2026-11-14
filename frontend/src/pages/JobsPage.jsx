import { Activity, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import InlineNotice from "../components/InlineNotice.jsx";
import JobTable from "../components/JobTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useStudio } from "../context/StudioContext.jsx";

export default function JobsPage() {
  const { assets, jobs, loading, error, refreshing, refresh } = useStudio();
  const assetsById = Object.fromEntries(assets.map((asset) => [asset.id, asset]));

  return (
    <>
      <PageHeader
        eyebrow="ACTIVITY"
        title="Processing jobs"
        description="Follow job status as reported by the processing API."
        actions={
          <button className="button button-secondary" onClick={refresh} disabled={refreshing}>
            <RefreshCw size={15} className={refreshing ? "spin-icon" : ""} /> Refresh
          </button>
        }
      />
      {error && <InlineNotice tone="error" className="mb-6">{error}</InlineNotice>}
      <section className="surface list-surface">
        <div className="jobs-intro">
          <span className="jobs-intro-icon"><Activity size={18} /></span>
          <p>Job status is read from the API. Processing is simulated; no transcription or noise reduction is performed.</p>
        </div>
        {loading ? (
          <div className="loading-block"><span className="spinner" /> Loading jobs from the API…</div>
        ) : jobs.length ? (
          <JobTable jobs={jobs} assetsById={assetsById} />
        ) : (
          <div className="empty-panel empty-panel-large">
            <span className="empty-icon"><Activity size={20} /></span>
            <strong>No processing jobs yet</strong>
            <span>Create a job from an asset's detail page to see its status here.</span>
            {assets.length ? (
              <Link to={`/assets/${assets[0].id}`} className="button button-secondary">Open an asset</Link>
            ) : (
              <Link to="/upload" className="button button-secondary">Upload an asset</Link>
            )}
          </div>
        )}
      </section>
      <p className="scope-footnote">Jobs are aggregated from the per-asset history endpoint for assets tracked in this browser.</p>
    </>
  );
}
