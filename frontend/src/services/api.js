import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  timeout: 20000,
});

function requireRecord(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`The API returned an invalid ${label} response.`);
  }
  return value;
}

function requireAsset(value) {
  const asset = requireRecord(value, "asset");
  if (
    typeof asset.id !== "string" ||
    typeof asset.original_name !== "string" ||
    typeof asset.mime_type !== "string" ||
    !Number.isFinite(Number(asset.size)) ||
    typeof asset.created_at !== "string"
  ) {
    throw new Error("The API returned an incomplete asset response.");
  }
  return { ...asset, size: Number(asset.size) };
}

function requireJob(value) {
  const job = requireRecord(value, "job");
  if (
    typeof job.id !== "string" ||
    typeof job.operation !== "string" ||
    typeof job.status !== "string" ||
    typeof job.created_at !== "string"
  ) {
    throw new Error("The API returned an incomplete job response.");
  }
  return job;
}

function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "The API request timed out. Try again.";
    }
    if (!error.response) {
      return "Could not reach the API. Check the URL, backend availability, and CORS allowlist.";
    }
    if (error.response.status >= 500) {
      return `The API returned a server error (HTTP ${error.response.status}). Check the backend logs and try again.`;
    }
    if (error.response.data && typeof error.response.data.message === "string") {
      return error.response.data.message;
    }
    return `The API request failed with status ${error.response.status}.`;
  }
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

async function request(action) {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured. Set it in the frontend environment and rebuild.");
  }
  try {
    return await action();
  } catch (error) {
    throw new Error(getErrorMessage(error), { cause: error });
  }
}

export const api = {
  async getHealth() {
    return request(async () => {
      const health = requireRecord((await apiClient.get("/health")).data, "health");
      if (health.success !== true || typeof health.message !== "string") {
        throw new Error("The API returned an invalid health response.");
      }
      return health;
    });
  },

  async getAsset(assetId) {
    return request(async () => requireAsset((await apiClient.get(`/assets/${assetId}`)).data));
  },

  async uploadAsset(file, onUploadProgress) {
    return request(async () => {
      const body = new FormData();
      body.append("file", file);
      const response = await apiClient.post("/assets", body, {
        onUploadProgress: (event) => {
          if (event.total) onUploadProgress?.(Math.round((event.loaded * 100) / event.total));
        },
      });
      return requireAsset(response.data);
    });
  },

  async listAssetJobs(assetId) {
    return request(async () => {
      const response = requireRecord(
        (await apiClient.get(`/assets/${assetId}/jobs`)).data,
        "asset jobs",
      );
      if (typeof response.asset_id !== "string" || !Array.isArray(response.jobs)) {
        throw new Error("The API returned an invalid asset jobs response.");
      }
      return response.jobs.map((job) => ({
        ...requireJob(job),
        asset_id: response.asset_id,
      }));
    });
  },

  async createJob(assetId, operation) {
    return request(async () =>
      requireJob(
        (
          await apiClient.post(`/assets/${assetId}/process`, {
            operation,
          })
        ).data,
      ),
    );
  },

  async getJob(jobId) {
    return request(async () => requireJob((await apiClient.get(`/jobs/${jobId}`)).data));
  },
};

