const Job = require("./job.model");
const scrapeIndeed = require("../../scrapers/indeed");
const scrapeLinkedIn = require("../../scrapers/linkedin");
const scrapeGlassdoor = require("../../scrapers/glassdoor");
const {
  buildSourceLogo,
  cleanParagraphText,
  cleanText,
  detectWorkMode,
  stripTrackingParams,
  uniqueStrings,
} = require("../../scrapers/scrapeHelpers");

const normalizeJob = (job = {}) => {
  const source = cleanText(job.source || "other").toLowerCase() || "other";
  const jobLink = stripTrackingParams(cleanText(job.job_link || job.job_apply_link));
  const requirements = uniqueStrings(
    job.job_requirements || job.job_highlights?.Qualifications || [],
    12
  );
  const responsibilities = uniqueStrings(
    job.job_responsibilities || job.job_highlights?.Responsibilities || [],
    12
  );
  const workMode = cleanText(job.job_work_mode) || detectWorkMode(`${job.job_city || ""} ${job.job_description || ""}`);

  return {
    ...job,
    source,
    job_title: cleanText(job.job_title),
    job_role: cleanText(job.job_role || job.job_title || "Not specified") || "Not specified",
    employer_name: cleanText(job.employer_name),
    employer_logo: cleanText(job.employer_logo),
    source_logo: cleanText(job.source_logo) || buildSourceLogo(source),
    job_description: cleanParagraphText(job.job_description),
    job_link: jobLink,
    job_apply_link: jobLink,
    job_city: cleanText(job.job_city),
    job_state: cleanText(job.job_state),
    job_country: cleanText(job.job_country || "US") || "US",
    job_employment_type: cleanText(job.job_employment_type || "Not specified") || "Not specified",
    job_type: cleanText(job.job_type || "Not specified") || "Not specified",
    job_work_mode: workMode || "Not specified",
    job_is_remote: workMode.toLowerCase() === "remote" || Boolean(job.job_is_remote),
    job_salary: cleanText(job.job_salary),
    job_requirements: requirements,
    job_responsibilities: responsibilities,
    job_highlights: {
      Qualifications: requirements,
      Responsibilities: responsibilities,
    },
    source_url: cleanText(job.source_url) || jobLink,
    source_job_id: cleanText(job.source_job_id),
    scraped_at: new Date(),
  };
};

const isValidJob = (job = {}) => Boolean(job.job_title && job.employer_name && job.job_link);

const ensureLegacyJobLinks = async () => {
  await Job.updateMany(
    {
      $or: [{ job_link: { $exists: false } }, { job_link: "" }],
      job_apply_link: { $exists: true, $ne: "" },
    },
    [
      {
        $set: {
          job_link: "$job_apply_link",
        },
      },
    ]
  );
};

async function fetchAndStoreJobs(query, location) {
  await ensureLegacyJobLinks();

  const scrapedResults = await Promise.allSettled([
    scrapeIndeed(query, location),
    scrapeLinkedIn(query, location),
    scrapeGlassdoor(query, location),
  ]);

  const merged = scrapedResults
    .filter((entry) => entry.status === "fulfilled")
    .flatMap((entry) => (Array.isArray(entry.value) ? entry.value : []))
    .map(normalizeJob)
    .filter(isValidJob);

  const dedupedMap = new Map();
  merged.forEach((job) => {
    const key = String(job.job_link || "").toLowerCase();
    if (!key) {
      return;
    }

    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, job);
    }
  });

  const dedupedJobs = [...dedupedMap.values()];

  if (!dedupedJobs.length) {
    return [];
  }

  const upsertPromises = dedupedJobs.map((job) =>
    Job.findOneAndUpdate(
      { job_link: job.job_link },
      { $set: job },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  );

  const savedJobs = await Promise.all(upsertPromises);

  return savedJobs.sort(
    (left, right) =>
      new Date(right?.job_posted_at_datetime_utc || 0).getTime() -
      new Date(left?.job_posted_at_datetime_utc || 0).getTime()
  );
}

module.exports = { fetchAndStoreJobs, ensureLegacyJobLinks };
