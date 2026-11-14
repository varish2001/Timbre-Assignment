import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, formatOperation } from "../utils/format.js";
import StatusBadge from "./StatusBadge.jsx";

export default function JobTable({ jobs, assetsById = {}, compact = false }) {
  if (!jobs.length) {
    return <div className="empty-inline">No processing jobs have been created.</div>;
  }

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Job ID</th>
            <th>Operation</th>
            <th>Status</th>
            <th>Asset</th>
            <th>Created</th>
            {!compact && <th>Completed</th>}
            <th aria-label="Open asset" />
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const asset = assetsById[job.asset_id];
            return (
              <tr key={job.id}>
                <td>
                  <Link to={`/jobs/${job.id}`} className="job-id-link" title={job.id}>
                    {job.id}
                  </Link>
                </td>
                <td>
                  <span className="job-operation">{formatOperation(job.operation)}</span>
                </td>
                <td><StatusBadge status={job.status} /></td>
                <td>
                  {asset ? (
                    <Link to={`/assets/${asset.id}`} className="table-link">
                      {asset.original_name}
                    </Link>
                  ) : (
                    <span className="text-muted">{job.asset_id || "—"}</span>
                  )}
                </td>
                <td className="text-muted">{formatDate(job.created_at)}</td>
                {!compact && <td className="text-muted">{formatDate(job.completed_at)}</td>}
                <td>
                  {asset && (
                    <Link
                      to={`/assets/${asset.id}#jobs`}
                      className="table-open"
                      aria-label={`Open ${asset.original_name} job history`}
                    >
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
