import API from "./client";

export const scrapeJobs = (query, location = "") => {
  return API.post("/jobs/scrape", { query, location });
};

export const getJobs = ({ query = "", location = "", source = "", page = 0, limit = 20 } = {}) => {
  const queryString = new URLSearchParams({
    ...(query && { query }),
    ...(location && { location }),
    ...(source && { source }),
    page: String(page),
    limit: String(limit),
  }).toString();

  return API.get(`/jobs?${queryString}`);
};

export const getJobById = (jobId) => API.get(`/jobs/${jobId}`);
