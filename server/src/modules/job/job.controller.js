const mongoose = require("mongoose");
const Job = require("./job.model");
const { fetchAndStoreJobs, ensureLegacyJobLinks } = require("./job.service");

const buildLocationFilter = (location = "") => {
  if (!location) {
    return null;
  }

  return [
    { job_city: { $regex: location, $options: "i" } },
    { job_state: { $regex: location, $options: "i" } },
    { job_country: { $regex: location, $options: "i" } },
  ];
};

const normalizeJobOutput = (job = {}) => {
  const jobLink = String(job.job_link || job.job_apply_link || "").trim();
  const requirements = Array.isArray(job.job_requirements)
    ? job.job_requirements
    : Array.isArray(job.job_highlights?.Qualifications)
      ? job.job_highlights.Qualifications
      : [];
  const responsibilities = Array.isArray(job.job_responsibilities)
    ? job.job_responsibilities
    : Array.isArray(job.job_highlights?.Responsibilities)
      ? job.job_highlights.Responsibilities
      : [];

  return {
    ...job,
    job_link: jobLink,
    job_requirements: requirements,
    job_responsibilities: responsibilities,
    job_highlights: {
      Qualifications: requirements,
      Responsibilities: responsibilities,
    },
    source_logo: job.source_logo || "",
  };
};

const buildFilter = ({
  query = "",
  location = "",
  source = "",
  workMode = "",
  employmentType = "",
  jobType = "",
  remote = "",
} = {}) => {
  const filter = {};

  if (String(query).trim()) {
    const safeQuery = String(query).trim();
    filter.$or = [
      { job_title: { $regex: safeQuery, $options: "i" } },
      { employer_name: { $regex: safeQuery, $options: "i" } },
      { job_role: { $regex: safeQuery, $options: "i" } },
    ];
  }

  const locationFilter = buildLocationFilter(String(location).trim());
  if (locationFilter) {
    filter.$and = filter.$and || [];
    filter.$and.push({ $or: locationFilter });
  }

  if (String(source).trim()) {
    filter.source = String(source).trim().toLowerCase();
  }

  if (String(workMode).trim()) {
    filter.job_work_mode = { $regex: `^${String(workMode).trim()}$`, $options: "i" };
  }

  if (String(employmentType).trim()) {
    filter.job_employment_type = { $regex: String(employmentType).trim(), $options: "i" };
  }

  if (String(jobType).trim()) {
    filter.job_type = { $regex: String(jobType).trim(), $options: "i" };
  }

  const remoteValue = String(remote).trim().toLowerCase();
  if (remoteValue === "true" || remoteValue === "false") {
    filter.job_is_remote = remoteValue === "true";
  }

  if (Array.isArray(filter.$and) && filter.$and.length === 0) {
    delete filter.$and;
  }

  return filter;
};

const scrapandStoreJobs = async (req, res) => {
  try {
    const { query, location = "", source = "" } = req.body || {};
    if (!query || !String(query).trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const safeQuery = String(query).trim();
    const safeLocation = String(location || "").trim();
    const safeSource = String(source || "").trim();

    // Always fetch fresh jobs for this query and location.
    await fetchAndStoreJobs(safeQuery, safeLocation);
    await ensureLegacyJobLinks();

    const filter = buildFilter({
      query: safeQuery,
      location: safeLocation,
      source: safeSource,
    });

    const jobs = await Job.find(filter)
      .sort({ job_posted_at_datetime_utc: -1, scraped_at: -1 })
      .limit(120)
      .lean();

    return res.status(200).json(jobs.map(normalizeJobOutput));
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Scraping failed" });
  }
};

const getJobs = async (req, res) => {
  try {
    const {
      query = "",
      location = "",
      source = "",
      workMode = "",
      employmentType = "",
      jobType = "",
      remote = "",
      page = "0",
      limit = "20",
    } = req.query;

    const pageNo = Math.max(0, Number(page) || 0);
    const limitNo = Math.min(100, Math.max(1, Number(limit) || 20));

    await ensureLegacyJobLinks();

    const filter = buildFilter({
      query,
      location,
      source,
      workMode,
      employmentType,
      jobType,
      remote,
    });

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ job_posted_at_datetime_utc: -1, scraped_at: -1 })
        .skip(pageNo * limitNo)
        .limit(limitNo)
        .lean(),
      Job.countDocuments(filter),
    ]);

    return res.status(200).json({
      jobs: jobs.map(normalizeJobOutput),
      total,
      page: pageNo,
      limit: limitNo,
      pageCount: Math.ceil(total / limitNo),
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Failed to load jobs" });
  }
};

const getJobById = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(404).json({ message: "Job not found" });
  }

  try {
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(normalizeJobOutput(job));
  } catch (error) {
    return res.status(500).json({ error: error?.message || "Failed to load job" });
  }
};

module.exports = {
  scrapandStoreJobs,
  getJobs,
  getJobById,
};
