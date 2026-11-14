import { AudioLines } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ onClick }) {
  return (
    <Link to="/" className="brand" aria-label="Timbre Studio overview" onClick={onClick}>
      <span className="brand-mark">
        <AudioLines size={21} strokeWidth={2.2} />
      </span>
      <span className="brand-name">
        <strong>TIMBRE</strong>
        <span>STUDIO</span>
      </span>
    </Link>
  );
}
