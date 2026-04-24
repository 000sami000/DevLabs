import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { FiBarChart2, FiCompass, FiEdit3, FiHelpCircle, FiTag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { fetchProblem, search_problem } from "../../api";
import { getSingleproblem } from "../../redux_/actions/problem";
import { getSolution } from "../../redux_/actions/solution";
import AppPagination from "../common/AppPagination";
import Loader from "../Loader";
import Report from "../Report";
import Problem_comp from "./Problem_comp";
import Solution_comp from "./Solution_comp";
import Solution_form from "./Solution_form";

function normalizeTokens(value = "") {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 3);
}

function normalizeTags(tags = []) {
  return (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean);
}

function getTagOverlapCount(candidate, currentProblem) {
  const currentTags = new Set(normalizeTags(currentProblem?.tags));
  const candidateTags = normalizeTags(candidate?.tags);
  return candidateTags.reduce((count, tag) => count + (currentTags.has(tag) ? 1 : 0), 0);
}

function getTagSimilarity(candidate, currentProblem) {
  const currentTags = new Set(normalizeTags(currentProblem?.tags));
  const candidateTags = new Set(normalizeTags(candidate?.tags));

  if (!currentTags.size || !candidateTags.size) {
    return 0;
  }

  let intersection = 0;
  currentTags.forEach((tag) => {
    if (candidateTags.has(tag)) {
      intersection += 1;
    }
  });

  const union = new Set([...currentTags, ...candidateTags]).size;
  return union ? intersection / union : 0;
}

function scoreRelatedProblem(candidate, currentProblem) {
  const titleTokenSet = new Set(normalizeTokens(currentProblem?.title || ""));
  const candidateTokens = normalizeTokens(candidate?.title || "");
  const titleOverlap = candidateTokens.reduce((count, token) => count + (titleTokenSet.has(token) ? 1 : 0), 0);
  const tagOverlap = getTagOverlapCount(candidate, currentProblem);
  const tagSimilarity = getTagSimilarity(candidate, currentProblem);
  const engagement = (candidate?.likes?.length || 0) + (candidate?.total_sol?.length || 0) * 2;

  return tagSimilarity * 120 + tagOverlap * 12 + titleOverlap * 3 + engagement * 0.08;
}

function sortSolutionsForViewer(items = [], viewerId = "") {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftMine = viewerId && String(left?.creator_id) === String(viewerId) ? 1 : 0;
    const rightMine = viewerId && String(right?.creator_id) === String(viewerId) ? 1 : 0;

    if (rightMine !== leftMine) {
      return rightMine - leftMine;
    }

    const leftUpVotes = Array.isArray(left?.up_vote) ? left.up_vote.length : 0;
    const rightUpVotes = Array.isArray(right?.up_vote) ? right.up_vote.length : 0;

    if (rightUpVotes !== leftUpVotes) {
      return rightUpVotes - leftUpVotes;
    }

    return new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime();
  });
}

