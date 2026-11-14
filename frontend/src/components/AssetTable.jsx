import { ArrowUpRight, AudioLines, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { formatBytes, formatDate, formatFileType } from "../utils/format.js";

function AssetKind({ mimeType }) {
  const Icon = mimeType?.startsWith("video/") ? Film : AudioLines;
  return (
    <span className="file-kind">
      <Icon size={16} aria-hidden="true" />
      {formatFileType(mimeType)}
    </span>
  );
}

export default function AssetTable({ assets, compact = false }) {
  if (!assets.length) {
    return (
      <div className="empty-inline">
        <AudioLines size={20} aria-hidden="true" />
        <span>No assets to show yet.</span>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Format</th>
            {!compact && <th>Size</th>}
            <th>Uploaded</th>
            <th aria-label="Open asset" />
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td>
                <Link to={`/assets/${asset.id}`} className="asset-name">
                  <span className="asset-file-icon">
                    {asset.mime_type?.startsWith("video/") ? (
                      <Film size={17} />
                    ) : (
                      <AudioLines size={17} />
                    )}
                  </span>
                  <span className="asset-name-text" title={asset.original_name}>
                    {asset.original_name}
                    <span className="asset-id">{asset.id}</span>
                  </span>
                </Link>
              </td>
              <td><AssetKind mimeType={asset.mime_type} /></td>
              {!compact && <td className="text-muted">{formatBytes(asset.size)}</td>}
              <td className="text-muted">{formatDate(asset.created_at)}</td>
              <td>
                <Link
                  to={`/assets/${asset.id}`}
                  className="table-open"
                  aria-label={`Open ${asset.original_name}`}
                >
                  <ArrowUpRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
