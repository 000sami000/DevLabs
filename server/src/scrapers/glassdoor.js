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

const MAX_PAGES = Math.max(1, Number(process.env.JOB_SCRAPE_GLASSDOOR_PAGES || 3));
const MAX_RESULTS = Math.max(15, Number(process.env.JOB_SCRAPE_GLASSDOOR_RESULTS || 55));
const MAX_DETAIL_PAGES = Math.max(8, Number(process.env.JOB_SCRAPE_GLASSDOOR_DETAIL || 24));

const USER_AGENT =
  process.env.USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const extractGlassdoorDetail = async (browser, jobLink) => {
  const detailPage = await browser.newPage();
  await detailPage.setUserAgent(USER_AGENT);

  try {
    await detailPage.goto(jobLink, { waitUntil: "domcontentloaded", timeout: 60000 });
    await detailPage.waitForSelector(
      "[data-test='jobDescriptionContainer'], [data-test='description'], .JobDetails_jobDescription__uW_fK",
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
        document.querySelector("[data-test='jobDescriptionContainer']") ||
        document.querySelector("[data-test='description']") ||
        document.querySelector(".JobDetails_jobDescription__uW_fK") ||
        document.querySelector("main");

      const description = descriptionRoot?.innerText?.trim() || "";
      const bulletItems = Array.from(descriptionRoot?.querySelectorAll("li") || [])
        .map((item) => item.textContent?.trim() || "")
        .filter(Boolean);

      const locationText = pickText([
        "[data-test='location']",
        "[data-test='job-location']",
        ".JobDetails_location__mSg5h",
      ]);

      const employmentText = pickText([
        "[data-test='employmentType']",
        "[data-test='jobType']",
        "[class*='JobDetails_jobType']",
      ]);

      const salaryText = pickText([
        "[data-test='detailSalary']",
        "[data-test='salary']",
        ".JobDetails_salaryEstimate__QpbNw",
      ]);

      return {
        description,
        locationText,
        employmentText,
        salaryText,
        bulletItems,
      };
    });

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
      locationText: cleanText(detail.locationText),
      employmentText: cleanText(detail.employmentText),
      salaryText: cleanText(detail.salaryText),
      requirements,
      responsibilities,
    };
  } catch {
    return {
      description: "",
      locationText: "",
      employmentText: "",
      salaryText: "",
      requirements: [],
      responsibilities: [],
    };
  } finally {
    await detailPage.close().catch(() => null);
  }
};

const scrapeGlassdoor = async (query, location = "") => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);

    const listingMap = new Map();

    for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex += 1) {
      const fromAge = "30";
      const pageNumber = pageIndex + 1;
      const searchQuery = `${query} ${location || ""}`.trim();
      const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(
        searchQuery
      )}&fromAge=${fromAge}&p=${pageNumber}`;

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector("li[data-test='jobListing'], article[data-test='job-tile']", {
        timeout: 12000,
      }).catch(() => null);

      const listings = await page.evaluate(() => {
        const cards = Array.from(
          document.querySelectorAll("li[data-test='jobListing'], article[data-test='job-tile']")
        );

        return cards.map((card) => {
          const linkEl =
            card.querySelector("a[data-test='job-link']") ||
            card.querySelector("a.JobCard_jobTitle__GLyJ1") ||
            card.querySelector("a");

          const title =
            linkEl?.textContent?.trim() ||
            card.querySelector("[data-test='job-title']")?.textContent?.trim() ||
            "";

          const company =
            card.querySelector("[data-test='employer-name']")?.textContent?.trim() ||
            card.querySelector(".EmployerProfile_compactEmployerName__LE242")?.textContent?.trim() ||
            "";

          const locationRaw =
            card.querySelector("[data-test='job-location']")?.textContent?.trim() ||
            card.querySelector(".JobCard_location__Ds1fM")?.textContent?.trim() ||
            "";

          const description =
            card.querySelector("[data-test='job-description']")?.textContent?.replace(/\s+/g, " ").trim() ||
            "";

          const postedText =
            card.querySelector("[data-test='job-age']")?.textContent?.trim() ||
            card.querySelector(".JobCard_listingAge__TtR5k")?.textContent?.trim() ||
            "";

          const salary =
            card.querySelector("[data-test='detailSalary']")?.textContent?.trim() ||
            card.querySelector("[data-test='salary']")?.textContent?.trim() ||
            "";

          const href = linkEl?.getAttribute("href") || "";
          const logo = card.querySelector("img")?.getAttribute("src") || "";

          return {
            title,
            company,
            locationRaw,
            description,
            postedText,
            salary,
            href,
            logo,
          };
        });
      });

      for (const item of listings) {
        const normalizedLink = stripTrackingParams(normalizeUrl(item.href, "https://www.glassdoor.com"));

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

      await sleep(300);
    }

    const listingItems = [...listingMap.values()].slice(0, MAX_RESULTS);
    const geocodeCache = new Map();
    const normalizedJobs = [];

    for (let index = 0; index < listingItems.length; index += 1) {
      const item = listingItems[index];
      const detail = index < MAX_DETAIL_PAGES ? await extractGlassdoorDetail(browser, item.jobLink) : null;

      const locationValue = cleanText(detail?.locationText || item.locationRaw || "");
      if (!geocodeCache.has(locationValue)) {
        geocodeCache.set(locationValue, await geocodeLocation(locationValue));
      }

      const geo = geocodeCache.get(locationValue) || { lat: null, lon: null };
      const locationParts = normalizeLocationParts(locationValue);

      const description = cleanParagraphText(detail?.description || item.description || "");
      const combinedMetaText = [
        item.salary,
        detail?.salaryText,
        detail?.employmentText,
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
        source_logo: buildSourceLogo("glassdoor"),
        job_description: description,
        job_link: item.jobLink,
        job_apply_link: item.jobLink,
        job_city: locationParts.city,
        job_state: locationParts.state,
        job_country: locationParts.country,
        job_latitude: geo.lat,
        job_longitude: geo.lon,
        job_posted_at_datetime_utc: parsePostedDate(item.postedText),
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
        source: "glassdoor",
        source_url: item.jobLink,
        source_job_id: "",
      });

      if (index % 8 === 0) {
        await sleep(120);
      }
    }

    return normalizedJobs;
  } catch {
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = scrapeGlassdoor;
