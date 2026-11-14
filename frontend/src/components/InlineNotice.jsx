import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const icons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export default function InlineNotice({ tone = "info", children, className = "" }) {
  const Icon = icons[tone] || icons.info;
  return (
    <div className={`notice notice-${tone} ${className}`} role={tone === "error" ? "alert" : "status"}>
      <Icon size={17} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
