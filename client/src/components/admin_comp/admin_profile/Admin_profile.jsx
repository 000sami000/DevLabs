import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiEdit3,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import { useParams } from "react-router-dom";
import Loader from "../../Loader";
import { fetch_admin_user_overview, update_userProfile } from "../../../api";
import getAssetUrl from "../../../utils/getAssetUrl";

const RANGE_OPTIONS = ["day", "week", "month", "year", "custom"];

const METRIC_COLORS = {
  users: "#2563eb",
  articles: "#f59e0b",
  problems: "#22c55e",
  solutions: "#8b5cf6",
  reports: "#ef4444",
};

const createProfileDraft = (profile = {}) => ({
  experience: profile?.experience || "",
  education: Array.isArray(profile?.education) ? profile.education : [],
  skills: Array.isArray(profile?.skills) ? profile.skills : [],
  project: Array.isArray(profile?.project) ? profile.project : [],
});

const getSummaryCards = (summary = {}) => [
  {
    key: "users",
    label: "Users",
    value: summary.users || 0,
    helper: "Registered accounts",
    icon: <FiUsers />,
  },
  {
    key: "articles",
    label: "Articles",
    value: summary.articles || 0,
    helper: "Published write-ups",
    icon: <FiFileText />,
  },
  {
    key: "problems",
    label: "Problems",
    value: summary.problems || 0,
    helper: "Community problem posts",
    icon: <FiActivity />,
  },
  {
    key: "solutions",
    label: "Solutions",
    value: summary.solutions || 0,
    helper: "Shared answers",
    icon: <FiBarChart2 />,
  },
  {
    key: "reports",
    label: "Reports",
    value: summary.reports || 0,
    helper: "Pending moderation signals",
    icon: <FiAlertTriangle />,
  },
];

function StatCard({ card }) {
  return (
    <div className="theme-soft-surface rounded-md border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="theme-text-subtle text-xs uppercase tracking-[0.14em]">{card.label}</div>
          <div className="mt-2 text-3xl font-semibold">{card.value}</div>
          <div className="theme-text-muted mt-1 text-xs">{card.helper}</div>
        </div>
        <div
          className="rounded-md border p-2 text-base"
          style={{ borderColor: `${METRIC_COLORS[card.key]}55`, color: METRIC_COLORS[card.key] }}
        >
          {card.icon}
        </div>
      </div>
    </div>
  );
}

