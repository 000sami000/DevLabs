import React, { useMemo } from "react";
import { FiHelpCircle, FiTrendingUp, FiZap } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProblems } from "../../redux_/actions/problem";
import AppPagination from "../common/AppPagination";
import Search_input from "../Search_input";
import Problem_comp from "./Problem_comp";
import Problem_form from "./Problem_form";

function Community() {
  const user = useSelector((state) => state.userReducer.current_user);
  const problems = useSelector((state) => state.problemReducer.problems);
  const total = useSelector((state) => state.problemReducer.total);
  const [selected, setselected] = React.useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    dispatch(getProblems(selected, 5));
  }, [dispatch, selected]);

  const pagecount = Math.max(1, Math.ceil((total || 0) / 5));

  const relatedFromFeed = useMemo(() => {
    if (!Array.isArray(problems)) return [];
    return [...problems]
      .sort((a, b) => {
        const scoreA = (a?.likes?.length || 0) + (a?.total_sol?.length || 0) * 2;
        const scoreB = (b?.likes?.length || 0) + (b?.total_sol?.length || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 6);
  }, [problems]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 pb-20 pt-8 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FiZap className="text-[#f78166]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Community</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-[var(--app-text)] tracking-tight">Questions &amp; Answers</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-[var(--app-muted)]">
            <span><span className="font-semibold text-[var(--app-text)]">{total}</span> questions</span>
            <span><span className="font-semibold text-[var(--app-text)]">{selected + 1}</span> / {pagecount} pages</span>
          </div>
        </div>

        {user ? (

           
           <></>

        ) : (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-[#f0883e]/30 bg-[#f0883e]/5 px-4 py-3 text-sm text-[#f0883e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0883e]" />
            Sign in to ask a question.
          </div>
        )}

        <div className="mb-5 mt-4">
          <Search_input placeholder_val={"Search questions..."} content_type={"problem"} variant="community-dark" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-panel)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--app-text)]">Newest</span>
              <span className="rounded-full bg-[var(--app-bg-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-muted)]">
                {problems?.length || 0} shown
              </span>
            </div>

            <div>
              {problems?.length ? (
                problems.map((item, index) => <Problem_comp key={item._id || index} pdata={item} />)
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]">
                    <FiHelpCircle className="text-xl" />
                  </div>
                  <p className="text-sm font-medium text-[var(--app-text)]">No questions yet</p>
                  <p className="text-xs text-[var(--app-muted)]">Be the first to ask something.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
            {/* <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-panel)] overflow-hidden">
              <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
                <FiTrendingUp className="text-[#3fb950] text-sm" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Trending</span>
              </div>
              <div className="divide-y divide-[var(--app-border)]">
                {relatedFromFeed.length ? (
                  relatedFromFeed.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => navigate(`/problem/${item._id}/sols`)}
                      className="w-full border-0 px-4 py-3 text-left transition hover:bg-[var(--app-bg-soft-strong)]"
                      style={{ background: "transparent" }}
                    >
                      <p className="line-clamp-2 text-[13px] font-medium leading-5 text-[var(--app-text)]">{item.title}</p>
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-[var(--app-muted)]">
                        <span>{item.likes?.length || 0} votes</span>
                        <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
                        <span>{item.total_sol?.length || 0} answers</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-[var(--app-muted)]">Nothing trending yet.</p>
                )}
              </div>
            </div> */}

            <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Good questions</p>
              <ul className="space-y-2 text-[13px] leading-5 text-[var(--app-muted)]">
                <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--app-accent)]" />Use the actual error in the title</li>
                <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--app-accent)]" />Describe expected vs actual behavior</li>
                <li className="flex gap-2"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--app-accent)]" />Tag for discoverability</li>
              </ul>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex justify-center">
          <AppPagination
            pageCount={pagecount}
            currentPage={selected}
            onPageChange={(event) => setselected(event.selected)}
          />
        </div>
      </div>
    </div>
  );
}

export default Community;
