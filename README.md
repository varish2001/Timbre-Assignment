# Timbre Studio

Timbre Studio is a React dashboard for the Timbre Mini Processing API. The frontend and backend are separate applications:

- `frontend/` — React, Vite, Tailwind CSS, Axios, and React Router
- `backend-api/` — Express and PostgreSQL API

## Run locally

1. Start the backend by following the setup instructions in [backend-api/README.md](./backend-api/README.md). It listens on `http://localhost:5000` by default.
2. In another terminal, enter `frontend/` and install the frontend dependencies:

   ```powershell
   cd frontend
   npm install
   ```

3. Copy `.env.example` to `.env` if you need to change the API URL. The default is `http://localhost:5000`.
4. Start Vite:

   ```powershell
   npm run dev
   ```

   Open the local URL printed by Vite.

The Vite development server proxies API requests to `VITE_API_BASE_URL`, so local development does not require adding CORS support to the backend. For a separately hosted frontend and backend, configure the backend to allow the deployed frontend origin and set `VITE_API_BASE_URL` to the backend URL when building the frontend.

## API coverage

The UI uses the existing upload, asset detail, per-asset job history, job creation, and job detail endpoints. The API does not provide an endpoint to list all assets or all jobs. To avoid fabricating data or changing the backend, Timbre Studio remembers asset IDs uploaded or opened in the current browser and loads their details and job histories from the API. Dashboard totals and the jobs table represent only that browser-tracked collection.

Processing jobs are simulated by the backend. The interface displays API-reported job states and does not claim to transcribe or alter media.
