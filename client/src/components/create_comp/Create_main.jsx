import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiFileText, FiHelpCircle, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { fetch_user_drafts } from "../../api";
import Article_form from "../articles_comp/Article_form";
import AppPagination from "../common/AppPagination";
import Problem_form from "../community_comp/Problem_form";
import Loader from "../Loader";

const getInitialType = (search) => {
  const params = new URLSearchParams(search || "");
  const requested = String(params.get("type") || "").toLowerCase();
  if (requested === "article" || requested === "problem") {
    return requested;
  }

  return "problem";
};

function Create_main() {
  const user = useSelector((state) => state.userReducer.current_user);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeType, setActiveType] = useState(() => getInitialType(location.search));
  const [editingDraft, setEditingDraft] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [draftTotal, setDraftTotal] = useState(0);
  const [draftPage, setDraftPage] = useState(0);
  const [draftLimit] = useState(5);
  const [draftSearch, setDraftSearch] = useState("");
  const [draftSearchInput, setDraftSearchInput] = useState("");
  const [draftLoading, setDraftLoading] = useState(false);

  useEffect(() => {
    setActiveType(getInitialType(location.search));
  }, [location.search]);

  const syncRoute = useCallback(
    (type) => {
      setActiveType(type);
      navigate(`/create?type=${type}`, { replace: true });
    },
    [navigate]
  );

  const loadDrafts = useCallback(
    async ({ page = draftPage, q = draftSearch } = {}) => {
      if (!user?._id) {
        return;
      }

      try {
        setDraftLoading(true);
        const { data } = await fetch_user_drafts({ page, limit: draftLimit, q });
        setDrafts(Array.isArray(data?.drafts) ? data.drafts : []);
        setDraftTotal(Number(data?.total) || 0);
      } catch (error) {
        console.log("load drafts error", error);
        setDrafts([]);
        setDraftTotal(0);
      } finally {
        setDraftLoading(false);
      }
    },
    [draftLimit, draftPage, draftSearch, user?._id]
  );

  useEffect(() => {
    if (activeType === "article" && user?._id) {
      loadDrafts();
    }
  }, [activeType, user?._id, draftPage, draftSearch, loadDrafts]);

  const draftPageCount = useMemo(
    () => Math.max(1, Math.ceil((draftTotal || 0) / draftLimit)),
    [draftLimit, draftTotal]
  );

  if (!user?._id) {
    return (
      <div className="theme-page px-4 pb-16 pt-8 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="theme-surface rounded-md border px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold">Sign in to create content</h1>
            <p className="theme-text-muted mt-3 text-sm leading-6">
              You need an account session before creating problems or articles.
            </p>
            <button
              type="button"
              onClick={() => navigate("/auth")}
              className="theme-button-primary mt-6 rounded-md px-5 py-2.5 text-sm font-semibold"
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="theme-surface rounded-md border px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="theme-text-subtle text-xs font-semibold uppercase tracking-[0.2em]">Create</div>
              <h1 className="mt-2 text-3xl font-semibold">Choose what you want to publish</h1>
              <p className="theme-text-muted mt-2 text-sm">
                Problem posts and articles now share a dedicated create route.
              </p>
            </div>

            <div className="theme-soft-surface flex items-center gap-2 rounded-md p-1">
              <button
                type="button"
                onClick={() => syncRoute("problem")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                  activeType === "problem" ? "theme-button-primary" : "theme-button-secondary"
                }`}
              >
                <FiHelpCircle /> Problem
              </button>
              <button
                type="button"
                onClick={() => syncRoute("article")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                  activeType === "article" ? "theme-button-primary" : "theme-button-secondary"
                }`}
              >
                <FiFileText /> Article
              </button>
            </div>
          </div>
        </section>

        {activeType === "problem" ? (
          <Problem_form user={user} />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="theme-surface rounded-md border p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Drafts</h2>
                <button
                  type="button"
                  onClick={() => setEditingDraft(null)}
                  className="theme-button-secondary rounded-md px-3 py-1.5 text-xs font-semibold"
                >
                  New
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2">
                <FiSearch className="text-[var(--app-muted)]" />
                <input
                  value={draftSearchInput}
                  onChange={(event) => setDraftSearchInput(event.target.value)}
                  placeholder="Search drafts"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--app-subtle)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDraftPage(0);
                    setDraftSearch(draftSearchInput.trim());
                  }}
                  className="theme-button-secondary rounded-md px-2 py-1 text-xs"
                >
                  Go
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {draftLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader />
                  </div>
                ) : drafts.length > 0 ? (
                  drafts.map((draft) => (
                    <button
                      key={draft._id}
                      type="button"
                      onClick={() => setEditingDraft(draft)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition ${
                        editingDraft?._id === draft._id
                          ? "border-[var(--app-accent)] bg-[var(--app-bg-soft)]"
                          : "border-[var(--app-border)] bg-[var(--app-bg-panel)] hover:bg-[var(--app-bg-soft)]"
                      }`}
                    >
                      <div className="truncate text-sm font-semibold">{draft.title || "Untitled draft"}</div>
                      <div className="theme-text-muted mt-1 text-xs">
                        Updated {draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "recently"}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="theme-text-muted rounded-md border border-dashed border-[var(--app-border)] px-3 py-5 text-center text-sm">
                    No drafts yet.
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <AppPagination
                  pageCount={draftPageCount}
                  currentPage={draftPage}
                  onPageChange={(event) => setDraftPage(event.selected)}
                />
              </div>
            </aside>

            <Article_form
              user={user}
              Edit_articleobj={editingDraft}
              setEdit_articleobj={setEditingDraft}
              onArticleSaved={() => loadDrafts({ page: draftPage, q: draftSearch })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Create_main;
