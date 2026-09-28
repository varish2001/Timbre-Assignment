# Timbre Mini Processing API

A small Express and PostgreSQL API for storing audio/video asset metadata and simulating asynchronous processing jobs. It uses CommonJS, the `pg` package, Multer disk storage, and raw parameterized SQL.

## Run Locally

1. Install dependencies with `npm install`.
2. Make sure PostgreSQL is running and the existing `.env` points at the local `timbre_api` database. Keep `.env` private; it is ignored by Git.
3. Apply the schema once from this folder, using a PostgreSQL account that can create tables:

	 ```powershell
	 psql -U postgres -d timbre_api -f migrations/001_create_assets_and_jobs.sql
	 ```

4. Start the API with `npm run dev` (or `npm start`). It checks PostgreSQL before listening on port 5000.
5. Check `http://localhost:5000/health`.

The migration uses `IF NOT EXISTS`, so it can be safely run again. It creates `assets` and `jobs`; it does not create any bonus tables.

## Project Files

```text
src/
	config/db.js                 Loads environment variables and creates the pg Pool
	controllers/assetController.js Handles asset upload and lookup
	controllers/jobController.js  Validates and handles processing-job requests
	middleware/upload.js          Configures Multer, file types, and file-size limit
	middleware/errorHandler.js    Converts errors into safe JSON responses
	routes/assetRouter.js         Registers the three asset-related endpoints
	routes/jobRoutes.js           Registers job lookup
	services/jobService.js        Inserts jobs and simulates status changes
	utils/AppError.js             Error type for expected API errors
	utils/generateFilename.js     Creates a random stored filename and safe extension
	app.js                        Configures Express, routes, and error handling
	server.js                     Checks PostgreSQL and starts listening
migrations/001_create_assets_and_jobs.sql
uploads/.gitkeep                Keeps the otherwise-empty upload folder in Git
```

## API Summary

The base URL is `http://localhost:5000`. Successful resource responses contain the resource fields directly; errors use `{ "success": false, "message": "..." }`.

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| POST | `/assets` | Upload one audio/video file | 201 |
| GET | `/assets/:assetId` | Get asset metadata | 200 |
| POST | `/assets/:assetId/process` | Create and start a simulated job | 202 |
| GET | `/jobs/:jobId` | Get job state | 200 |
| GET | `/assets/:assetId/jobs` | List jobs for an asset | 200 |

IDs must be UUIDs. Invalid UUIDs return 400; well-formed IDs that do not exist return 404. Uploads accept `audio/mpeg`, `audio/wav`, `audio/mp4`, `video/mp4`, `video/webm`, and `video/quicktime`. The maximum upload size is 100 MB.

## Postman Walkthrough

Create a Postman environment variable named `baseUrl` with value `http://localhost:5000`. Keep the server running while sending these requests.

### 1. Upload an asset

- Method: `POST`
- URL: `{{baseUrl}}/assets`
- Headers: Do not manually set `Content-Type`; Postman sets the multipart boundary.
- Body: `form-data`; add key `file`, change its type from Text to File, and select a real audio or video file.
- Expected status: `201 Created`.
- Example response:

	```json
	{
		"id": "8f2c7d67-1012-4e51-9e54-2b18513a0182",
		"original_name": "interview.mp4",
		"mime_type": "video/mp4",
		"size": 1234567,
		"storage_path": "uploads/51bfa541-d06e-44d1-b384-70d9cdd45a12.mp4",
		"created_at": "2026-09-29T12:00:00.000Z"
	}
	```

Save `id` as `assetId` in the Postman environment. The server-generated filename is used on disk; the original name is metadata only.

Error checks: send without the `file` field (400), upload a `.txt` file (400), or send a supported file larger than 100 MB (400).

### 2. Get the asset

- Method: `GET`
- URL: `{{baseUrl}}/assets/{{assetId}}`
- Headers/body: none.
- Expected status: `200 OK`; response is the asset metadata from step 1.