function ActivityChart({ series = [] }) {
  const chartMax = useMemo(
    () => Math.max(...series.map((row) => Number(row.total) || 0), 1),
    [series]
  );

  return (
    <div className="theme-soft-surface rounded-md border p-5">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Activity Chart</h3>
        <p className="theme-text-muted mt-1 text-sm">
          Users, articles, problems, solutions, and reports over the selected range.
        </p>
      </div>

      {series.length === 0 ? (
        <div className="theme-text-muted text-sm">No activity data in this range.</div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-[760px] items-end gap-2">
            {series.map((row) => {
              const total = Number(row.total) || 0;
              const height = Math.max((total / chartMax) * 180, total > 0 ? 8 : 2);
              const safeTotal = Math.max(total, 1);

              const stack = [
                { key: "users", value: Number(row.users) || 0 },
                { key: "articles", value: Number(row.articles) || 0 },
                { key: "problems", value: Number(row.problems) || 0 },
                { key: "solutions", value: Number(row.solutions) || 0 },
                { key: "reports", value: Number(row.reports) || 0 },
              ];

              return (
                <div key={row.key} className="flex w-12 flex-col items-center gap-2">
                  <div className="text-[10px] text-[var(--app-subtle)]">{total}</div>
                  <div className="flex h-[190px] w-full items-end justify-center">
                    <div className="flex w-8 flex-col overflow-hidden rounded-sm border border-[var(--app-border)] bg-[var(--app-bg-soft)]">
                      {stack.map((entry) => (
                        <div
                          key={`${row.key}-${entry.key}`}
                          style={{
                            height: `${(entry.value / safeTotal) * height}px`,
                            backgroundColor: METRIC_COLORS[entry.key],
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="theme-text-muted text-center text-[10px] leading-4">{row.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: METRIC_COLORS.users }} />Users</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: METRIC_COLORS.articles }} />Articles</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: METRIC_COLORS.problems }} />Problems</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: METRIC_COLORS.solutions }} />Solutions</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: METRIC_COLORS.reports }} />Reports</span>
      </div>
    </div>
  );
}

function Admin_profile() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);

  const [range, setRange] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState(createProfileDraft());
  const [eduInput, setEduInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [projectDraft, setProjectDraft] = useState({ title: "", description: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const loadDashboard = async ({ selectedRange = range, start = customStart, end = customEnd, spinner = true } = {}) => {
    try {
      if (spinner) {
        if (!dashboard) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
      }

      setError("");

      const { data } = await fetch_admin_user_overview(id, {
        range: selectedRange,
        start: selectedRange === "custom" ? start : "",
        end: selectedRange === "custom" ? end : "",
      });

      setDashboard(data || null);
      setDraftProfile(createProfileDraft(data?.profile?.profile));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard({ selectedRange: "month" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const cards = useMemo(() => getSummaryCards(dashboard?.summary), [dashboard?.summary]);

  const rangeStartLabel = dashboard?.range?.start
    ? new Date(dashboard.range.start).toLocaleDateString()
    : "-";
  const rangeEndLabel = dashboard?.range?.end
    ? new Date(dashboard.range.end).toLocaleDateString()
    : "-";

  const handleRangeClick = (nextRange) => {
    setRange(nextRange);
    if (nextRange !== "custom") {
      loadDashboard({ selectedRange: nextRange });
    }
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) {
      return;
    }

    loadDashboard({ selectedRange: "custom", start: customStart, end: customEnd });
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      await update_userProfile(id, draftProfile);
      setEditOpen(false);
      await loadDashboard({ selectedRange: range, start: customStart, end: customEnd, spinner: false });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="rounded-md border border-[var(--app-border)] px-4 py-6 text-sm text-[var(--app-danger-text)]">
        {error}
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="theme-soft-surface rounded-md border p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <img
              src={getAssetUrl(dashboard?.profile?.profile_img_)}
              alt={dashboard?.profile?.username || "Admin"}
              className="h-20 w-20 rounded-md border border-[var(--app-border)] object-cover"
            />
            <div>
              <div className="theme-badge inline-flex rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                Admin dashboard
              </div>
              <h2 className="mt-3 text-3xl font-semibold">
                {dashboard?.profile?.name || dashboard?.profile?.username}
              </h2>
              <p className="theme-text-muted mt-1 text-sm">{dashboard?.profile?.email}</p>
              <p className="theme-text-muted mt-1 text-xs">
                Range: {dashboard?.range?.key} ({rangeStartLabel} - {rangeEndLabel})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleRangeClick(option)}
                className={`rounded-md px-3 py-2 text-xs font-semibold uppercase ${
                  range === option ? "theme-button-primary" : "theme-button-secondary"
                }`}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold"
            >
              <FiEdit3 /> Edit profile
            </button>
          </div>
        </div>

        {range === "custom" ? (
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="theme-text-subtle text-xs">
              Start
              <input
                type="date"
                value={customStart}
                onChange={(event) => setCustomStart(event.target.value)}
                className="theme-input mt-1 rounded-md px-3 py-2 text-sm"
              />
            </label>
            <label className="theme-text-subtle text-xs">
              End
              <input
                type="date"
                value={customEnd}
                onChange={(event) => setCustomEnd(event.target.value)}
                className="theme-input mt-1 rounded-md px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={handleApplyCustom}
              className="theme-button-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
            >
              <FiCalendar /> Apply range
            </button>
          </div>
        ) : null}

        {refreshing ? <div className="theme-text-muted mt-3 text-xs">Refreshing data...</div> : null}
        {error ? <div className="mt-3 text-sm text-[var(--app-danger-text)]">{error}</div> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.key} card={card} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <ActivityChart series={dashboard?.activitySeries || []} />

        <div className="theme-soft-surface rounded-md border p-5">
          <h3 className="text-xl font-semibold">Recent Activity</h3>
          <p className="theme-text-muted mt-1 text-sm">Latest platform events within the selected range.</p>
          <div className="mt-4 space-y-2">
            {(dashboard?.recentActivity || []).length > 0 ? (
              dashboard.recentActivity.slice(0, 12).map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2"
                >
                  <div className="text-xs uppercase tracking-[0.12em] text-[var(--app-subtle)]">{item.type}</div>
                  <div className="mt-1 text-sm font-medium">{item.title}</div>
                  <div className="theme-text-muted mt-1 inline-flex items-center gap-1 text-xs">
                    <FiClock />
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "recently"}
                  </div>
                </div>
              ))
            ) : (
              <div className="theme-text-muted text-sm">No recent activity in this range.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="theme-soft-surface rounded-md border p-5">
          <h3 className="text-xl font-semibold">Top Contributors</h3>
          <p className="theme-text-muted mt-1 text-sm">Users with the highest content output in this range.</p>
          <div className="mt-4 space-y-2">
            {(dashboard?.userAnalytics?.topContributors || []).length > 0 ? (
              dashboard.userAnalytics.topContributors.map((row) => (
                <div
                  key={row.user_id}
                  className="flex items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{row.name}</div>
                    <div className="theme-text-muted truncate text-xs">@{row.username}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div>{row.total} total</div>
                    <div className="theme-text-muted">P:{row.problems} S:{row.solutions} A:{row.articles}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="theme-text-muted text-sm">No contributor activity in this range.</div>
            )}
          </div>
        </div>

        <div className="theme-soft-surface rounded-md border p-5">
          <h3 className="text-xl font-semibold">User Risk Signals</h3>
          <p className="theme-text-muted mt-1 text-sm">Users receiving the most reports in this range.</p>
          <div className="mt-4 space-y-2">
            {(dashboard?.userAnalytics?.topReportedUsers || []).length > 0 ? (
              dashboard.userAnalytics.topReportedUsers.map((row) => (
                <div
                  key={row.user_id}
                  className="flex items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{row.name}</div>
                    <div className="theme-text-muted truncate text-xs">@{row.username}</div>
                  </div>
                  <div className="text-sm font-semibold text-[var(--app-danger-text)]">{row.totalReports} reports</div>
                </div>
              ))
            ) : (
              <div className="theme-text-muted text-sm">No report signals in this range.</div>
            )}
          </div>

          <div className="mt-5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] p-3 text-sm">
            <div className="font-semibold">User analytics summary</div>
            <div className="theme-text-muted mt-2 space-y-1 text-xs">
              <div>Total users: {dashboard?.userAnalytics?.totalUsers || 0}</div>
              <div>New users in range: {dashboard?.userAnalytics?.newUsersInRange || 0}</div>
              <div>Active users in range: {dashboard?.userAnalytics?.activeUsersInRange || 0}</div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        isOpen={editOpen}
        onRequestClose={() => setEditOpen(false)}
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
            width: "min(880px, 94vw)",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: "10px",
            border: "1px solid var(--app-border)",
            background: "var(--app-bg-panel)",
            color: "var(--app-text)",
          },
        }}
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold">Edit Admin Profile</h3>
              <p className="theme-text-muted mt-1 text-sm">Update profile details shown in dashboard and public profile.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="theme-button-secondary rounded-md px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingProfile}
                onClick={saveProfile}
                className="theme-button-primary rounded-md px-4 py-2 text-sm font-semibold"
              >
                {savingProfile ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Experience</label>
            <textarea
              value={draftProfile.experience}
              onChange={(event) =>
                setDraftProfile((prev) => ({
                  ...prev,
                  experience: event.target.value,
                }))
              }
              rows={5}
              className="theme-input w-full rounded-md p-3"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">Education</label>
              <div className="space-y-2">
                {draftProfile.education.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2 text-sm"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          education: prev.education.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={eduInput}
                  onChange={(event) => setEduInput(event.target.value)}
                  className="theme-input flex-1 rounded-md px-3 py-2 text-sm"
                  placeholder="Add education"
                />
                <button
                  type="button"
                  className="theme-button-secondary rounded-md px-3 py-2 text-sm"
                  onClick={() => {
                    const next = eduInput.trim();
                    if (!next) {
                      return;
                    }
                    setDraftProfile((prev) => ({
                      ...prev,
                      education: [...prev.education, next],
                    }));
                    setEduInput("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Skills</label>
              <div className="space-y-2">
                {draftProfile.skills.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2 text-sm"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          skills: prev.skills.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  value={skillInput}
                  onChange={(event) => setSkillInput(event.target.value)}
                  className="theme-input flex-1 rounded-md px-3 py-2 text-sm"
                  placeholder="Add skill"
                />
                <button
                  type="button"
                  className="theme-button-secondary rounded-md px-3 py-2 text-sm"
                  onClick={() => {
                    const next = skillInput.trim();
                    if (!next) {
                      return;
                    }
                    setDraftProfile((prev) => ({
                      ...prev,
                      skills: [...prev.skills, next],
                    }));
                    setSkillInput("");
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Projects</label>
            <div className="space-y-2">
              {draftProfile.project.map((project, index) => (
                <div
                  key={`${project?.Project_title || "project"}-${index}`}
                  className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{project?.Project_title || "Untitled"}</div>
                      <div className="theme-text-muted mt-1 text-xs">{project?.Project_exp || "No description"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setDraftProfile((prev) => ({
                          ...prev,
                          project: prev.project.filter((_, i) => i !== index),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <input
                value={projectDraft.title}
                onChange={(event) =>
                  setProjectDraft((prev) => ({
                    ...prev,
                    title: event.target.value,
                  }))
                }
                className="theme-input rounded-md px-3 py-2 text-sm"
                placeholder="Project title"
              />
              <input
                value={projectDraft.description}
                onChange={(event) =>
                  setProjectDraft((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                className="theme-input rounded-md px-3 py-2 text-sm"
                placeholder="Project description"
              />
              <button
                type="button"
                className="theme-button-secondary rounded-md px-3 py-2 text-sm"
                onClick={() => {
                  const title = projectDraft.title.trim();
                  const description = projectDraft.description.trim();
                  if (!title && !description) {
                    return;
                  }

                  setDraftProfile((prev) => ({
                    ...prev,
                    project: [
                      ...prev.project,
                      {
                        Project_title: title || "Untitled",
                        Project_exp: description,
                      },
                    ],
                  }));

                  setProjectDraft({ title: "", description: "" });
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Admin_profile;
