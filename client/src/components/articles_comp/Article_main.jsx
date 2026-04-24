import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit3, FiFileText, FiHelpCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getArticles } from "../../redux_/actions/article";
import AppPagination from "../common/AppPagination";
import Article_comp from "./Article_comp";
import Search_input from "../Search_input";

function Article_main() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userReducer.current_user);
  const total = useSelector((state) => state.articleReducer.total);
  const articles = useSelector((state) => state.articleReducer.articles);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    dispatch(getArticles(selected, 5));
  }, [dispatch, selected]);

  const pageCount = Math.max(1, Math.ceil((total || 0) / 5));

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 pb-20 pt-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FiFileText className="text-[var(--app-accent)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Community</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--app-text)]">Articles</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--app-muted)]">
            <span>
              <span className="font-semibold text-[var(--app-text)]">{total || 0}</span> articles
            </span>
            <span>
              <span className="font-semibold text-[var(--app-text)]">{selected + 1}</span> / {pageCount} pages
            </span>
          </div>
        </div>

        {/* <div className="mb-5 flex justify-end">
          {user ? (
            <button
              type="button"
              onClick={() => navigate("/create?type=article")}
              className="theme-button-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-semibold"
            >
              <FiEdit3 />
              Create article
            </button>
          ) : (
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-4 py-2 text-[13px] text-[var(--app-muted)]">
              Sign in to create article
            </div>
          )}
        </div> */}

        <div className="mb-5">
          <Search_input placeholder_val={"Search articles..."} content_type={"article"} variant="community-dark" />
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
          <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
            <span className="text-sm font-semibold text-[var(--app-text)]">Latest</span>
            <span className="rounded-full bg-[var(--app-bg-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-muted)]">
              {articles?.length || 0} shown
            </span>
          </div>

          <div>
            {articles?.length > 0 ? (
              <div className="flex flex-col gap-4 p-4">
                {articles.map((item) => <Article_comp key={item._id} adata={item} />)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]">
                  <FiHelpCircle className="text-xl" />
                </div>
                <p className="text-sm font-medium text-[var(--app-text)]">No articles yet</p>
                <p className="text-xs text-[var(--app-muted)]">Publish the first article to get started.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <AppPagination
            pageCount={pageCount}
            currentPage={selected}
            onPageChange={(event) => setSelected(event.selected)}
          />
        </div>
      </div>
    </div>
  );
}

export default Article_main;
