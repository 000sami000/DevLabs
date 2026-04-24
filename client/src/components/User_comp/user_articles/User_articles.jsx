import React, { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { FiBookmark, FiFileText, FiSearch, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  fetch_allArticles,
  fetch_savedArticles,
  fetch_userArticles,
  search_allArticles,
  search_savedArticles,
  search_userArticles,
} from "../../../api";
import getAssetUrl from "../../../utils/getAssetUrl";
import AppPagination from "../../common/AppPagination";
import Loader from "../../Loader";

const PAGE_LIMIT = 6;

const countValue = (value) => {
  if (Array.isArray(value)) {
    return value.length;
  }

  return Number(value) || 0;
};

const normalizeArticle = (item = {}) => ({
  _id: item._id,
  title: item.title || "Untitled article",
  createdAt: item.createdAt,
  likes: countValue(item.likes),
  dislikes: countValue(item.dislikes),
  total_comments: Number(item.total_comments) || Number(item.comments?.length) || 0,
  isActive: item.isActive !== false,
  isApproved: item.isApproved !== false,
  creator_id: item.creator_id || null,
  creator_name: item.creator_name || "",
  creator_username: item.creator_username || "",
  profile_img_: item.profile_img_ || null,
});

function User_articles({ mode = "user" }) {
  const navigate = useNavigate();
  const isAdmin = mode === "admin";

  const tabs = useMemo(
    () => [
      { key: "mine", label: "My Articles", icon: <FiFileText /> },
      { key: "saved", label: "Saved", icon: <FiBookmark /> },
      ...(isAdmin ? [{ key: "platform", label: "All Articles", icon: <FiFileText /> }] : []),
    ],
    [isAdmin]
  );

  const [activeTab, setActiveTab] = useState("mine");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!tabs.find((tab) => tab.key === activeTab)) {
      setActiveTab("mine");
    }
  }, [activeTab, tabs]);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        let response;

        if (activeTab === "saved") {
          response = query ? await search_savedArticles(query) : await fetch_savedArticles();
        } else if (activeTab === "platform" && isAdmin) {
          response = query ? await search_allArticles(query) : await fetch_allArticles();
        } else {
          response = query ? await search_userArticles(query) : await fetch_userArticles();
        }

        const payload = response?.data;
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.articles)
            ? payload.articles
            : Array.isArray(payload?.items)
              ? payload.items
              : [];

        if (!ignore) {
          setItems(rows.map(normalizeArticle));
        }
      } catch (requestError) {
        if (!ignore) {
          setItems([]);
          setError(requestError?.response?.data?.message || requestError?.message || "Unable to load articles.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [activeTab, isAdmin, query]);

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  useEffect(() => {
    if (page > pageCount - 1) {
      setPage(0);
    }
  }, [page, pageCount]);

  const currentItems = useMemo(() => {
    const start = page * PAGE_LIMIT;
    return items.slice(start, start + PAGE_LIMIT);
  }, [items, page]);

  return (
    <div className="flex flex-col gap-4">
      <div className="theme-soft-surface border px-4 py-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(0);
                  setQuery("");
                  setSearchInput("");
                }}
                className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold ${
                  activeTab === tab.key ? "theme-button-primary" : "theme-button-secondary"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setPage(0);
              setQuery(searchInput.trim());
            }}
            className="flex w-full max-w-[520px] items-center gap-2"
          >
            <div className="theme-input flex flex-1 items-center gap-2 px-3 py-2">
              <FiSearch className="theme-text-muted" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by article title"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button type="submit" className="theme-button-secondary px-3 py-2 text-sm font-semibold">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="theme-surface border overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
          <div className="text-sm font-semibold">
            {tabs.find((tab) => tab.key === activeTab)?.label || "Articles"}
          </div>
          <div className="theme-text-muted text-xs">{total} total</div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="px-4 py-8 text-sm text-[var(--app-danger-text)]">{error}</div>
        ) : currentItems.length > 0 ? (
          <div className="divide-y divide-[var(--app-border)]">
            {currentItems.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => navigate(`/article/${item._id}`)}
                className="w-full px-4 py-4 text-left hover:bg-[var(--app-bg-soft)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-base font-semibold text-[var(--app-text)]">{item.title}</h4>
                    <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className="inline-flex items-center gap-1"><FiThumbsUp /> {item.likes}</span>
                      <span className="inline-flex items-center gap-1"><FiThumbsDown /> {item.dislikes}</span>
                      <span>{item.total_comments} comments</span>
                      <span>{item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : "recently"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(item.creator_username || item.creator_name) && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (item.creator_id) {
                            navigate(`/user_overview/${item.creator_id}`);
                          }
                        }}
                        className="inline-flex items-center gap-2"
                      >
                        <img
                          src={getAssetUrl(item.profile_img_)}
                          alt={item.creator_username || "author"}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="text-left leading-tight">
                          <div className="text-xs font-semibold text-[var(--app-text)]">{item.creator_name || item.creator_username}</div>
                          <div className="theme-text-muted text-xs">@{item.creator_username || "unknown"}</div>
                        </div>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${item.isActive ? "bg-[#1a7f37]/15 text-[#1a7f37]" : "bg-[#cf222e]/10 text-[#cf222e]"}`}>
                        {item.isActive ? "Visible" : "Hidden"}
                      </span>
                      <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${item.isApproved ? "bg-[#0969da]/12 text-[#0969da]" : "bg-[var(--app-bg-soft)] text-[var(--app-muted)]"}`}>
                        {item.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="theme-text-muted px-4 py-10 text-center text-sm">No articles found.</div>
        )}
      </div>

      <div className="flex justify-center">
        <AppPagination
          pageCount={pageCount}
          currentPage={page}
          onPageChange={(event) => setPage(event.selected)}
        />
      </div>
    </div>
  );
}

export default User_articles;
