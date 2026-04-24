import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import {
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCloseCircle,
  IoHomeOutline,
  IoLocationOutline,
  IoOpenOutline,
  IoPricetagOutline,
  IoSearch,
  IoSparklesOutline,
  IoTimeOutline,
  IoListOutline,
} from "react-icons/io5";
import { fetch_userskills } from "../../api";
import { getJobs, scrapeJobs } from "../../api/job.api";
import Loader from "../Loader";
import Map from "./Map";
import Job_comp from "./Job_comp";

const formatDate = (dateString) => {
  if (!dateString) return "Recently posted";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildLocation = (job = {}) =>
  [job?.job_city, job?.job_state, job?.job_country].filter(Boolean).join(", ") || "Location not specified";

const buildHighlights = (job = {}) => {
  const highlights = job?.job_highlights || {};
  return {
    qualifications: Array.isArray(job?.job_requirements)
      ? job.job_requirements
      : Array.isArray(highlights?.Qualifications)
        ? highlights.Qualifications
        : [],
    responsibilities: Array.isArray(job?.job_responsibilities)
      ? job.job_responsibilities
      : Array.isArray(highlights?.Responsibilities)
        ? highlights.Responsibilities
        : [],
  };
};

const getSourceLogo = (job = {}) => {
  if (job?.source_logo) {
    return job.source_logo;
  }

  const source = String(job?.source || "").toLowerCase();
  if (source === "linkedin") return "https://logo.clearbit.com/linkedin.com";
  if (source === "indeed") return "https://logo.clearbit.com/indeed.com";
  if (source === "glassdoor") return "https://logo.clearbit.com/glassdoor.com";
  return "/default_profile.jpg";
};

const getReadableMetaValue = (value) => {
  const text = String(value || "").trim();
  if (!text || text.toLowerCase() === "not specified") {
    return "Not specified";
  }
  return text;
};

function Job_main() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState("manual");
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const pageCount = useMemo(() => Math.max(1, Math.ceil((total || 0) / limit)), [total, limit]);

  const fetchStoredJobs = async (
    nextPage = 0,
    { query = search.trim(), locationValue = location.trim(), sourceValue = source } = {}
  ) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getJobs({
        query,
        location: locationValue,
        source: sourceValue,
        page: nextPage,
        limit,
      });

      setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
      setTotal(Number(data?.total) || 0);
      setPage(Number(data?.page) || 0);
    } catch (err) {
      setJobs([]);
      setTotal(0);
      setError(err?.response?.data?.error || err?.message || "Unable to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoredJobs(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    const query = search.trim();
    const locationValue = location.trim();

    if (!query) {
      return;
    }

    setLoading(true);
    setError("");
    setSearchMode("manual");

    try {
      await scrapeJobs(query, locationValue);
      await fetchStoredJobs(0, { query, locationValue, sourceValue: source });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Scraping failed.");
      setLoading(false);
    }
  };

  const handleRecommendFromSkills = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await fetch_userskills();
      const skillsArray = Array.isArray(data) ? data.filter(Boolean) : [];
      setSkills(skillsArray);

      const skillsQuery = skillsArray.join(" ").trim();
      if (!skillsQuery) {
        setJobs([]);
        setTotal(0);
        setError("No skills found in your profile.");
        setLoading(false);
        return;
      }

      setSearch(skillsQuery);
      setSearchMode("skills");

      await scrapeJobs(skillsQuery, location.trim());
      await fetchStoredJobs(0, { query: skillsQuery, locationValue: location.trim(), sourceValue: source });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to recommend jobs from skills.");
      setLoading(false);
    }
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeJobModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  const summaryText = useMemo(() => {
    if (searchMode === "skills") {
      const topSkills = skills.slice(0, 5).join(", ");
      return topSkills
        ? `Matched using your profile skills: ${topSkills}${skills.length > 5 ? " ..." : ""}`
        : "Matched using your profile skills.";
    }

    return "Search jobs by title/keyword and location across Indeed, LinkedIn, and Glassdoor.";
  }, [searchMode, skills]);

  const detailHighlights = buildHighlights(selectedJob || {});
  const hasMapLocation =
    typeof selectedJob?.job_latitude === "number" &&
    !Number.isNaN(selectedJob?.job_latitude) &&
    typeof selectedJob?.job_longitude === "number" &&
    !Number.isNaN(selectedJob?.job_longitude);

  return (
    <div className="mx-auto w-[96%] max-w-[1500px] px-4 pb-10 pt-6 lg:px-6">
      <section className="theme-surface rounded-md border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="theme-badge inline-flex rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              Job board
            </div>
            <h1 className="mt-3 text-3xl font-semibold">Find job opportunities</h1>
            <p className="theme-text-muted mt-2 max-w-4xl text-sm leading-7">{summaryText}</p>
          </div>

          <button
            type="button"
            onClick={handleRecommendFromSkills}
            className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold"
          >
            <IoSparklesOutline className="text-base" />
            Recommend from skills
          </button>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.3fr_1fr_180px_170px]">
          <div className="theme-input flex items-center gap-3 rounded-md px-4 py-3">
            <IoSearch className="text-lg" style={{ color: "var(--app-accent)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Job title, keyword, or company"
            />
          </div>

          <div className="theme-input flex items-center gap-3 rounded-md px-4 py-3">
            <IoLocationOutline className="text-lg" style={{ color: "var(--app-accent)" }} />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSearch()}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="City, state, or country"
            />
          </div>

          <select
            value={source}
            onChange={(event) => {
              const nextSource = event.target.value;
              setSource(nextSource);
              fetchStoredJobs(0, {
                query: search.trim(),
                locationValue: location.trim(),
                sourceValue: nextSource,
              });
            }}
            className="theme-input rounded-md px-3 py-3 text-sm outline-none"
          >
            <option value="">All sources</option>
            <option value="indeed">Indeed</option>
            <option value="linkedin">LinkedIn</option>
            <option value="glassdoor">Glassdoor</option>
          </select>

          <button
            type="button"
            onClick={handleSearch}
            className="theme-button-primary inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-semibold"
          >
            <IoSearch className="text-base" /> Search
          </button>
        </div>
      </section>

      <section className="mt-5 theme-surface rounded-md border p-5 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="theme-text-muted text-sm">
            Showing {jobs.length} jobs {total ? `of ${total}` : ""}
          </div>
          <div className="theme-text-subtle text-xs uppercase tracking-[0.12em]">{source ? `${source} only` : "all providers"}</div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="rounded-md border border-[var(--app-border)] px-4 py-8 text-center text-sm text-[var(--app-danger-text)]">
            {error}
          </div>
        ) : jobs.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {jobs.map((job) => (
              <Job_comp key={job._id || job.job_link || job.job_apply_link} data={job} onOpen={openJobModal} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[var(--app-border)] px-4 py-10 text-center text-sm text-[var(--app-subtle)]">
            No jobs found. Try a different search.
          </div>
        )}

        {pageCount > 1 ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => fetchStoredJobs(Math.max(0, page - 1))}
              className="theme-button-secondary rounded-md px-3 py-2 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <span className="theme-text-muted px-3 text-sm">Page {page + 1} of {pageCount}</span>
            <button
              type="button"
              disabled={page + 1 >= pageCount || loading}
              onClick={() => fetchStoredJobs(Math.min(page + 1, pageCount - 1))}
              className="theme-button-secondary rounded-md px-3 py-2 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeJobModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(5px)",
            zIndex: 1200,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            width: "min(980px, 94vw)",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: "10px",
            border: "1px solid var(--app-border)",
            background: "var(--app-bg-panel)",
            color: "var(--app-text)",
          },
        }}
      >
        {selectedJob ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="theme-badge inline-flex rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                  {selectedJob.source || "other"}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{selectedJob.job_title || "Untitled role"}</h2>
                <div className="theme-text-muted mt-2 flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-1"><IoBusinessOutline /> {selectedJob.employer_name || "Unknown company"}</span>
                  <span className="inline-flex items-center gap-1"><IoLocationOutline /> {buildLocation(selectedJob)}</span>
                  <span className="inline-flex items-center gap-1"><IoTimeOutline /> {formatDate(selectedJob.job_posted_at_datetime_utc)}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">

                  <span className="theme-badge rounded-md px-2 py-1 text-[11px]">Mode: {getReadableMetaValue(selectedJob.job_work_mode)}</span>
                  <span className="theme-badge rounded-md px-2 py-1 text-[11px]">Employment: {getReadableMetaValue(selectedJob.job_employment_type)}</span>
                  <span className="theme-badge rounded-md px-2 py-1 text-[11px]">Type: {getReadableMetaValue(selectedJob.job_type)}</span>
                  {selectedJob.job_role ? (
                    <span className="theme-badge rounded-md px-2 py-1 text-[11px]">{selectedJob.job_role}</span>
                  ) : null}
                  {selectedJob.job_salary ? (
                    <span className="rounded-md border border-[#1a7f37]/35 bg-[#1a7f37]/12 px-2 py-1 text-[11px] font-semibold text-[#1a7f37] inline-flex items-center gap-1">
                      <IoPricetagOutline /> {selectedJob.job_salary}
                    </span>
                  ) : null}
                </div>
              </div>
              <button type="button" onClick={closeJobModal} className="theme-button-secondary inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm">
                <IoCloseCircle className="text-base" /> Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="theme-soft-surface rounded-md border p-4">
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="theme-text-muted mt-2 whitespace-pre-wrap text-sm leading-7">
                  {selectedJob.job_description || "Description not available from source listing."}
                </p>
              </div>

              <div className="space-y-4">
                <div className="theme-soft-surface rounded-md border p-4">
                  <h3 className="inline-flex items-center gap-2 text-lg font-semibold"><IoBriefcaseOutline /> Job details</h3>
                  <div className="mt-2 grid gap-2 text-sm">
                    <div className="inline-flex items-center gap-2">
                      <IoHomeOutline className="text-base" />
                      Work mode: {selectedJob.job_work_mode || "Not specified"}
                    </div>
                    <div>Employment: {selectedJob.job_employment_type || "Not specified"}</div>
                    <div>Type: {selectedJob.job_type || "Not specified"}</div>
                    <div>Role: {selectedJob.job_role || "Not specified"}</div>
                    <div>Salary: {selectedJob.job_salary || "Not specified"}</div>
                  </div>
                </div>

                <div className="theme-soft-surface rounded-md border p-4">
                  <h3 className="inline-flex items-center gap-2 text-lg font-semibold"><IoListOutline /> Qualifications</h3>
                  {detailHighlights.qualifications.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {detailHighlights.qualifications.slice(0, 6).map((item, index) => (
                        <li key={`qualification-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="theme-text-muted mt-2 text-sm">No qualification highlights available.</p>
                  )}
                </div>

                <div className="theme-soft-surface rounded-md border p-4">
                  <h3 className="inline-flex items-center gap-2 text-lg font-semibold"><IoListOutline /> Responsibilities</h3>
                  {detailHighlights.responsibilities.length > 0 ? (
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {detailHighlights.responsibilities.slice(0, 6).map((item, index) => (
                        <li key={`responsibility-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="theme-text-muted mt-2 text-sm">No responsibility highlights available.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={selectedJob.job_link || selectedJob.job_apply_link}
                target="_blank"
                rel="noreferrer"
                className="theme-button-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
              >
                Open job in new tab <IoOpenOutline className="text-base" />
              </a>
            </div>

            {hasMapLocation ? (
              <div>
                <h3 className="mb-2 text-lg font-semibold">Location Map</h3>
                <Map destination={[selectedJob.job_latitude, selectedJob.job_longitude]} />
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export default Job_main;
