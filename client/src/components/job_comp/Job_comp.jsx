import React from "react";
import {
  IoBusinessOutline,
  IoLocationOutline,
  IoOpenOutline,
  IoPricetagOutline,
  IoTimeOutline,
} from "react-icons/io5";

const SOURCE_LOGO_FALLBACK = {
  linkedin: "https://logo.clearbit.com/linkedin.com",
  indeed: "https://logo.clearbit.com/indeed.com",
  glassdoor: "https://logo.clearbit.com/glassdoor.com",
};

const formatDate = (dateString) => {
  if (!dateString) return "Recently posted";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const buildLocation = (data) => {
  const parts = [data?.job_city, data?.job_state, data?.job_country].filter(Boolean);
  return parts.length ? parts.join(", ") : "Location not specified";
};

const getSourceLogo = (data = {}) => {
  if (data.source_logo) {
    return data.source_logo;
  }

  return SOURCE_LOGO_FALLBACK[String(data.source || "").toLowerCase()] || "/default_profile.jpg";
};

function Job_comp({ data, onOpen }) {
  const {
    job_title,
    job_role,
    employer_logo,
    employer_name,
    job_employment_type,
    job_type,
    job_work_mode,
    job_salary,
    job_posted_at_datetime_utc,
    source,
    job_link,
  } = data;

  const normalizeMeta = (value) => {
    const text = String(value || "").trim();
    if (!text || text.toLowerCase() === "not specified") {
      return "";
    }
    return text;
  };

  const workModeValue = normalizeMeta(job_work_mode);
  const employmentValue = normalizeMeta(job_employment_type);
  const jobTypeValue = normalizeMeta(job_type);

  const metaBadges = [
    workModeValue ? `Mode: ${workModeValue}` : "",
    employmentValue ? `Employment: ${employmentValue}` : "",
    jobTypeValue ? `Type: ${jobTypeValue}` : "",
  ].filter(Boolean);

  const openJobLink = (event) => {
    event.stopPropagation();
    const link = String(job_link || "").trim();
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(data)}
      className="theme-soft-surface group w-full rounded-md border p-5 text-left transition hover:border-[var(--app-border-strong)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <img
            src={employer_logo || "/default_profile.jpg"}
            className="h-14 w-14 rounded-md border border-[var(--app-border)] object-cover"
            alt={employer_name || "Employer logo"}
            onError={(event) => {
              event.currentTarget.src = "/default_profile.jpg";
            }}
          />
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-semibold leading-6">{job_title || "Untitled role"}</h3>
            <div className="theme-text-muted mt-2 inline-flex items-center gap-2 text-sm">
              <IoBusinessOutline className="text-base" /> {employer_name || "Unknown company"}
            </div>
            {job_role ? <div className="theme-text-subtle mt-1 text-xs">Role: {job_role}</div> : null}
          </div>
        </div>

     
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="theme-input rounded-md px-3 py-2">
          <div className="theme-text-subtle text-[10px] uppercase tracking-[0.18em]">Location</div>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium">
            <IoLocationOutline className="text-base" style={{ color: "var(--app-accent)" }} />
            <span className="line-clamp-1">{buildLocation(data)}</span>
          </div>
        </div>

        <div className="theme-input rounded-md px-3 py-2">
          <div className="theme-text-subtle text-[10px] uppercase tracking-[0.18em]">Posted</div>
          <div className="mt-1.5 flex items-center gap-2 text-sm font-medium">
            <IoTimeOutline className="text-base" style={{ color: "var(--app-accent)" }} />
            <span>{formatDate(job_posted_at_datetime_utc)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {metaBadges.length > 0 ? (
          metaBadges.map((label) => (
            <span key={label} className="theme-badge rounded-md px-2 py-1 text-[11px]">
              {label}
            </span>
          ))
        ) : (
          <span className="theme-badge rounded-md px-2 py-1 text-[11px]">Job details: Not specified</span>
        )}
        {job_salary ? (
          <span className="rounded-md border border-[#1a7f37]/35 bg-[#1a7f37]/12 px-2 py-1 text-[11px] font-semibold text-[#1a7f37] inline-flex items-center gap-1">
            <IoPricetagOutline /> {job_salary}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--app-accent)]">
          View details <IoOpenOutline className="text-base transition group-hover:translate-x-0.5" />
        </div>

        <button
          type="button"
          onClick={openJobLink}
          className="theme-button-secondary inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold"
        >
          Open job
          <IoOpenOutline className="text-sm" />
        </button>
      </div>
    </button>
  );
}

export default Job_comp;
