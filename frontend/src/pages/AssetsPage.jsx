import { Search, Upload, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AssetTable from "../components/AssetTable.jsx";
import InlineNotice from "../components/InlineNotice.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useStudio } from "../context/StudioContext.jsx";

export default function AssetsPage() {
  const { assets, loading, error } = useStudio();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState("all");
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    const matchesSearch = `${asset.original_name} ${asset.mime_type}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const isVideo = asset.mime_type.startsWith("video/");
    return matchesSearch && (kind === "all" || (kind === "video" ? isVideo : !isVideo));
  }), [assets, search, kind]);

  return (
    <>
      <PageHeader
        eyebrow="MEDIA LIBRARY"
        title="Assets"
        description="Browse and inspect the media you have brought into Timbre Studio."
        actions={
          <Link to="/upload" className="button button-primary">
            <Upload size={16} /> Upload asset
          </Link>
        }
      />
      {error && <InlineNotice tone="error" className="mb-6">{error}</InlineNotice>}
      <section className="surface list-surface">
        <div className="list-toolbar">
          <label className="search-field">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by filename or format"
              aria-label="Search assets"
            />
            {search && (
              <button onClick={() => setSearch("")} className="search-clear" aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </label>
          <label className="filter-field">
            <span>TYPE</span>
            <select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Filter by asset type">
              <option value="all">All formats</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </label>
          <span className="result-count">{filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}</span>
        </div>
        {loading ? (
          <div className="loading-block"><span className="spinner" /> Loading tracked assets from the API…</div>
        ) : filteredAssets.length ? (
          <AssetTable assets={filteredAssets} />
        ) : (
          <div className="empty-panel empty-panel-large">
            <span className="empty-icon"><Search size={20} /></span>
            <strong>{assets.length ? "No matching assets" : "No tracked assets yet"}</strong>
            <span>{assets.length ? "Try a different search or format filter." : "Assets uploaded or opened in this browser appear here."}</span>
            {!assets.length && <Link to="/upload" className="button button-secondary">Upload an asset</Link>}
          </div>
        )}
      </section>
      <p className="scope-footnote">The backend has no list-all-assets endpoint. This library includes only asset IDs saved by this browser.</p>
    </>
  );
}
