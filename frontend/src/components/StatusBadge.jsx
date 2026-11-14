import { Circle } from "lucide-react";

const labels = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
};

export default function StatusBadge({ status }) {
  const label = labels[status] || status || "Unknown";
  return (
    <span className={`status-badge status-${status || "unknown"}`}>
      <Circle size={7} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      {label}
    </span>
  );
}
