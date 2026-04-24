const puppeteer = require("puppeteer");
const geocodeLocation = require("../utils/geocode");
const {
  buildSourceLogo,
  cleanParagraphText,
  cleanText,
  deriveJobRole,
  detectEmploymentType,
  detectJobType,
  detectWorkMode,
  extractSalary,
  inferHighlightsFromDescription,
  normalizeLocationParts,
  normalizeUrl,
  parsePostedDate,
  sleep,
  stripTrackingParams,
  uniqueStrings,
} = require("./scrapeHelpers");

const MAX_PAGES = Math.max(1, Number(process.env.JOB_SCRAPE_LINKEDIN_PAGES || 4));
const MAX_RESULTS = Math.max(20, Number(process.env.JOB_SCRAPE_LINKEDIN_RESULTS || 80));
const MAX_DETAIL_PAGES = Math.max(10, Number(process.env.JOB_SCRAPE_LINKEDIN_DETAIL || 36));

const USER_AGENT =
  process.env.USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const parseLinkedInJobId = (url = "") => {
  const match = String(url).match(/\/jobs\/view\/(\d+)/i);
  return match ? match[1] : "";
};

const extractLinkedInDetail = async (browser, jobLink) => {
  const detailPage = await browser.newPage();
  await detailPage.setUserAgent(USER_AGENT);

  try {
    await detailPage.goto(jobLink, { waitUntil: "domcontentloaded", timeout: 60000 });
    await detailPage.waitForSelector(
      ".show-more-less-html__markup, .description__text, .description__job-criteria-list",
      { timeout: 8000 }
    ).catch(() => null);

    const detail = await detailPage.evaluate(() => {
      const pickText = (selectors = []) => {
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            return element.textContent.trim();
          }
        }
        return "";
      };

      const descriptionRoot =
        document.querySelector(".show-more-less-html__markup") ||
        document.querySelector(".description__text") ||
        document.querySelector("main");

      const description = descriptionRoot?.innerText?.trim() || "";
      const bulletItems = Array.from(descriptionRoot?.querySelectorAll("li") || [])
        .map((item) => item.textContent?.trim() || "")
        .filter(Boolean);

      const criteriaItems = Array.from(document.querySelectorAll(".description__job-criteria-item, .job-criteria__item"))
        .map((item) => {
          const key =
            item.querySelector("h3")?.textContent?.trim() ||
            item.querySelector(".description__job-criteria-subheader")?.textContent?.trim() ||
            "";
          const value =
            item.querySelector(".description__job-criteria-text")?.textContent?.trim() ||
            item.querySelector("span")?.textContent?.trim() ||
            "";
          return { key, value };
        })
        .filter((item) => item.key || item.value);

      return {
        description,
        salaryText: pickText([
          ".compensation__salary",
          ".salary",
          "[class*='salary']",
        ]),
        locationText: pickText([
          ".topcard__flavor--bullet",
          ".topcard__flavor.topcard__flavor--bullet",
          ".jobs-unified-top-card__bullet",
        ]),
        criteriaItems,
        bulletItems,
      };
    });

    const criteriaText = (detail.criteriaItems || [])
      .map((item) => `${item.key}: ${item.value}`)
      .filter(Boolean)
      .join(" \n ");

    const requirements = uniqueStrings(
      (detail.bulletItems || []).filter((line) => /require|qualification|skill|experience|must have|proficien/i.test(line)),
      12
    );

    const responsibilities = uniqueStrings(
      (detail.bulletItems || []).filter((line) => /responsibilit|dutie|you will|design|develop|manage|maintain|build/i.test(line)),
      12
    );

    return {
      description: cleanParagraphText(detail.description),
      salaryText: cleanText(detail.salaryText),
      locationText: cleanText(detail.locationText),
      criteriaText: cleanText(criteriaText),
      requirements,
      responsibilities,
    };
  } catch {
    return {
      description: "",
      salaryText: "",
      locationText: "",
      criteriaText: "",
      requirements: [],
      responsibilities: [],
    };
  } finally {
    await detailPage.close().catch(() => null);
  }
};

