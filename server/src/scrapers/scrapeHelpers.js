const SOURCE_LOGOS = {
  linkedin: "https://logo.clearbit.com/linkedin.com",
  indeed: "https://logo.clearbit.com/indeed.com",
  glassdoor: "https://logo.clearbit.com/glassdoor.com",
  other: "",
};

const cleanText = (value = "") => String(value || "").replace(/\s+/g, " ").trim();

const cleanParagraphText = (value = "") =>
  String(value || "")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ ]{2,}/g, " ")
    .trim();

const normalizeUrl = (href = "", base = "") => {
  const raw = String(href || "").trim();
  if (!raw) {
    return "";
  }

  try {
    return new URL(raw, base || undefined).toString();
  } catch {
    return "";
  }
};

const stripTrackingParams = (url = "") => {
  try {
    const parsed = new URL(url);
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "trk",
      "trackingId",
      "refId",
      "ref",
      "sessionId",
      "li_fat_id",
    ].forEach((key) => parsed.searchParams.delete(key));
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return String(url || "").trim();
  }
};

const parsePostedDate = (raw = "") => {
  const text = String(raw || "").toLowerCase();
  const now = new Date();

  if (!text) {
    return now;
  }

  if (text.includes("just now") || text.includes("today") || text.includes("new")) {
    return now;
  }

  const match = text.match(/(\d+)\s+(hour|day|week|month)s?/i);
  if (!match) {
    return now;
  }

  const value = Number(match[1]);
  const unit = String(match[2]).toLowerCase();

  if (unit === "hour") {
    now.setHours(now.getHours() - value);
  } else if (unit === "day") {
    now.setDate(now.getDate() - value);
  } else if (unit === "week") {
    now.setDate(now.getDate() - value * 7);
  } else if (unit === "month") {
    now.setMonth(now.getMonth() - value);
  }

  return now;
};

const normalizeLocationParts = (raw = "") => {
  const value = cleanText(raw);
  if (!value) {
    return { city: "", state: "", country: "US" };
  }

  const parts = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    city: parts[0] || value,
    state: parts[1] || "",
    country: parts[2] || "US",
  };
};

const uniqueStrings = (items = [], limit = 12) => {
  const seen = new Set();
  const result = [];

  for (const item of items || []) {
    const text = cleanText(item);
    if (!text) {
      continue;
    }

    const key = text.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(text);

    if (result.length >= limit) {
      break;
    }
  }

  return result;
};

const extractSalary = (text = "") => {
  const source = cleanText(text);
  if (!source) {
    return "";
  }

  const salaryPatterns = [
    /(?:\$|USD\s?)\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s?(?:-|to)\s?(?:\$|USD\s?)?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?/i,
    /(?:\$|USD\s?)\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?/i,
    /\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s?(?:-|to)\s?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?\s?(?:USD|\$)?(?:\s*(?:per|\/)\s*(?:year|yr|month|mo|week|wk|day|hour|hr))?/i,
  ];

  for (const pattern of salaryPatterns) {
    const match = source.match(pattern);
    if (match?.[0]) {
      return cleanText(match[0]);
    }
  }

  return "";
};

const detectWorkMode = (text = "") => {
  const value = String(text || "").toLowerCase();

  if (/\bhybrid\b/.test(value)) {
    return "Hybrid";
  }

  if (/\bremote\b|work\s*from\s*home|\bwfh\b/.test(value)) {
    return "Remote";
  }

  if (/\bonsite\b|on-site|on site|in[-\s]?office|in[-\s]?person/.test(value)) {
    return "Onsite";
  }

  return "Not specified";
};

const detectEmploymentType = (text = "") => {
  const value = String(text || "").toLowerCase();

  if (/full[-\s]?time/.test(value)) return "Full-time";
  if (/part[-\s]?time/.test(value)) return "Part-time";
  if (/contract/.test(value)) return "Contract";
  if (/temporary|temp\b/.test(value)) return "Temporary";
  if (/freelance/.test(value)) return "Freelance";
  if (/seasonal/.test(value)) return "Seasonal";

  return "Not specified";
};

const detectJobType = (text = "") => {
  const value = String(text || "").toLowerCase();

  if (/internship|\bintern\b|co[-\s]?op/.test(value)) return "Internship";
  if (/apprentice|apprenticeship/.test(value)) return "Apprenticeship";
  if (/volunteer/.test(value)) return "Volunteer";
  if (/fellowship/.test(value)) return "Fellowship";
  if (/entry[-\s]?level|new[-\s]?grad|graduate/.test(value)) return "Entry-level";

  const employmentType = detectEmploymentType(value);
  return employmentType === "Not specified" ? "Not specified" : employmentType;
};

const deriveJobRole = (title = "") => {
  const cleaned = cleanText(title)
    .replace(/\s*\(.*?\)\s*/g, " ")
    .split(/\s+[-|@]\s+/)[0]
    .trim();

  return cleaned || "Not specified";
};

const inferHighlightsFromDescription = (description = "") => {
  const source = cleanParagraphText(description);
  if (!source) {
    return { requirements: [], responsibilities: [] };
  }

  const lines = source
    .split(/\n|\.|;/)
    .map((item) => cleanText(item))
    .filter(Boolean);

  const requirements = [];
  const responsibilities = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (
      /require|qualification|must\s+have|experience\s+with|proficien|familiar\s+with|skill\b/.test(lower)
    ) {
      requirements.push(line);
      continue;
    }

    if (
      /responsibilit|you\s+will|dutie|design|develop|build|maintain|lead|manage|coordinate/.test(lower)
    ) {
      responsibilities.push(line);
    }
  }

  return {
    requirements: uniqueStrings(requirements, 12),
    responsibilities: uniqueStrings(responsibilities, 12),
  };
};

const buildSourceLogo = (source = "other") => SOURCE_LOGOS[String(source || "other").toLowerCase()] || "";

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  SOURCE_LOGOS,
  cleanText,
  cleanParagraphText,
  normalizeUrl,
  stripTrackingParams,
  parsePostedDate,
  normalizeLocationParts,
  uniqueStrings,
  extractSalary,
  detectWorkMode,
  detectEmploymentType,
  detectJobType,
  deriveJobRole,
  inferHighlightsFromDescription,
  buildSourceLogo,
  sleep,
};
