import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { StudioProvider } from "./context/StudioContext.jsx";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StudioProvider>
        <App />
      </StudioProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