const scrapeLinkedIn = async (query, location = "") => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    const listingMap = new Map();

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
      const start = pageIndex * 25;
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(
        query
      )}&location=${encodeURIComponent(location || "")}&f_TPR=r2592000&position=1&pageNum=0&start=${start}`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector(".base-search-card, .job-search-card", { timeout: 12000 }).catch(() => null);

      const listings = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll(".base-search-card, .job-search-card"));

        return cards.map((card) => {
          const linkEl =
            card.querySelector("a.base-card__full-link") ||
            card.querySelector("a.job-search-card__link") ||
            card.querySelector("a");

          const title =
            card.querySelector(".base-search-card__title")?.textContent?.trim() ||
            card.querySelector(".job-search-card__title")?.textContent?.trim() ||
            linkEl?.textContent?.trim() ||
            "";

          const company =
            card.querySelector(".base-search-card__subtitle")?.textContent?.trim() ||
            card.querySelector(".job-search-card__subtitle")?.textContent?.trim() ||
            "";

          const locationRaw =
            card.querySelector(".job-search-card__location")?.textContent?.trim() ||
            card.querySelector(".base-search-card__metadata")?.textContent?.trim() ||
            "";

          const dateText =
            card.querySelector("time")?.textContent?.trim() ||
            card.querySelector(".job-search-card__listdate")?.textContent?.trim() ||
            "";

          const postedIso = card.querySelector("time")?.getAttribute("datetime") || "";
          const logo = card.querySelector("img")?.getAttribute("data-delayed-url") || card.querySelector("img")?.getAttribute("src") || "";
          const href = linkEl?.href || "";

          return {
            title,
            company,
            locationRaw,
            dateText,
            postedIso,
            href,
            logo,
          };
        });
      });

      for (const item of listings) {
        const normalizedLink = stripTrackingParams(normalizeUrl(item.href, "https://www.linkedin.com"));

        if (!item.title || !item.company || !normalizedLink) {
          continue;
        }

        if (!listingMap.has(normalizedLink)) {
          listingMap.set(normalizedLink, {
            ...item,
            jobLink: normalizedLink,
          });
        }

        if (listingMap.size >= MAX_RESULTS) {
          break;
        }
      }

      if (listingMap.size >= MAX_RESULTS) {
        break;
      }

      await sleep(250);
    }

    const listingItems = [...listingMap.values()].slice(0, MAX_RESULTS);
    const geocodeCache = new Map();
    const normalizedJobs = [];

    for (let index = 0; index < listingItems.length; index += 1) {
      const item = listingItems[index];
      const detail = index < MAX_DETAIL_PAGES ? await extractLinkedInDetail(browser, item.jobLink) : null;

      const locationValue = cleanText(detail?.locationText || item.locationRaw || "");
      if (!geocodeCache.has(locationValue)) {
        geocodeCache.set(locationValue, await geocodeLocation(locationValue));
      }

      const geo = geocodeCache.get(locationValue) || { lat: null, lon: null };
      const locationParts = normalizeLocationParts(locationValue);

      const description = cleanParagraphText(detail?.description || "");
      const combinedMetaText = [
        item.locationRaw,
        item.dateText,
        detail?.criteriaText,
        detail?.salaryText,
        description,
      ]
        .filter(Boolean)
        .join(" \n ");

      const inferredHighlights = inferHighlightsFromDescription(description);
      const requirements = uniqueStrings([...(detail?.requirements || []), ...inferredHighlights.requirements], 12);
      const responsibilities = uniqueStrings([...(detail?.responsibilities || []), ...inferredHighlights.responsibilities], 12);

      const salary = cleanText(detail?.salaryText || extractSalary(combinedMetaText));
      const workMode = detectWorkMode(`${locationValue} ${combinedMetaText}`);
      const employmentType = detectEmploymentType(combinedMetaText);
      const jobType = detectJobType(combinedMetaText);

      normalizedJobs.push({
        job_title: cleanText(item.title),
        job_role: deriveJobRole(item.title),
        employer_name: cleanText(item.company),
        employer_logo: normalizeUrl(item.logo),
        source_logo: buildSourceLogo("linkedin"),
        job_description: description,
        job_link: item.jobLink,
        job_apply_link: item.jobLink,
        job_city: locationParts.city,
        job_state: locationParts.state,
        job_country: locationParts.country,
        job_latitude: geo.lat,
        job_longitude: geo.lon,
        job_posted_at_datetime_utc: item.postedIso ? new Date(item.postedIso) : parsePostedDate(item.dateText),
        job_employment_type: employmentType,
        job_type: jobType,
        job_work_mode: workMode,
        job_is_remote: workMode === "Remote",
        job_salary: salary,
        job_requirements: requirements,
        job_responsibilities: responsibilities,
        job_highlights: {
          Qualifications: requirements,
          Responsibilities: responsibilities,
        },
        source: "linkedin",
        source_url: item.jobLink,
        source_job_id: parseLinkedInJobId(item.jobLink),
      });

      if (index % 8 === 0) {
        await sleep(120);
      }
    }

    return normalizedJobs;
  } finally {
    await browser.close();
  }
};

module.exports = scrapeLinkedIn;
