import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { FaFacebookF, FaGithub, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from "react-icons/fa";
import { FiBarChart2, FiBookOpen, FiExternalLink, FiGlobe, FiHelpCircle, FiLink, FiSearch, FiUserCheck } from "react-icons/fi";
import { SiLeetcode, SiUpwork } from "react-icons/si";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  block_user,
  fetch_userAnalytics,
  fetch_userArticlespublic,
  fetch_userProblemspublic,
  fetch_userSolutionspublic,
  user_profilepublic,
} from "../../../api";
import AppPagination from "../../common/AppPagination";
import Loader from "../../Loader";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const getAssetUrl = (file, fallback = "/default_profile.jpg") => {
  if (file?.url) {
    return file.url;
  }

  if (!file?.destination || !file?.filename) {
    return fallback;
  }

  return `${API_BASE}/${file.destination}/${file.filename}`;
};

const socialIconFor = (label = "", url = "") => {
  const value = `${String(label).toLowerCase()} ${String(url).toLowerCase()}`;

  if (value.includes("linkedin")) return <FaLinkedin />;
  if (value.includes("leetcode")) return <SiLeetcode />;
  if (value.includes("instagram") || value.includes("insta")) return <FaInstagram />;
  if (value.includes("facebook") || value.includes("fb")) return <FaFacebookF />;
  if (value.includes("youtube")) return <FaYoutube />;
  if (value.includes("twitter") || value.includes("x.com")) return <FaTwitter />;
  if (value.includes("github")) return <FaGithub />;
  if (value.includes("upwork")) return <SiUpwork />;
  if (value.includes("website") || value.includes("http") || value.includes("www")) return <FiGlobe />;

  return <FiLink />;
};

const normalizeText = (value) => String(value || "").trim();

const buildSocialItems = (profile = {}) => {
  const dynamic = Array.isArray(profile?.social_links)
    ? profile.social_links
        .map((item, index) => ({
          key: `dynamic-${index}`,
          label: normalizeText(item?.label || item?.name) || "Link",
          value: normalizeText(item?.url || item?.link),
        }))
        .filter((item) => item.value)
    : [];

  const fixed = [
    { key: "linkedin_link", label: "LinkedIn", value: profile?.linkedin_link },
    { key: "leetcode_link", label: "LeetCode", value: profile?.leetcode_link },
    { key: "instagram_link", label: "Instagram", value: profile?.instagram_link },
    { key: "facebook_link", label: "Facebook", value: profile?.facebook_link },
    { key: "youtube_link", label: "YouTube", value: profile?.youtube_link },
    { key: "twitter_x_link", label: "X", value: profile?.twitter_x_link },
    { key: "github_link", label: "GitHub", value: profile?.github_link },
    { key: "website_link", label: "Website", value: profile?.website_link },
  ]
    .map((item) => ({ ...item, value: normalizeText(item.value) }))
    .filter((item) => item.value);

  const seen = new Set();
  return [...dynamic, ...fixed].filter((item) => {
    const dedupe = `${item.label.toLowerCase()}|${item.value.toLowerCase()}`;
    if (seen.has(dedupe)) {
      return false;
    }

    seen.add(dedupe);
    return true;
  });
};

const createTabState = () => ({
  items: [],
  total: 0,
  page: 0,
  limit: 6,
  query: "",
  input: "",
  loading: false,
  initialized: false,
  error: "",
});

const TAB_CONFIG = {
  problems: {
    label: "Problems",
    icon: <FiHelpCircle />,
    emptyText: "No public problems yet.",
  },
  solutions: {
    label: "Solutions",
    icon: <FiUserCheck />,
    emptyText: "No public solutions yet.",
  },
  articles: {
    label: "Articles",
    icon: <FiBookOpen />,
    emptyText: "No public articles yet.",
  },
};

const ANALYTICS_CATEGORY_CONFIG = [
  { key: "all", label: "All", color: "#7d8590" },
  { key: "problems", label: "Problems", color: "#0969da" },
  { key: "solutions", label: "Solutions", color: "#1a7f37" },
  { key: "articles", label: "Articles", color: "#fb8500" },
];

