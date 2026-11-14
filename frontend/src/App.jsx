import { Navigate, Route, Routes } from "react-router-dom";
import StudioLayout from "./layout/StudioLayout.jsx";
import AssetDetailPage from "./pages/AssetDetailPage.jsx";
import AssetsPage from "./pages/AssetsPage.jsx";
import JobsPage from "./pages/JobsPage.jsx";
import JobDetailPage from "./pages/JobDetailPage.jsx";
import OverviewPage from "./pages/OverviewPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<StudioLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/:assetId" element={<AssetDetailPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/:jobId" element={<JobDetailPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
