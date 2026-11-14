import { Activity, ArrowRight, AudioLines, Check, Clock3, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import AssetTable from "../components/AssetTable.jsx";
import InlineNotice from "../components/InlineNotice.jsx";
import JobTable from "../components/JobTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useStudio } from "../context/StudioContext.jsx";

function Metric({ icon: Icon, label, value, note }) {
  return (
    <section className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <Icon size={17} aria-hidden="true" />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
    </section>
  );
}

export default function OverviewPage() {
  const { assets, jobs, loading, error } = useStudio();
  const completed = jobs.filter((job) => job.status === "completed").length;
  const assetsById = Object.fromEntries(assets.map((asset) => [asset.id, asset]));

  return (
    <>
      <PageHeader
        eyebrow="YOUR WORKSPACE"
        title="Overview"
        description="A clear view of your media and processing activity."
        actions={
          <Link to="/upload" className="button button-primary">
            <Plus size={17} />
            Upload asset
          </Link>
        }
      />

      {error && <InlineNotice tone="error" className="mb-6">{error}</InlineNotice>}

      <div className="metric-grid">
        <Metric icon={AudioLines} label="Tracked assets" value={loading ? "—" : assets.length} note="Available in this browser" />
        <Metric icon={Activity} label="Processing jobs" value={loading ? "—" : jobs.length} note="Across tracked assets" />
        <Metric icon={Check} label="Completed jobs" value={loading ? "—" : completed} note="Reported by the API" />
      </div>

      <section className="surface welcome-panel">
        <div className="welcome-copy">
          <p className="eyebrow">THE MEDIA WORKSPACE</p>
          <h2>Make room for the next take.</h2>
          <p>Bring audio and video into one focused library, then follow each simulated job as its status changes.</p>
          <Link to="/upload" className="text-action">
            Add your first asset <ArrowRight size={16} />
          </Link>
        </div>
        <div className="waveform" aria-hidden="true">
          {[18, 30, 22, 46, 34, 58, 25, 42, 64, 32, 49, 22, 39, 55, 27, 44, 20, 35, 57, 28, 47, 19, 38, 51, 26, 43, 62, 31, 48, 23, 37, 55, 20, 41, 29, 52].map((height, index) => (
            <span key={index} style={{ height }} />
          ))}
        </div>
      </section>

      <section className="surface table-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LIBRARY</p>
            <h2>Recent assets</h2>
          </div>
          <Link to="/assets" className="text-action text-action-muted">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="loading-inline"><span className="spinner" /> Loading assets from the API…</div>
        ) : assets.length ? (
          <AssetTable assets={assets.slice(0, 5)} compact />
        ) : (
          <div className="empty-panel">
            <span className="empty-icon"><AudioLines size={21} /></span>
            <strong>Your library starts here</strong>
            <span>Upload an audio or video file to see it in this workspace.</span>
            <Link to="/upload" className="button button-secondary">Upload an asset</Link>
          </div>
        )}
      </section>

      <section className="surface table-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h2>Recent jobs</h2>
          </div>
          <Link to="/jobs" className="text-action text-action-muted">
            All jobs <ArrowRight size={15} />
          </Link>
        </div>
        {loading ? (
          <div className="loading-inline"><span className="spinner" /> Loading jobs from the API…</div>
        ) : jobs.length ? (
          <JobTable jobs={jobs.slice(0, 5)} assetsById={assetsById} compact />
        ) : (
          <div className="empty-inline">
            <Clock3 size={18} />
            <span>Jobs created for tracked assets will appear here.</span>
          </div>
        )}
      </section>
      <p className="scope-footnote">These totals reflect API data for assets tracked in this browser. The backend does not expose a global asset directory.</p>
    </>
  );
}