function Solutions_main() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { p_id } = useParams();
  const singleProblem = useSelector((state) => state.problemReducer.single_recent_post);
  const user = useSelector((state) => state.userReducer.current_user);
  const { sol_loading, solutions, total: solutionsTotal, limit: solutionLimit } = useSelector((state) => state.solutionReducer);

  const [selectedPage, setSelectedPage] = useState(0);
  const [current_pdata, setcurrent_pdata] = useState(null);
  const [current_sdata, setcurrent_sdata] = useState(null);
  const [Sol_ed, setSol_ed] = useState(null);
  const [relatedProblems, setRelatedProblems] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (p_id) {
      dispatch(getSingleproblem(p_id));
    }
  }, [dispatch, p_id]);

  useEffect(() => {
    if (p_id) {
      dispatch(getSolution(p_id, selectedPage, 5));
    }
  }, [dispatch, p_id, selectedPage]);

  useEffect(() => {
    setSelectedPage(0);
  }, [p_id]);

  const problem = singleProblem?.[0];
  const sortedSolutions = useMemo(() => sortSolutionsForViewer(solutions, user?._id), [solutions, user?._id]);
  const answerCount = solutionsTotal || sortedSolutions.length;
  const solutionPageCount = Math.max(1, Math.ceil(answerCount / (solutionLimit || 5)));

  const questionStats = useMemo(
    () => ({
      votes: problem?.likes?.length || 0,
      answers: answerCount,
      tags: problem?.tags?.length || 0,
    }),
    [answerCount, problem]
  );

  useEffect(() => {
    const loadRelatedProblems = async () => {
      if (!problem?._id) {
        setRelatedProblems([]);
        return;
      }

      setRelatedLoading(true);

      try {
        const tags = normalizeTags(problem?.tags).slice(0, 6);
        let candidates = [];

        if (tags.length > 0) {
          const { data } = await search_problem(tags, { page: 0, limit: 30 });
          candidates = Array.isArray(data?.problems) ? data.problems : [];
        }

        if (candidates.length < 8) {
          const { data } = await fetchProblem(0, 30);
          const fallback = Array.isArray(data?.problems) ? data.problems : [];
          const existingIds = new Set(candidates.map((item) => String(item?._id)));
          fallback.forEach((item) => {
            const id = String(item?._id || "");
            if (id && !existingIds.has(id)) {
              candidates.push(item);
              existingIds.add(id);
            }
          });
        }

        const currentId = String(problem._id);
        const hasTagSeed = tags.length > 0;

        const ranked = candidates
          .filter((item) => String(item?._id) !== currentId)
          .map((item) => {
            const score = scoreRelatedProblem(item, problem);
            const overlap = getTagOverlapCount(item, problem);
            return {
              ...item,
              __score: score,
              __overlap: overlap,
              __time: new Date(item?.createdAt || 0).getTime(),
            };
          })
          .filter((item) => {
            if (hasTagSeed) {
              return item.__overlap > 0 || item.__score >= 10;
            }
            return item.__score > 0;
          })
          .sort((left, right) => right.__score - left.__score || right.__time - left.__time)
          .slice(0, 8);

        setRelatedProblems(ranked);
      } catch (error) {
        console.log("related problems load error", error);
        setRelatedProblems([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelatedProblems();
  }, [problem]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 pb-20 pt-6 md:px-6">
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          {problem ? (
            <Problem_comp pdata={problem} setcurrent_pdata={setcurrent_pdata} />
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
              <Loader />
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-5 py-3">
            <span className="text-[15px] font-semibold text-[#1a7f37]">{answerCount} {answerCount === 1 ? "Answer" : "Answers"}</span>
            <span className="text-[13px] text-[var(--app-muted)]">Your answers first, then top voted</span>
          </div>

          {user ? (
            <Solution_form p_id={p_id} Sol_ed={Sol_ed} setSol_ed={setSol_ed} />
          ) : (
            <div className="flex items-center gap-3 rounded-md border border-[#f0883e]/30 bg-[#f0883e]/5 px-4 py-3 text-[13px] text-[#f0883e]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f0883e]" />
              Sign in to post an answer.
            </div>
          )}

          {!sol_loading ? (
            <div className="flex flex-col gap-3">
              {sortedSolutions.length > 0 ? (
                sortedSolutions.map((sol) => (
                  <Solution_comp
                    key={sol._id}
                    content_title={problem?.title}
                    content_creator_username={problem?.creator_username}
                    setcurrent_sdata={setcurrent_sdata}
                    sol_props={sol}
                    setSol_ed={setSol_ed}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-10 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]">
                    <FiEdit3 className="text-xl" />
                  </div>
                  <p className="text-[15px] font-semibold text-[var(--app-text)]">No answers yet</p>
                  <p className="text-[13px] text-[var(--app-muted)]">Be the first to share a complete solution.</p>
                </div>
              )}

              <div className="mt-2 flex justify-center">
                <AppPagination
                  pageCount={solutionPageCount}
                  currentPage={selectedPage}
                  onPageChange={(event) => setSelectedPage(event.selected)}
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
              <Loader />
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
          <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
            <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
              <FiBarChart2 className="text-[13px] text-[var(--app-muted)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Thread stats</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[var(--app-border)]">
              {[
                { label: "Votes", val: questionStats.votes },
                { label: "Answers", val: questionStats.answers },
                { label: "Tags", val: questionStats.tags },
              ].map(({ label, val }) => (
                <div key={label} className="px-3 py-3 text-center">
                  <div className="text-xl font-bold text-[var(--app-text)]">{val}</div>
                  <div className="mt-0.5 text-[11px] uppercase tracking-wider text-[var(--app-muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {problem?.tags?.length ? (
            <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
              <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
                <FiTag className="text-[13px] text-[var(--app-muted)]" />
                <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-4">
                {problem.tags.map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="flex items-center gap-1 rounded-full bg-[#ddf4ff] px-2.5 py-1 text-[12px] font-medium text-[#0969da]"
                  >
                    <FiTag className="text-[10px]" />{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
            <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
              <FiCompass className="text-[13px] text-[var(--app-muted)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Related</span>
            </div>
            <div className="divide-y divide-[var(--app-border)]">
              {relatedLoading ? (
                <p className="px-4 py-3 text-[13px] text-[var(--app-muted)]">Loading...</p>
              ) : relatedProblems.length ? (
                relatedProblems.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => navigate(`/problem/${item._id}/sols`)}
                    className="w-full px-4 py-3 text-left transition hover:bg-[var(--app-bg-soft-strong)]"
                  >
                    <p className="line-clamp-2 text-[13px] font-medium leading-5 text-[var(--app-text)]">{item.title}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {Array.isArray(item.tags) && item.tags.slice(0, 2).map((tag) => (
                        <span key={`${item._id}-${tag}`} className="rounded-full bg-[#ddf4ff] px-1.5 py-0.5 text-[10px] font-medium text-[#0969da]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-[13px] text-[var(--app-muted)]">No related questions.</p>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
            <div className="flex items-center gap-2 border-b border-[var(--app-border)] px-4 py-3">
              <FiHelpCircle className="text-[13px] text-[var(--app-muted)]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[var(--app-muted)]">Answer tips</span>
            </div>
            <ul className="space-y-2 p-4">
              {["Explain why the fix works.", "Include reproducible steps.", "Call out tradeoffs and caveats."].map((tip) => (
                <li key={tip} className="flex gap-2 text-[13px] leading-5 text-[var(--app-muted)]">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--app-accent)]" />{tip}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Modal
        isOpen={Sol_ed != null}
        style={{
          overlay: { backgroundColor: "rgba(1,4,9,0.75)", zIndex: 1200 },
          content: {
            top: "50%", left: "50%", right: "auto", bottom: "auto",
            marginRight: "-50%", transform: "translate(-50%,-50%)",
            width: "min(960px,92vw)", padding: "0",
            borderRadius: "8px", border: "1px solid var(--app-border)",
            background: "var(--app-bg-panel)", color: "var(--app-text)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          },
        }}
      >
        <div className="p-5">
          <Solution_form p_id={p_id} Sol_ed={Sol_ed} setSol_ed={setSol_ed} />
        </div>
      </Modal>

      <Report
        current_pdata={current_pdata}
        setcurrent_pdata={setcurrent_pdata}
        current_sdata={current_sdata}
        setcurrent_sdata={setcurrent_sdata}
      />
    </div>
  );
}

export default Solutions_main;