Error checks: use `not-a-uuid` (400), then use a valid but nonexistent UUID (404).

### 3. Start processing

- Method: `POST`
- URL: `{{baseUrl}}/assets/{{assetId}}/process`
- Header: `Content-Type: application/json` (Postman sets this when JSON is selected).
- Body type: raw, JSON.

	```json
	{ "operation": "transcription" }
	```

- Expected status: `202 Accepted`; the response immediately contains a job with `status` equal to `queued`.
- Save the response `id` as `jobId`.

Try `noise_reduction` as the other supported operation. An unsupported operation returns 400; a valid but nonexistent asset UUID returns 404.

### 4. Get the job

- Method: `GET`
- URL: `{{baseUrl}}/jobs/{{jobId}}`
- Headers/body: none.
- Expected status: `200 OK`.
- It can show `queued` immediately, `processing` shortly after, and `completed` after about three seconds total. `completed_at` is null until completion.

Error checks: use `not-a-uuid` (400), then a valid but nonexistent UUID (404).

### 5. List jobs for the asset

- Method: `GET`
- URL: `{{baseUrl}}/assets/{{assetId}}/jobs`
- Headers/body: none.
- Expected status: `200 OK`.
- Example response:

	```json
	{
		"asset_id": "8f2c7d67-1012-4e51-9e54-2b18513a0182",
		"jobs": [
			{
				"id": "90c13d07-949a-43e3-991a-203df0fba00d",
				"operation": "transcription",
				"status": "completed",
				"created_at": "2026-09-29T12:00:01.000Z",
				"completed_at": "2026-09-29T12:00:04.000Z"
			}
		]
	}
	```

An existing asset with no jobs returns an empty `jobs` array. An invalid asset UUID returns 400; a valid missing asset returns 404.

## How Requests Work

### Upload request

Postman sends a `multipart/form-data` request. Express matches `POST /assets`; the route runs `upload.single("file")` before the controller. Multer checks the MIME type and size, creates a random UUID-based filename, and writes bytes under `uploads/`. The controller inserts the original name, MIME type, byte size, and relative storage path using a parameterized SQL query, then returns the row. If inserting metadata fails, the controller removes the just-uploaded file.

The original filename is never used as a filesystem path. MIME validation uses the multipart MIME type, not the extension. This is suitable for the assignment; a production service would also inspect file contents because a client can claim a MIME type that does not match its bytes.

### Processing request

The controller validates the asset UUID, checks that the asset exists, checks the requested operation, and asks `jobService` to insert a `queued` row. It schedules a timer and immediately returns HTTP 202 with the job. One timer updates the row to `processing`; a second updates it to `completed` and sets `completed_at`.

`setTimeout` does not block the request: it schedules a callback and returns control to Node's event loop. The HTTP response is sent without waiting for either timer. The simulation takes about three seconds in total. The timer is only an in-process demo mechanism: a server restart loses pending callbacks.

## Database Basics

- `assets.id` and `jobs.id` are PostgreSQL UUID primary keys generated by `gen_random_uuid()`.
- `assets` stores one row per uploaded file. File bytes remain in `uploads/`; PostgreSQL stores metadata and a relative path.
- `jobs.asset_id` is a foreign key to `assets.id`. This makes the relationship one asset to many jobs and prevents a job from referring to a nonexistent asset. Deleting an asset cascades to its jobs.
- `operation` and `status` have database `CHECK` constraints in addition to controller validation. The status values are `queued`, `processing`, and `completed`.
- `pg.Pool` reuses database connections rather than opening one for every query.
- `$1`, `$2`, etc. are parameter placeholders. Values are sent separately from SQL text, which prevents user input from being interpreted as SQL.
- Raw SQL keeps this small assignment's database operations explicit and easy to inspect. An ORM is not required.

## Error Handling

