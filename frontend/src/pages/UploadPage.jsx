import { ArrowLeft, AudioLines, CheckCircle2, FileUp, Film, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import InlineNotice from "../components/InlineNotice.jsx";
import PageHeader from "../components/PageHeader.jsx";
import { useStudio } from "../context/StudioContext.jsx";
import { api } from "../services/api.js";
import { formatBytes } from "../utils/format.js";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = new Set([".mp3", ".wav", ".mp4", ".webm", ".mov"]);
const ACCEPTED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function validateFile(file) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
  if (!ACCEPTED_EXTENSIONS.has(extension)) {
    return "This format is not supported. Choose an MP3, WAV, MP4, WEBM, or MOV file.";
  }
  if (file.type && !ACCEPTED_MIME_TYPES.has(file.type)) {
    return "The file's media type is not accepted by the API. Choose an MP3, WAV, MP4, WEBM, or MOV file.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "This file exceeds the 100 MB upload limit.";
  }
  return "";
}

export default function UploadPage() {
  const inputRef = useRef(null);
  const { rememberAsset, refresh } = useStudio();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  function selectFile(nextFile) {
    if (!nextFile) return;
    setSuccess(null);
    const validationError = validateFile(nextFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }
    setError("");
    setFile(nextFile);
  }

  async function submit(event) {
    event.preventDefault();
    if (!file || uploading) return;
    setError("");
    setProgress(0);
    setUploading(true);
    try {
      const asset = await api.uploadAsset(file, setProgress);
      rememberAsset(asset);
      await refresh();
      setSuccess(asset);
      setFile(null);
      setProgress(100);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  return (
    <>
      <PageHeader
        eyebrow="ADD TO YOUR LIBRARY"
        title="Upload asset"
        description="Bring an audio or video file into your workspace."
        actions={<Link to="/assets" className="text-action text-action-muted"><ArrowLeft size={15} /> Back to assets</Link>}
      />

      {error && <InlineNotice tone="error" className="mb-5">{error}</InlineNotice>}
      {success && (
        <InlineNotice tone="success" className="mb-5">
          <strong>Upload complete.</strong> {success.original_name} is now in your library.{" "}
          <Link to={`/assets/${success.id}`} className="notice-link">View asset</Link>
        </InlineNotice>
      )}

      <form className="upload-layout" onSubmit={submit}>
        <section className="surface upload-surface">
          <div className="upload-heading">
            <div>
              <p className="eyebrow">SOURCE FILE</p>
              <h2>Select a media file</h2>
            </div>
            <span className="upload-count">01 <span>/ 01</span></span>
          </div>
          <div
            className={`dropzone ${dragging ? "dropzone-active" : ""} ${file ? "dropzone-selected" : ""}`}
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".mp3,.wav,.mp4,.webm,.mov,audio/mpeg,audio/wav,audio/mp4,video/mp4,video/webm,video/quicktime"
              className="sr-only"
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            {file ? (
              <>
                <span className="dropzone-icon">{file.type.startsWith("video/") ? <Film size={22} /> : <AudioLines size={22} />}</span>
                <strong className="selected-name">{file.name}</strong>
                <span className="dropzone-hint">{formatBytes(file.size)} · {file.type || "Media file"}</span>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => { setFile(null); setError(""); }}
                  aria-label="Remove selected file"
                >
                  <X size={15} /> Remove file
                </button>
              </>
            ) : (
              <>
                <span className="dropzone-icon"><UploadCloud size={23} /></span>
                <strong>Drop your file here</strong>
                <span className="dropzone-hint">or browse from your computer</span>
                <button type="button" className="button button-secondary browse-button" onClick={() => inputRef.current?.click()}>
                  <FileUp size={16} /> Choose a file
                </button>
              </>
            )}
          </div>
          <div className="upload-supported">
            <div><AudioLines size={15} /><span>MP3</span></div>
            <div><AudioLines size={15} /><span>WAV</span></div>
            <div><Film size={15} /><span>MP4</span></div>
            <div><Film size={15} /><span>WEBM</span></div>
            <div><Film size={15} /><span>MOV</span></div>
            <span className="size-limit">MAX FILE SIZE <strong>100 MB</strong></span>
          </div>

          {uploading && (
            <div className="progress-wrap" aria-live="polite">
              <div className="progress-meta"><span>Uploading to your library</span><strong>{progress}%</strong></div>
              <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          <div className="upload-footer">
            <span className="upload-privacy">Files are sent to the configured Timbre API.</span>
            <button className="button button-primary" disabled={!file || uploading} type="submit">
              {uploading ? <><span className="button-spinner" /> Uploading</> : <><UploadCloud size={16} /> Upload file</>}
            </button>
          </div>
        </section>

        <aside className="upload-aside">
          <div className="upload-aside-title"><CheckCircle2 size={17} /> BEFORE YOU UPLOAD</div>
          <div className="upload-tip">
            <span className="tip-number">01</span>
            <p><strong>Choose a supported format</strong>MP3, WAV, MP4, WEBM, and MOV are accepted.</p>
          </div>
          <div className="upload-tip">
            <span className="tip-number">02</span>
            <p><strong>Keep it under 100 MB</strong>The API rejects files larger than its upload limit.</p>
          </div>
          <div className="upload-tip">
            <span className="tip-number">03</span>
            <p><strong>Processing is simulated</strong>Jobs report the API's queued, processing, and completed states; no media analysis is performed.</p>
          </div>
          {success && (
            <button type="button" className="text-action upload-another" onClick={() => { setSuccess(null); setProgress(0); }}>
              Upload another file <ArrowLeft size={15} className="rotate-180" />
            </button>
          )}
        </aside>
      </form>
    </>
  );
}
