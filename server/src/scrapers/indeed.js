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

const MAX_PAGES = Math.max(1, Number(process.env.JOB_SCRAPE_INDEED_PAGES || 4));
const MAX_RESULTS = Math.max(20, Number(process.env.JOB_SCRAPE_INDEED_RESULTS || 90));
const MAX_DETAIL_PAGES = Math.max(10, Number(process.env.JOB_SCRAPE_INDEED_DETAIL || 40));

const USER_AGENT =
  process.env.USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const extractIndeedDetail = async (browser, jobLink) => {
  const detailPage = await browser.newPage();
  await detailPage.setUserAgent(USER_AGENT);

  try {
    await detailPage.goto(jobLink, { waitUntil: "domcontentloaded", timeout: 60000 });
    await detailPage.waitForSelector("#jobDescriptionText, .jobsearch-JobComponent-description", {
      timeout: 8000,
    }).catch(() => null);

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
        document.querySelector("#jobDescriptionText") ||
        document.querySelector(".jobsearch-JobComponent-description") ||
        document.querySelector("main");

      const description = descriptionRoot?.innerText?.trim() || "";
      const bulletItems = Array.from(descriptionRoot?.querySelectorAll("li") || [])
        .map((item) => item.textContent?.trim() || "")
        .filter(Boolean);

      const requirements = bulletItems.filter((line) => /require|qualification|skill|experience|must have|proficien/i.test(line));
      const responsibilities = bulletItems.filter((line) => /responsibilit|dutie|you will|design|develop|manage|maintain|build/i.test(line));

      const metaText = [
        pickText([
          "#salaryInfoAndJobType",
          "[data-testid='salaryInfoAndJobType']",
          "[data-testid='attribute_snippet_testid']",
          ".jobsearch-JobMetadataHeader-item",
        ]),
        pickText(["[data-testid='jobsearch-OtherJobDetailsContainer']", ".jobsearch-JobDescriptionSection-sectionItem"]),
      ]
        .filter(Boolean)
        .join(" \n ");

      const locationText = pickText([
        "[data-testid='job-location']",
        ".jobsearch-JobInfoHeader-subtitle > div",
        "[data-testid='inlineHeader-companyLocation']",
      ]);

      return {
        description,
        salaryText: pickText([
          "#salaryInfoAndJobType",
          "[data-testid='salaryInfoAndJobType']",
          ".salary-snippet-container",
          ".js-match-insights-provider-4pmm6z",
        ]),
        metaText,
        locationText,
        requirements,
        responsibilities,
      };
    });

    return {
      description: cleanParagraphText(detail.description),
      salaryText: cleanText(detail.salaryText),
      metaText: cleanText(detail.metaText),
      locationText: cleanText(detail.locationText),
      requirements: uniqueStrings(detail.requirements || [], 12),
      responsibilities: uniqueStrings(detail.responsibilities || [], 12),
    };
  } catch {
    return {
      description: "",
      salaryText: "",
      metaText: "",
      locationText: "",
      requirements: [],
      responsibilities: [],
    };
  } finally {
    await detailPage.close().catch(() => null);
  }
};

const scrapeIndeed = async (query, location = "") => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    const listingMap = new Map();

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
      const start = pageIndex * 10;
      const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(
        location || ""
      )}&start=${start}&sort=date&limit=50`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector(".job_seen_beacon, a.jcs-JobTitle, [data-jk]", { timeout: 12000 }).catch(() => null);

      const listings = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll(".job_seen_beacon"));

        return cards.map((card) => {
          const anchor =
            card.querySelector("a.jcs-JobTitle") ||
            card.querySelector("h2.jobTitle a") ||
            card.querySelector("a[data-jk]");

          const title =
            anchor?.getAttribute("aria-label") ||
            anchor?.querySelector("span")?.textContent?.trim() ||
            anchor?.textContent?.trim() ||
            "";

          const href = anchor?.getAttribute("href") || "";

          const company =
            card.querySelector('[data-testid="company-name"]')?.textContent?.trim() ||
            card.querySelector(".companyName")?.textContent?.trim() ||
            "";

          const locationRaw =
            card.querySelector('[data-testid="text-location"]')?.textContent?.trim() ||
            card.querySelector(".companyLocation")?.textContent?.trim() ||
            "";

          const description = card.querySelector(".job-snippet")?.textContent?.replace(/\s+/g, " ").trim() || "";

          const salary =
            card.querySelector(".salary-snippet-container")?.textContent?.trim() ||
            card.querySelector('[data-testid="attribute_snippet_testid"]')?.textContent?.trim() ||
            "";

          const jobMeta = Array.from(card.querySelectorAll(".metadata span, .attribute_snippet")).map((el) => el.textContent?.trim() || "");

          const dateText =
            card.querySelector(".date")?.textContent?.trim() ||
            card.querySelector('[data-testid="myJobsStateDate"]')?.textContent?.trim() ||
            "";

          const logo =
            card.querySelector("img")?.getAttribute("src") ||
            card.querySelector("img")?.getAttribute("data-src") ||
            "";

          const sourceJobId = anchor?.getAttribute("data-jk") || card.getAttribute("data-jk") || "";

          return {
            title,
            company,
            locationRaw,
            description,
            salary,
            jobMeta: jobMeta.filter(Boolean).join(" | "),
            href,
            dateText,
            logo,
            sourceJobId,
          };
        });
      });

      for (const item of listings) {
        const normalizedLink = stripTrackingParams(normalizeUrl(item.href, "https://www.indeed.com"));

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
      const detail = index < MAX_DETAIL_PAGES ? await extractIndeedDetail(browser, item.jobLink) : null;

      const locationValue = cleanText(detail?.locationText || item.locationRaw || "");
      if (!geocodeCache.has(locationValue)) {
        geocodeCache.set(locationValue, await geocodeLocation(locationValue));
      }

      const geo = geocodeCache.get(locationValue) || { lat: null, lon: null };
      const locationParts = normalizeLocationParts(locationValue);

      const description = cleanParagraphText(detail?.description || item.description || "");
      const combinedMetaText = [
        item.jobMeta,
        item.salary,
        detail?.salaryText,
        detail?.metaText,
        item.locationRaw,
        description,
      ]
        .filter(Boolean)
        .join(" \n ");

      const inferredHighlights = inferHighlightsFromDescription(description);
      const requirements = uniqueStrings([...(detail?.requirements || []), ...inferredHighlights.requirements], 12);
      const responsibilities = uniqueStrings([...(detail?.responsibilities || []), ...inferredHighlights.responsibilities], 12);

      const salary = cleanText(detail?.salaryText || item.salary || extractSalary(combinedMetaText));
      const workMode = detectWorkMode(`${locationValue} ${combinedMetaText}`);
      const employmentType = detectEmploymentType(combinedMetaText);
      const jobType = detectJobType(combinedMetaText);

      normalizedJobs.push({
        job_title: cleanText(item.title),
        job_role: deriveJobRole(item.title),
        employer_name: cleanText(item.company),
        employer_logo: normalizeUrl(item.logo),
        source_logo: buildSourceLogo("indeed"),
        job_description: description,
        job_link: item.jobLink,
        job_apply_link: item.jobLink,
        job_city: locationParts.city,
        job_state: locationParts.state,
        job_country: locationParts.country,
        job_latitude: geo.lat,
        job_longitude: geo.lon,
        job_posted_at_datetime_utc: parsePostedDate(item.dateText),
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
        source: "indeed",
        source_url: item.jobLink,
        source_job_id: cleanText(item.sourceJobId),
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

module.exports = scrapeIndeed;