Controllers pass errors to Express with `next(error)`. `AppError` carries an expected HTTP status and message. The final `errorHandler` maps those errors and Multer errors to JSON. Unexpected errors return a generic 500 response; database details and stack traces are not sent to API clients. Typical responses are:

```json
{ "success": false, "message": "Asset not found" }
```

Missing file, unsupported MIME type, oversized file, invalid UUID, and invalid operation return 400. Missing assets/jobs return 404. Unexpected database/server errors return 500.

## Interview Preparation

For each question, “Say” is a short spoken answer. “Follow-up” gives a little more technical depth.

### Structure and storage

**Why this folder structure?**
- Tests: separation of HTTP routing, request handling, database work, and shared middleware.
- Say: “Each folder has one job, so routes stay small and the business logic is easier to find and test.”
- Follow-up: “Routes map URLs to controller functions; controllers validate requests and coordinate work; the service owns job creation and simulation; middleware handles cross-cutting upload and error behavior.”

**Why PostgreSQL?**
- Tests: relational modeling and data integrity.
- Say: “Assets and jobs have a clear one-to-many relationship, and PostgreSQL can enforce it with a foreign key and constraints.”
- Follow-up: “Transactions, indexes, UUIDs, and mature SQL support make it a good fit for metadata and job state.”

**Why raw SQL instead of an ORM?**
- Tests: tradeoffs, not ORM familiarity.
- Say: “The data model is small, and raw SQL makes each query explicit without adding another dependency.”
- Follow-up: “Every user-provided value is still parameterized. For a larger model, an ORM could reduce repetitive mapping, but it is not needed here.”

**How does the asset-job relationship work?**
- Tests: primary keys, foreign keys, and cardinality.
- Say: “Each asset has a UUID primary key; each job stores that UUID as a foreign key, so one asset can have many jobs.”
- Follow-up: “The foreign key prevents orphan jobs, and `ON DELETE CASCADE` removes associated jobs if an asset is deleted.”

### Uploads and validation

**Why Multer and `multipart/form-data`?**
- Tests: understanding browser/API file uploads.
- Say: “Multer parses multipart requests and writes uploaded bytes to disk, while normal JSON cannot carry a file as a file part.”
- Follow-up: “`upload.single("file")` accepts one part named `file`; Multer populates `req.file` before the controller runs.”

**Why generate a new filename? Why not trust the original name?**
- Tests: path safety and collisions.
- Say: “A random UUID name avoids collisions and prevents user-provided path text from controlling where the file is written.”
- Follow-up: “The original name is retained only as metadata. The generated extension comes from the allowlisted MIME type.”

**How are file types validated?**
- Tests: distinguishing extension checks from MIME checks.
- Say: “The upload middleware accepts only a small MIME allowlist and rejects other types; it does not choose the stored extension from the supplied filename.”
- Follow-up: “Multipart MIME is client-provided, so this is not proof of the file's actual contents. Production should inspect signatures/content and consider malware scanning.”

**What happens if no file is uploaded?**
- Tests: validation path and response code.
- Say: “Multer leaves `req.file` undefined, so the controller returns a 400 JSON error instead of inserting an asset.”
- Follow-up: “An unexpected file field and file-size limit errors are also translated by the centralized handler.”

**What happens if the asset does not exist?**
- Tests: resource validation and HTTP semantics.
- Say: “The controller queries PostgreSQL by the validated UUID and returns 404 when there is no matching row.”
- Follow-up: “An invalid UUID is rejected earlier with 400, so malformed input and a missing resource are distinguishable.”

### Jobs and asynchronous behavior

**How does asynchronous processing work?**
- Tests: the event loop and HTTP request lifecycle.
- Say: “The service inserts a queued row and schedules callbacks that update the job to processing and then completed.”
- Follow-up: “`setTimeout` registers future callbacks with Node's event loop; it does not block the JavaScript thread while waiting.”

