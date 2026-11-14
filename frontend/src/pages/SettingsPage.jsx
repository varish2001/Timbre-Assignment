import { ExternalLink, ServerCog } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";

export default function SettingsPage() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE"
        title="Settings"
        description="Connection details for this Timbre Studio instance."
      />
      <section className="surface settings-panel">
        <div className="settings-title">
          <span className="settings-icon"><ServerCog size={19} /></span>
          <div><p className="eyebrow">API CONNECTION</p><h2>Backend endpoint</h2></div>
        </div>
        <div className="settings-row">
          <div><strong>Configured API URL</strong><span>Requests are sent to this service.</span></div>
          <code>{apiUrl}</code>
        </div>
        <div className="settings-row">
          <div><strong>Asset library</strong><span>The backend does not currently offer a global asset-list endpoint.</span></div>
          <span className="settings-value">Browser tracked</span>
        </div>
        <div className="settings-footer">
          <span>To change the API URL, set <code>VITE_API_BASE_URL</code> in <code>frontend/.env</code> and restart Vite.</span>
          <a className="text-action text-action-muted" href="https://vite.dev/guide/env-and-mode" target="_blank" rel="noreferrer">
            Vite env docs <ExternalLink size={14} />
          </a>
        </div>
      </section>
    </>
  );
}