function User_public() {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewer = useSelector((state) => state.userReducer.current_user);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [activeTab, setActiveTab] = useState("problems");
  const [tabs, setTabs] = useState({
    problems: createTabState(),
    solutions: createTabState(),
    articles: createTabState(),
  });

  const [analyticsRange, setAnalyticsRange] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [analyticsCategory, setAnalyticsCategory] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const isAdmin = viewer?.role === "admin";
  const isOwner = viewer?._id && String(viewer._id) === String(id);
  const canSeeAnalytics = Boolean(viewer?._id) && (isOwner || isAdmin);

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      setProfileError("");
      const { data } = await user_profilepublic(id);
      setProfile(data || null);
    } catch (error) {
      setProfile(null);
      setProfileError(error?.response?.data?.message || error?.message || "Unable to load profile.");
    } finally {
      setLoadingProfile(false);
    }
  }, [id]);

  const loadTab = useCallback(
    async (tabKey, options = {}) => {
      const prev = tabs[tabKey];
      if (!prev) {
        return;
      }

      const page = Number(options.page ?? prev.page ?? 0);
      const limit = Number(options.limit ?? prev.limit ?? 6);
      const query = typeof options.query === "string" ? options.query : prev.query || "";

      setTabs((current) => ({
        ...current,
        [tabKey]: {
          ...current[tabKey],
          page,
          limit,
          query,
          loading: true,
          error: "",
        },
      }));

      try {
        let response = null;
        if (tabKey === "problems") {
          response = await fetch_userProblemspublic(id, { page, limit, q: query });
        } else if (tabKey === "solutions") {
          response = await fetch_userSolutionspublic(id, { page, limit, q: query });
        } else {
          response = await fetch_userArticlespublic(id, { page, limit, q: query });
        }

        const data = response?.data || {};
        const key = tabKey === "articles" ? "articles" : tabKey;
        const items = Array.isArray(data?.[key])
          ? data[key]
          : Array.isArray(data?.items)
            ? data.items
            : [];

        setTabs((current) => ({
          ...current,
          [tabKey]: {
            ...current[tabKey],
            items,
            total: Number(data?.total) || items.length,
            page: Number(data?.page ?? page),
            limit: Number(data?.limit ?? limit),
            query,
            input: current[tabKey].input,
            loading: false,
            initialized: true,
            error: "",
          },
        }));
      } catch (error) {
        setTabs((current) => ({
          ...current,
          [tabKey]: {
            ...current[tabKey],
            loading: false,
            initialized: true,
            error: error?.response?.data?.message || error?.message || "Unable to load.",
          },
        }));
      }
    },
    [id, tabs]
  );

  const loadAnalytics = useCallback(async () => {
    if (analyticsRange === "custom" && (!customStart || !customEnd)) {
      setAnalytics(null);
      setAnalyticsError("");
      return;
    }
    if (!canSeeAnalytics) {
      return;
    }

    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      const { data } = await fetch_userAnalytics(id, {
        range: analyticsRange,
        start: analyticsRange === "custom" ? customStart : "",
        end: analyticsRange === "custom" ? customEnd : "",
      });
      setAnalytics(data || null);
    } catch (error) {
      setAnalytics(null);
      setAnalyticsError(error?.response?.data?.message || error?.message || "Unable to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [analyticsRange, canSeeAnalytics, customEnd, customStart, id]);

  useEffect(() => {
    setTabs({
      problems: createTabState(),
      solutions: createTabState(),
      articles: createTabState(),
    });
    setActiveTab("problems");
    setAnalytics(null);
    setAnalyticsError("");
    setAnalyticsCategory("all");
    setCustomStart("");
    setCustomEnd("");
    loadProfile();
  }, [id, loadProfile]);

  useEffect(() => {
    const tab = tabs[activeTab];
    if (!tab || tab.initialized || tab.loading) {
      return;
    }

    loadTab(activeTab);
  }, [activeTab, loadTab, tabs]);

  useEffect(() => {
    if (canSeeAnalytics) {
      loadAnalytics();
    }
  }, [canSeeAnalytics, loadAnalytics]);

  const activeTabState = tabs[activeTab] || createTabState();
  const pageCount = Math.max(1, Math.ceil((activeTabState.total || 0) / (activeTabState.limit || 6)));

  const socialItems = useMemo(() => buildSocialItems(profile?.profile), [profile?.profile]);
  const achievements = useMemo(() => {
    if (!Array.isArray(profile?.profile?.achievements)) {
      return [];
    }

    return profile.profile.achievements.filter((item) => item?.title || item?.description || item?.link);
  }, [profile?.profile?.achievements]);

  const analyticsSeriesValue = useMemo(() => {
    return (item = {}) => {
      if (analyticsCategory === "all") {
        return Number(item.total) || 0;
      }

      return Number(item?.[analyticsCategory]) || 0;
    };
  }, [analyticsCategory]);

  const chartMax = useMemo(() => {
    if (!Array.isArray(analytics?.series) || analytics.series.length === 0) {
      return 1;
    }

    return Math.max(...analytics.series.map((item) => analyticsSeriesValue(item)), 1);
  }, [analytics?.series, analyticsSeriesValue]);

  const toggleBlock = async () => {
    if (!isAdmin || !profile?._id || String(viewer?._id) === String(profile._id)) {
      return;
    }

    try {
      const { data } = await block_user(profile._id);
      setProfile((current) => (current ? { ...current, isblock: data?.isblock } : current));
    } catch (error) {
      console.log("block toggle error", error);
    }
  };

  if (loadingProfile && !profile) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (profileError) {
    return <div className="px-6 py-10 text-center text-lg text-[var(--app-danger-text)]">{profileError}</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="theme-surface overflow-hidden rounded-md border">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(47,129,247,0.28),transparent_45%),linear-gradient(120deg,var(--app-bg-soft),var(--app-bg-panel))] px-6 py-8 md:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <img
                  src={getAssetUrl(profile.profile_img_)}
                  alt={profile.username}
                  className="h-24 w-24 rounded-full border border-[var(--app-border)] object-cover"
                />
                <div>
                  <h1 className="text-3xl font-semibold md:text-4xl">{profile.name}</h1>
                  <div className="theme-text-muted mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span>@{profile.username}</span>
                    <span>{profile.email}</span>
                    <span>Joined {profile.createdAt ? format(new Date(profile.createdAt), "MMM d, yyyy") : "recently"}</span>
                    {profile.isblock ? <span className="text-[var(--app-danger-text)]">Blocked</span> : null}
                  </div>
                  <p className="theme-text-muted mt-3 max-w-3xl text-sm leading-7">
                    {profile?.profile?.experience || "No experience summary added yet."}
                  </p>
                </div>
              </div>

              {isAdmin && String(viewer?._id) !== String(profile._id) ? (
                <button
                  type="button"
                  onClick={toggleBlock}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    profile.isblock ? "theme-button-secondary" : "theme-button-danger"
                  }`}
                >
                  {profile.isblock ? "Unblock user" : "Block user"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-5 border-t border-[var(--app-border)] p-6 md:grid-cols-2 md:p-8">
            <div>
              <h3 className="text-lg font-semibold">Education</h3>
              <div className="theme-text-muted mt-2 space-y-2 text-sm">
                {Array.isArray(profile?.profile?.education) && profile.profile.education.length > 0
                  ? profile.profile.education.map((item, index) => <div key={`${item}-${index}`}>{item}</div>)
                  : <div>No education entries.</div>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(profile?.profile?.skills) && profile.profile.skills.length > 0
                  ? profile.profile.skills.map((item, index) => (
                    <span key={`${item}-${index}`} className="rounded-full bg-[#ddf4ff] px-3 py-1 text-xs font-medium text-[#0969da]">
                      {item}
                    </span>
                  ))
                  : <span className="theme-text-muted text-sm">No skills listed.</span>}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Projects</h3>
              <div className="theme-text-muted mt-2 space-y-3 text-sm">
                {Array.isArray(profile?.profile?.project) && profile.profile.project.length > 0 ? (
                  profile.profile.project.map((project, index) => (
                    <div key={`${project?.Project_title || "project"}-${index}`} className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2">
                      <div className="font-semibold text-[var(--app-text)]">{project?.Project_title || "Project"}</div>
                      <div className="mt-1">{project?.Project_exp || "No description."}</div>
                    </div>
                  ))
                ) : (
                  <div>No projects listed.</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Achievements</h3>
              <div className="theme-text-muted mt-2 space-y-3 text-sm">
                {achievements.length > 0 ? (
                  achievements.map((item, index) => (
                    <div key={`${item?.title || "achievement"}-${index}`} className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2">
                      <div className="font-semibold text-[var(--app-text)]">{item?.title || "Achievement"}</div>
                      {item?.description ? <div className="mt-1">{item.description}</div> : null}
                      {item?.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--app-accent)] hover:underline"
                        >
                          View proof
                          <FiExternalLink className="text-[10px]" />
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div>No achievements listed.</div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold">Social links</h3>
              {socialItems.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {socialItems.map((item) => (
                    <a
                      key={item.key}
                      href={item.value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2 text-sm"
                    >
                      {socialIconFor(item.label, item.value)}
                      <span>{item.label}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="theme-text-muted mt-2 text-sm">No social links shared.</div>
              )}
            </div>
          </div>
        </section>

        {canSeeAnalytics ? (
          <section className="theme-surface rounded-md border p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="inline-flex items-center gap-2 text-xl font-semibold">
                  <FiBarChart2 className="text-[var(--app-accent)]" />
                  Activity Analytics
                </h2>
                <p className="theme-text-muted mt-1 text-sm">Filter by date range to inspect contributions over time.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {["day", "week", "month", "year", "custom"].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAnalyticsRange(range)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase ${
                      analyticsRange === range ? "theme-button-primary" : "theme-button-secondary"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {analyticsRange === "custom" ? (
              <div className="mt-3 flex flex-wrap gap-3">
                <input
                  type="date"
                  value={customStart}
                  onChange={(event) => setCustomStart(event.target.value)}
                  className="theme-input rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  value={customEnd}
                  onChange={(event) => setCustomEnd(event.target.value)}
                  className="theme-input rounded-md px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={loadAnalytics}
                  className="theme-button-secondary rounded-md px-3 py-2 text-sm font-semibold"
                >
                  Apply
                </button>
              </div>
            ) : null}

            {analyticsLoading ? (
              <div className="mt-6 flex justify-center py-8">
                <Loader />
              </div>
            ) : analyticsError ? (
              <div className="mt-4 text-sm text-[var(--app-danger-text)]">{analyticsError}</div>
            ) : analytics ? (
              <>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-3">
                    <div className="theme-text-subtle text-xs uppercase tracking-[0.12em]">Problems</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics?.summary?.problems || 0}</div>
                  </div>
                  <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-3">
                    <div className="theme-text-subtle text-xs uppercase tracking-[0.12em]">Solutions</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics?.summary?.solutions || 0}</div>
                  </div>
                  <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-3">
                    <div className="theme-text-subtle text-xs uppercase tracking-[0.12em]">Articles</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics?.summary?.articles || 0}</div>
                  </div>
                  <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-4 py-3">
                    <div className="theme-text-subtle text-xs uppercase tracking-[0.12em]">Total</div>
                    <div className="mt-2 text-2xl font-semibold">{analytics?.summary?.total || 0}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ANALYTICS_CATEGORY_CONFIG.map((category) => (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => setAnalyticsCategory(category.key)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase ${
                        analyticsCategory === category.key ? "theme-button-primary" : "theme-button-secondary"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 overflow-x-auto">
                  <div className="grid min-w-[640px] grid-cols-[repeat(auto-fit,minmax(48px,1fr))] gap-2">
                    {(analytics.series || []).map((item) => {
                      const seriesValue = analyticsSeriesValue(item);
                      const heightBase = Math.max((seriesValue / chartMax) * 160, seriesValue ? 8 : 2);
                      const p = Number(item.problems) || 0;
                      const s = Number(item.solutions) || 0;
                      const a = Number(item.articles) || 0;
                      const total = Math.max(p + s + a, 1);

                      return (
                        <div key={item.key} className="flex flex-col items-center gap-2">
                          <div className="text-[10px] text-[var(--app-muted)]">{seriesValue}</div>
                          <div className="flex h-[170px] w-full items-end justify-center">
                            {analyticsCategory === "all" ? (
                              <div className="flex w-7 flex-col overflow-hidden rounded-sm border border-[var(--app-border)] bg-[var(--app-bg-soft)]">
                                <div style={{ height: `${(a / total) * heightBase}px` }} className="bg-[#fb8500]" />
                                <div style={{ height: `${(s / total) * heightBase}px` }} className="bg-[#1a7f37]" />
                                <div style={{ height: `${(p / total) * heightBase}px` }} className="bg-[#0969da]" />
                              </div>
                            ) : (
                              <div className="flex w-7 flex-col overflow-hidden rounded-sm border border-[var(--app-border)] bg-[var(--app-bg-soft)]">
                                <div
                                  style={{
                                    height: `${heightBase}px`,
                                    backgroundColor:
                                      ANALYTICS_CATEGORY_CONFIG.find((category) => category.key === analyticsCategory)?.color || "#7d8590",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <div className="theme-text-muted text-center text-[10px] leading-4">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="theme-text-muted mt-3 text-xs">
                  Showing {ANALYTICS_CATEGORY_CONFIG.find((category) => category.key === analyticsCategory)?.label || "All"} activity for the selected date range.
                </div>

                <div className="mt-5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-4">
                  <div className="mb-3 font-semibold">Recent activity (last 5)</div>
                  {(analytics.recentActivity || []).length > 0 ? (
                    <div className="space-y-2">
                      {analytics.recentActivity.map((item) => (
                        <button
                          key={`${item.type}-${item.id}`}
                          type="button"
                          onClick={() => item.route && navigate(item.route)}
                          className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-left hover:bg-[var(--app-bg-soft)]"
                        >
                          <div className="text-sm font-medium capitalize">{item.type}</div>
                          <div className="theme-text-muted mt-1 text-sm">{item.title || "Untitled"}</div>
                          <div className="theme-text-subtle mt-1 text-xs">
                            {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "recently"}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="theme-text-muted text-sm">No recent activity in this range.</div>
                  )}
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        <section className="theme-surface rounded-md border p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="theme-soft-surface flex items-center gap-2 rounded-md p-1">
              {Object.entries(TAB_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                    activeTab === key ? "theme-button-primary" : "theme-button-secondary"
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const nextQuery = tabs[activeTab].input.trim();
                setTabs((current) => ({
                  ...current,
                  [activeTab]: {
                    ...current[activeTab],
                    page: 0,
                    query: nextQuery,
                  },
                }));
                loadTab(activeTab, { page: 0, query: nextQuery });
              }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2">
                <FiSearch className="text-[var(--app-muted)]" />
                <input
                  value={activeTabState.input}
                  onChange={(event) => {
                    const nextInput = event.target.value;
                    setTabs((current) => ({
                      ...current,
                      [activeTab]: {
                        ...current[activeTab],
                        input: nextInput,
                      },
                    }));
                  }}
                  placeholder={`Search ${TAB_CONFIG[activeTab].label.toLowerCase()}`}
                  className="w-[180px] bg-transparent text-sm outline-none placeholder:text-[var(--app-subtle)]"
                />
              </div>
              <button type="submit" className="theme-button-secondary rounded-md px-3 py-2 text-sm font-semibold">
                Search
              </button>
            </form>
          </div>

          <div className="mt-5">
            {activeTabState.loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : activeTabState.error ? (
              <div className="text-sm text-[var(--app-danger-text)]">{activeTabState.error}</div>
            ) : activeTabState.items.length > 0 ? (
              <div className="space-y-3">
                {activeTabState.items.map((item) => {
                  const isProblem = activeTab === "problems";
                  const isSolution = activeTab === "solutions";
                  const route = isProblem
                    ? `/problem/${item._id}/sols`
                    : isSolution
                      ? (item.p_id ? `/problem/${item.p_id}/sols?s_id=${item._id}` : "/community")
                      : `/article/${item._id}`;

                  const title = isProblem
                    ? item.title
                    : isSolution
                      ? item.p_title || "Solution"
                      : item.title;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => navigate(route)}
                      className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-4 py-3 text-left transition hover:bg-[var(--app-bg-soft)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[var(--app-text)]">{title}</div>
                          <div className="theme-text-muted mt-1 text-sm">
                            {isProblem
                              ? `${item.total_sol || 0} answers • ${item.likes || 0} likes`
                              : isSolution
                                ? `${item.vote || 0} score • ${item.total_comments || 0} comments`
                                : `${item.likes || 0} likes • ${item.total_comments || 0} comments`}
                          </div>
                        </div>
                        <div className="theme-text-subtle text-xs">
                          {item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "recently"}
                        </div>
                      </div>

                      {Array.isArray(item.tags) && item.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {item.tags.slice(0, 4).map((tag, index) => (
                            <span key={`${item._id}-${tag}-${index}`} className="rounded-full bg-[#ddf4ff] px-2.5 py-0.5 text-xs font-medium text-[#0969da]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="theme-text-muted rounded-md border border-dashed border-[var(--app-border)] px-4 py-10 text-center text-sm">
                {TAB_CONFIG[activeTab].emptyText}
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-center">
            <AppPagination
              pageCount={pageCount}
              currentPage={activeTabState.page}
              onPageChange={(event) => loadTab(activeTab, { page: event.selected })}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default User_public;