**Why does the API return before processing completes?**
- Tests: request latency and asynchronous API design.
- Say: “The client only needs confirmation that the job was accepted and its ID; it can check the result later.”
- Follow-up: “The endpoint returns 202 after the queued row is stored. The processing callbacks are independent of that response, and `GET /jobs/:jobId` is the polling endpoint.”

**What happens if processing takes 10 minutes?**
- Tests: awareness of the simulation's boundary.
- Say: “A 10-minute timer is a poor production job system because it lives only in one server process and disappears on restart.”
- Follow-up: “I would persist queued work and let a separate worker consume it, with retries, visibility timeouts, and monitoring.”

**What happens if 1,000 jobs arrive at once?**
- Tests: capacity, database connection limits, and backpressure.
- Say: “This demo schedules all timers in the API process and has no concurrency limit, so it is not designed for that load.”
- Follow-up: “Each job adds callbacks and database updates. The pool limits open database connections, but it does not itself limit how many timers or jobs are created.”

**How would you handle concurrent jobs?**
- Tests: safe work distribution and backpressure.
- Say: “I would use a durable queue and a bounded number of workers so the system processes only as many jobs at once as it can support.”
- Follow-up: “Workers should claim jobs atomically, and concurrency should be configured alongside PostgreSQL pool limits and measured resource capacity.”

**How would you prevent duplicate processing?**
- Tests: idempotency and race conditions.
- Say: “I would define what counts as a duplicate and give each operation request an idempotency key.”
- Follow-up: “Persist the key with a unique constraint and return the existing job on retries. Workers should also claim queued jobs atomically so two workers cannot process the same row.”

**What happens if processing fails?**
- Tests: failure states and operational recovery.
- Say: “This demo has no `failed` state; a timer database error is logged and may leave the job at its previous status.”
- Follow-up: “A production version should persist a failure state and a safe error summary so clients and operators can tell the job did not complete.”

**How would you implement retries?**
- Tests: retry safety and repeated execution.
- Say: “I would retry transient failures a limited number of times with increasing delays.”
- Follow-up: “Use bounded exponential backoff, persist the attempt count and next retry time, and make each operation idempotent so a retry cannot create duplicate side effects.”

**How would you replace `setTimeout` in production?**
- Tests: durable asynchronous architecture.
- Say: “I would publish a job to a durable queue and have worker processes consume it.”
- Follow-up: “The API would still return a job ID quickly; workers would update persisted status. Queue choice depends on operational requirements, delivery guarantees, and existing infrastructure.”

### Scaling and design tradeoffs

**How would you move local files to S3?**
- Tests: storage abstraction and deployment realities.
- Say: “I would upload to object storage and store the object key, not a machine-specific local path.”
- Follow-up: “The API could use a presigned upload URL for large files. Access control, lifecycle cleanup, and database/object consistency would need explicit handling.”

**How would you scale this system?**
- Tests: identifying bottlenecks rather than naming technologies.
- Say: “Separate the API from workers, store files in shared object storage, and use a durable queue so multiple instances can process jobs.”
- Follow-up: “I would add bounded concurrency, database indexes, idempotency, metrics, health checks, and load testing before scaling components.”

**What are the limitations of this implementation?**
- Tests: honest engineering judgment.
- Say: “Files are local, processing is simulated in memory, there is no authentication, and MIME checks trust client metadata.”
- Follow-up: “Timers are lost on restart, no failed/retry state exists, uploads need cleanup/retention, and there is no content scanning or production observability.”

## Verification Checklist

- `npm run dev` logs successful PostgreSQL connection and starts port 5000.
- `GET /health` returns 200.
- Apply the migration before calling asset/job endpoints.
- Upload a real supported file, then retrieve it by the returned asset ID.
- Create a job, poll it until `completed`, retrieve it by job ID, then list it for the asset.
- Check missing/unsupported/oversized uploads, invalid UUIDs, missing asset/job UUIDs, and unsupported operations.

The processing simulation is intentionally short (about three seconds) so status changes are easy to demonstrate. No bonus endpoints or processing tables are part of this assignment.
