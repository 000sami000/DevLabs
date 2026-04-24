import React, { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  FiArrowRight,
  FiBarChart2,
  FiFileText,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { fetch_all_users } from "../../../api";
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

const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const getContributionTotal = (user) =>
  (user?.article_count || 0) + (user?.problem_count || 0) + (user?.solution_count || 0);

const buildSignupSeries = (items = [], days = 14) => {
  const buckets = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: format(date, "MMM d"),
      value: 0,
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  items.forEach((item) => {
    if (!item?.createdAt) {
      return;
    }

    const key = new Date(item.createdAt).toISOString().slice(0, 10);
    if (bucketMap.has(key)) {
      bucketMap.get(key).value += 1;
    }
  });

  return buckets;
};

const OverviewCard = ({ label, value, helper, icon, accent }) => (
  <div className="theme-soft-surface rounded-[26px] border p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="theme-text-subtle text-[11px] uppercase tracking-[0.22em]">{label}</div>
        <div className="mt-3 text-3xl font-semibold">{value}</div>
        {helper ? <div className="theme-text-muted mt-2 text-sm leading-6">{helper}</div> : null}
      </div>
      <div
        className="rounded-full p-3 text-lg"
        style={{ backgroundColor: `${accent}1f`, color: accent }}
      >
        {icon}
      </div>
    </div>
  </div>
);

const TrendChart = ({ series }) => {
  const maxValue = Math.max(...series.map((item) => item.value), 1);

  return (
    <div className="theme-soft-surface rounded-[28px] border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">User registrations</h3>
          <p className="theme-text-muted mt-1 text-sm leading-6">
            Signups across the last 14 days to spot momentum and slowdowns.
          </p>
        </div>
        <div className="theme-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          14-day view
        </div>
      </div>

      <div className="mt-6 flex h-[220px] items-end gap-2">
        {series.map((item) => (
          <div key={item.key} className="flex flex-1 flex-col items-center justify-end gap-3">
            <div className="theme-text-muted text-[11px]">{item.value}</div>
            <div className="flex h-[170px] w-full items-end justify-center rounded-full bg-[var(--app-bg-soft)]/80 px-1 py-1">
              <div
                className="w-full rounded-full"
                style={{
                  height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 10 : 0)}%`,
                  background:
                    "linear-gradient(180deg, rgba(121,211,164,0.95) 0%, rgba(74,146,109,0.92) 100%)",
                }}
              />
            </div>
            <div className="theme-text-muted text-[11px]">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContributionMix = ({ totals, averageContribution }) => {
  const maxValue = Math.max(totals.articles, totals.problems, totals.solutions, 1);
  const items = [
    { label: "Articles", value: totals.articles, color: "#f7b267" },
    { label: "Problems", value: totals.problems, color: "#6cc9ff" },
    { label: "Solutions", value: totals.solutions, color: "#c79bff" },
  ];

  return (
    <div className="theme-soft-surface rounded-[28px] border p-5">
      <h3 className="text-xl font-semibold">Contribution mix</h3>
      <p className="theme-text-muted mt-1 text-sm leading-6">
        Content output across the user base. Average contributions per account: {averageContribution.toFixed(1)}.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
              <span className="theme-text-muted">{formatCompactNumber(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[var(--app-bg-soft)]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MemberBreakdown = ({ creators, learners, blocked, total }) => {
  const creatorPercent = total ? (creators / total) * 100 : 0;
  const learnerPercent = total ? (learners / total) * 100 : 0;
  const blockedPercent = total ? (blocked / total) * 100 : 0;

  return (
    <div className="theme-soft-surface rounded-[28px] border p-5">
      <h3 className="text-xl font-semibold">Member breakdown</h3>
      <p className="theme-text-muted mt-1 text-sm leading-6">
        Who is creating content, who is mostly browsing, and how much of the base is blocked.
      </p>

      <div className="mt-6 flex items-center gap-5">
        <div
          className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#86f7a2 0 ${creatorPercent}%, #6cc9ff ${creatorPercent}% ${creatorPercent + learnerPercent}%, #ff9f8b ${creatorPercent + learnerPercent}% 100%)`,
          }}
        >
          <div className="theme-surface flex h-24 w-24 flex-col items-center justify-center rounded-full border text-center">
            <div className="text-2xl font-semibold">{total}</div>
            <div className="theme-text-muted text-[11px] uppercase tracking-[0.16em]">Accounts</div>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 text-sm">
          {[
            { label: "Creators", value: creators, color: "#86f7a2" },
            { label: "Learners", value: learners, color: "#6cc9ff" },
            { label: "Blocked", value: blocked, color: "#ff9f8b" },
          ].map((item) => (
            <div key={item.label} className="theme-input rounded-[18px] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TopContributors = ({ users }) => {
  const maxValue = Math.max(...users.map((user) => getContributionTotal(user)), 1);

  return (
    <div className="theme-soft-surface rounded-[28px] border p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Top contributors</h3>
          <p className="theme-text-muted mt-1 text-sm leading-6">
            Members with the highest combined output across articles, problems, and solutions.
          </p>
        </div>
        <div className="theme-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          Top {users.length}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {users.map((user, index) => {
          const total = getContributionTotal(user);
          return (
            <div key={user._id} className="rounded-[22px] border border-[var(--app-border)] bg-[var(--app-bg-soft)]/65 p-4">
              <div className="flex items-center gap-3">
                <div className="theme-text-muted w-6 text-sm font-semibold">{index + 1}</div>
                <img
                  src={getAssetUrl(user.profile_img_)}
                  alt={user.username}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{user.username}</div>
                  <div className="theme-text-muted text-xs">{user.name || "Community member"}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{total}</div>
                  <div className="theme-text-muted text-xs">total contributions</div>
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--app-bg-panel)]">
                <div
                  className="h-full rounded-full bg-[var(--app-accent)]"
                  style={{ width: `${(total / maxValue) * 100}%` }}
                />
              </div>
              <div className="theme-text-muted mt-3 grid grid-cols-3 gap-2 text-xs">
                <span>Articles {user.article_count || 0}</span>
                <span>Problems {user.problem_count || 0}</span>
                <span>Solutions {user.solution_count || 0}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const NewestMembers = ({ users }) => (
  <div className="theme-soft-surface rounded-[28px] border p-5">
    <h3 className="text-xl font-semibold">Newest members</h3>
    <p className="theme-text-muted mt-1 text-sm leading-6">
      Recently joined accounts that may need onboarding or moderation attention.
    </p>

    <div className="mt-5 flex flex-col gap-3">
      {users.map((user) => (
        <div key={user._id} className="theme-input flex items-center gap-3 rounded-[18px] px-4 py-3">
          <img
            src={getAssetUrl(user.profile_img_)}
            alt={user.username}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{user.username}</div>
            <div className="theme-text-muted text-xs">Joined {format(new Date(user.createdAt), "MMM d, yyyy")}</div>
          </div>
          <div className="theme-text-muted text-xs">
            {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  </div>
);

function Admin_user() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selected, setSelected] = useState("users");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [listLoading, setListLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [overview, setOverview] = useState({ active: [], blocked: [] });

  const loadOverview = async () => {
    try {
      setOverviewLoading(true);
      setError(null);
      const [activeRes, blockedRes] = await Promise.all([
        fetch_all_users("users", ""),
        fetch_all_users("blocked", ""),
      ]);

      setOverview({
        active: Array.isArray(activeRes.data) ? activeRes.data : [],
        blocked: Array.isArray(blockedRes.data) ? blockedRes.data : [],
      });
    } catch (err) {
      setError(err);
      console.log("admin users overview error", err);
    } finally {
      setOverviewLoading(false);
    }
  };

  const loadUsers = async (type, term = "") => {
    try {
      setListLoading(true);
      setError(null);
      const { data } = await fetch_all_users(type, term);
      setUsers(Array.isArray(data) ? data : []);
      setAppliedSearch(term);
    } catch (err) {
      setError(err);
      console.log("admin users list error", err);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadUsers("users", "");
  }, [id]);

  const everyone = useMemo(() => [...overview.active, ...overview.blocked], [overview]);

  const analytics = useMemo(() => {
    const totals = everyone.reduce(
      (acc, user) => {
        acc.articles += user.article_count || 0;
        acc.problems += user.problem_count || 0;
        acc.solutions += user.solution_count || 0;
        return acc;
      },
      { articles: 0, problems: 0, solutions: 0 }
    );

    const creators = everyone.filter((user) => getContributionTotal(user) > 0).length;
    const blocked = overview.blocked.length;
    const totalUsers = everyone.length;
    const learners = Math.max(totalUsers - creators - blocked, 0);
    const averageContribution = totalUsers
      ? (totals.articles + totals.problems + totals.solutions) / totalUsers
      : 0;

    return {
      totalUsers,
      blocked,
      active: overview.active.length,
      creators,
      learners,
      totals,
      averageContribution,
      signupSeries: buildSignupSeries(everyone, 14),
      topContributors: [...everyone]
        .sort((left, right) => getContributionTotal(right) - getContributionTotal(left))
        .slice(0, 6),
      newestMembers: [...everyone]
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
        .slice(0, 4),
    };
  }, [everyone, overview.active.length, overview.blocked.length]);

  const listingSummary = useMemo(() => {
    const totalContributions = users.reduce((sum, user) => sum + getContributionTotal(user), 0);
    return {
      members: users.length,
      contributions: totalContributions,
    };
  }, [users]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    loadUsers(selected, searchInput.trim());
  };

  const handleTabChange = (nextTab) => {
    setSelected(nextTab);
    loadUsers(nextTab, searchInput.trim());
  };

  const handleRefresh = () => {
    loadOverview();
    loadUsers(selected, appliedSearch);
  };

  if (overviewLoading && !everyone.length && listLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="theme-soft-surface rounded-[30px] border p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="theme-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              User intelligence
            </div>
            <h2 className="mt-4 text-3xl font-semibold md:text-[2.2rem]">
              Membership health, growth, and contribution patterns.
            </h2>
            <p className="theme-text-muted mt-3 max-w-3xl text-sm leading-7 md:text-base">
              Track user growth, see who is contributing the most, and scan the full member base from a cleaner control surface.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="theme-button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <FiRefreshCw className={overviewLoading || listLoading ? "animate-spin" : ""} />
            Refresh data
          </button>
        </div>
      </section>

      {error ? (
        <div className="theme-button-danger rounded-[22px] px-5 py-4 text-sm">
          {error?.response?.data?.message || error?.message || "Failed to load user analytics."}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OverviewCard
          label="Total accounts"
          value={formatCompactNumber(analytics.totalUsers)}
          helper={`${analytics.active} active and visible accounts`}
          icon={<FiUsers />}
          accent="#86f7a2"
        />
        <OverviewCard
          label="Creator accounts"
          value={formatCompactNumber(analytics.creators)}
          helper="Members with at least one article, problem, or solution"
          icon={<FiUserCheck />}
          accent="#6cc9ff"
        />
        <OverviewCard
          label="Blocked accounts"
          value={formatCompactNumber(analytics.blocked)}
          helper="Accounts currently excluded from the public side"
          icon={<FiShield />}
          accent="#ff9f8b"
        />
        <OverviewCard
          label="Avg output / user"
          value={analytics.averageContribution.toFixed(1)}
          helper={`${formatCompactNumber(analytics.totals.articles + analytics.totals.problems + analytics.totals.solutions)} total content items`}
          icon={<FiTrendingUp />}
          accent="#c79bff"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
        <div className="flex flex-col gap-6">
          <TrendChart series={analytics.signupSeries} />
          <TopContributors users={analytics.topContributors} />
        </div>

        <div className="flex flex-col gap-6">
          <ContributionMix
            totals={analytics.totals}
            averageContribution={analytics.averageContribution}
          />
          <MemberBreakdown
            creators={analytics.creators}
            learners={analytics.learners}
            blocked={analytics.blocked}
            total={analytics.totalUsers}
          />
          <NewestMembers users={analytics.newestMembers} />
        </div>
      </section>

      <section className="theme-soft-surface rounded-[30px] border p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="theme-text-subtle text-xs uppercase tracking-[0.18em]">Member browser</div>
            <h3 className="mt-3 text-2xl font-semibold">
              {selected === "users" ? "Active user directory" : "Blocked user directory"}
            </h3>
            <p className="theme-text-muted mt-2 text-sm leading-6">
              Search by username, compare contribution counts, and jump directly into a member overview.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex w-full flex-col gap-3 lg:max-w-[560px] lg:flex-row">
            <div className="theme-input flex flex-1 items-center gap-3 rounded-full px-4 py-3">
              <FiSearch className="theme-text-muted text-lg" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by username"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              className="theme-button-primary rounded-full px-5 py-3 text-sm font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "users", label: "Users", icon: <FiUsers /> },
              { key: "blocked", label: "Blocked users", icon: <FiShield /> },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleTabChange(item.key)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected === item.key
                    ? "theme-button-primary"
                    : "theme-button-secondary"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <div className="theme-input rounded-full px-4 py-2">
              Showing {listingSummary.members} members
            </div>
            <div className="theme-input rounded-full px-4 py-2">
              {formatCompactNumber(listingSummary.contributions)} contributions in view
            </div>
            {appliedSearch ? (
              <div className="theme-input rounded-full px-4 py-2">
                Search: {appliedSearch}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <div className="theme-text-subtle hidden grid-cols-[minmax(0,1.6fr)_120px_120px_120px_120px_140px] gap-4 px-4 text-[11px] uppercase tracking-[0.18em] md:grid">
            <div>Member</div>
            <div>Articles</div>
            <div>Problems</div>
            <div>Solutions</div>
            <div>Total</div>
            <div>Status</div>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : users.length ? (
            users.map((item) => {
              const total = getContributionTotal(item);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => navigate(`/user_overview/${item._id}`)}
                  className="theme-input grid w-full gap-4 rounded-[24px] px-4 py-4 text-left transition hover:-translate-y-[1px] hover:border-[var(--app-accent)] md:grid-cols-[minmax(0,1.6fr)_120px_120px_120px_120px_140px] md:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={getAssetUrl(item.profile_img_)}
                      alt={item.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-semibold">{item.username}</div>
                      <div className="theme-text-muted truncate text-sm">
                        {item.name || "Community member"}
                      </div>
                      <div className="theme-text-muted mt-1 text-xs">
                        Joined {format(new Date(item.createdAt), "MMM d, yyyy")} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm font-semibold md:text-base">{item.article_count || 0}</div>
                  <div className="text-sm font-semibold md:text-base">{item.problem_count || 0}</div>
                  <div className="text-sm font-semibold md:text-base">{item.solution_count || 0}</div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--app-bg-soft)] px-3 py-1 text-sm font-semibold">
                    <FiBarChart2 className="text-[var(--app-accent)]" />
                    {total}
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-start">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                        selected === "blocked"
                          ? "bg-[rgba(255,159,139,0.16)] text-[var(--app-danger-text)]"
                          : "bg-[rgba(134,247,162,0.16)] text-[var(--app-success-text)]"
                      }`}
                    >
                      {selected === "blocked" || item.isblock ? "Blocked" : "Active"}
                    </span>
                    <span className="theme-text-muted inline-flex items-center gap-1 text-sm font-medium">
                      View
                      <FiArrowRight />
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="theme-input rounded-[24px] px-5 py-10 text-center text-sm">
              No users matched this view.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Admin_user;



