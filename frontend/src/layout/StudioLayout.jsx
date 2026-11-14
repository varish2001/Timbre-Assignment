import {
  Activity,
  ArrowUpRight,
  Disc3,
  FolderOpen,
  Menu,
  Settings2,
  Upload,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import Brand from "../components/Brand.jsx";
import { useStudio } from "../context/StudioContext.jsx";

const navigation = [
  { to: "/", label: "Overview", icon: Disc3, end: true },
  { to: "/assets", label: "Assets", icon: FolderOpen },
  { to: "/jobs", label: "Processing jobs", icon: Activity },
];

function currentTitle(pathname) {
  if (pathname === "/") return "Overview";
  if (pathname === "/assets") return "Assets";
  if (pathname.startsWith("/assets/")) return "Asset details";
  if (pathname === "/jobs") return "Processing jobs";
  if (pathname.startsWith("/jobs/")) return "Job details";
  if (pathname === "/upload") return "Upload asset";
  if (pathname === "/settings") return "Settings";
  return "Timbre Studio";
}

export default function StudioLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { apiStatus, refreshing, refresh } = useStudio();
  const apiState = refreshing
    ? "Syncing"
    : apiStatus === "checking"
      ? "Checking API"
      : apiStatus === "connected"
        ? "API connected"
        : "API unavailable";

  function closeMenu() {
    setMobileOpen(false);
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" onClick={closeMenu} aria-label="Close navigation" />}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <Brand onClick={closeMenu} />
          <button className="icon-button mobile-close" onClick={closeMenu} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            onClick={closeMenu}
            className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
          >
            <Settings2 size={17} strokeWidth={1.8} />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note-label">LIBRARY SCOPE</div>
          <p>Assets uploaded or opened in this browser.</p>
          <NavLink to="/upload" className="sidebar-upload" onClick={closeMenu}>
            <Upload size={15} />
            <span>Upload an asset</span>
            <ArrowUpRight size={14} className="ml-auto" />
          </NavLink>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>Studio</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{currentTitle(location.pathname)}</strong>
            </div>
          </div>
          <button className="api-indicator" onClick={refresh} title="Refresh data from the API">
            <span className={`connection-dot ${apiStatus === "unavailable" ? "connection-error" : ""}`} />
            <span>{apiState}</span>
            <span className="api-refresh">Refresh</span>
          </button>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
