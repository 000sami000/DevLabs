import React, { useMemo, useState } from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { FaBookmark, FaRegBookmark } from "react-icons/fa6";
import { FiArrowRight, FiCheckCircle, FiClock, FiFlag, FiTag } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { approveProblem, deleteProblem, likeProblem, saveProblem, toggleProblemSolved } from "../../redux_/actions/problem";
import { useToast } from "../common/ToastProvider";
import "../text_editor/Editor.scss";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const getAssetUrl = (file, fallback = "/default_profile.jpg") => {
  if (file?.url) return file.url;
  if (!file?.destination || !file?.filename) return fallback;
  return `${API_BASE}/${file.destination}/${file.filename}`;
};

function Problem_comp({ pdata, setcurrent_pdata }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.userReducer.current_user);
  const toast = useToast();

  const [busyAction, setBusyAction] = useState("");

  const {
    title,
    problem_content,
    tags = [],
    likes = [],
    saved_prob_by = [],
    total_sol = [],
    creator_name,
    creator_username,
    creator_id,
    _id,
    createdAt,
    isApproved,
    isSolved,
    profile_img_,
  } = pdata;

  const isDetailView = location.pathname === `/problem/${_id}/sols`;
  const isOwner = user?._id === creator_id;
  const isAdmin = user?.role === "admin";
  const isLiked = Boolean(user && likes?.includes(user._id));
  const isSaved = Boolean(user && saved_prob_by?.includes(user._id));
  const totalAnswers = total_sol?.length || 0;
  const tagList = Array.isArray(tags) ? tags : [];

  const askedTime = useMemo(() => {
    if (!createdAt) return "recently";
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  }, [createdAt]);

  const withAuth = (message, callback) => {
    if (!user?._id) {
      toast.info("Authentication required", message);
      return;
    }

    callback();
  };

  const handleLike = async () => {
    withAuth("Login to vote on problems.", async () => {
      try {
        setBusyAction("like");
        await dispatch(likeProblem(_id));
        toast.success("Vote updated", "Problem vote updated.");
      } catch (error) {
        toast.error("Action failed", error?.response?.data?.message || "Unable to update vote.");
      } finally {
        setBusyAction("");
      }
    });
  };

  const handleSave = async () => {
    withAuth("Login to save problems.", async () => {
      try {
        setBusyAction("save");
        await dispatch(saveProblem(_id));
      } catch (error) {
        toast.error("Action failed", error?.response?.data?.message || "Unable to update saved state.");
      } finally {
        setBusyAction("");
      }
    });
  };

  const handleDelete = async () => {
    try {
      setBusyAction("delete");
      toast.info("Deleting...", "Removing this problem.");
      await dispatch(deleteProblem(_id, navigate));
      toast.success("Problem deleted", "The problem has been removed.");
    } catch (error) {
      toast.error("Delete failed", error?.response?.data?.message || "Unable to delete problem.");
    } finally {
      setBusyAction("");
    }
  };

  const handleSolved = async () => {
    try {
      setBusyAction("solved");
      toast.info("Updating...", isSolved ? "Marking as unsolved." : "Marking as solved.");
      await dispatch(toggleProblemSolved(_id));
      toast.success("Status updated", isSolved ? "Problem marked as unsolved." : "Problem marked as solved.");
    } catch (error) {
      toast.error("Update failed", error?.response?.data?.message || "Unable to update solved status.");
    } finally {
      setBusyAction("");
    }
  };
  const handleApprove = async () => {
    try {
      setBusyAction("approve");
      toast.info("Updating...", "Changing approval status.");
      await dispatch(approveProblem(_id));
      toast.success("Status updated", "Problem approval state changed.");
    } catch (error) {
      toast.error("Update failed", error?.response?.data?.message || "Unable to update approval.");
    } finally {
      setBusyAction("");
    }
  };

  if (!isDetailView) {
    return (
      <article className="group flex gap-0 border-b border-[var(--app-bg-soft)] px-4 py-4 transition-colors hover:bg-[var(--app-bg-soft-strong)]">
        <div className="mr-4 flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <button
            type="button"
            onClick={handleLike}
            disabled={busyAction !== ""}
            className={`flex h-7 w-7 items-center justify-center rounded transition text-base disabled:cursor-not-allowed disabled:opacity-60 ${
              isLiked
                ? "text-[var(--app-accent)]"
                : "text-[var(--app-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            {isLiked ? <AiFillLike /> : <AiOutlineLike />}
          </button>
          <span className={`text-xs font-semibold tabular-nums ${isLiked ? "text-[var(--app-accent)]" : "text-[var(--app-muted)]"}`}>
            {likes.length}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start gap-2">
            <button
              type="button"
              onClick={() => navigate(`/problem/${_id}/sols`)}
              className="text-left text-[15px] font-semibold leading-6 text-[var(--app-text)] transition-colors group-hover:text-[var(--app-accent)] hover:text-[var(--app-accent)]"
            >
              {title}
            </button>
            {isSolved && (
              <span className="mt-0.5 flex items-center gap-1 rounded-full bg-[#238636]/15 px-2 py-0.5 text-[11px] font-medium text-[#3fb950]">
                <FiCheckCircle className="text-[10px]" /> solved
              </span>
            )}
          </div>

          <div className="mt-1.5 line-clamp-2 text-[13px] leading-5 text-[var(--app-muted)]">
            <div className="editor ql-editor !max-h-none !overflow-visible !p-0" dangerouslySetInnerHTML={{ __html: problem_content }} />
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {tagList.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="flex items-center gap-1 rounded-full bg-[#ddf4ff] px-2 py-0.5 text-[11px] font-medium text-[#0969da]"
              >
                <FiTag className="text-[10px]" />
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--app-muted)]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-[#1a7f37]">{totalAnswers} {totalAnswers === 1 ? "answer" : "answers"}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
              <span>asked {askedTime}</span>
              <button
                type="button"
                onClick={() => navigate(`/user_overview/${creator_id}`)}
                className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-[var(--app-muted)] transition hover:text-[var(--app-text)]"
              >
                <img src={getAssetUrl(profile_img_)} alt={creator_username} className="h-5 w-5 rounded-full object-cover" />
                <span className="font-medium text-[var(--app-text)]">{creator_name || creator_username}</span>
                <span>@{creator_username}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={busyAction !== ""}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSaved
                    ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
                    : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-text)] hover:bg-[var(--app-bg-soft-strong)]"
                }`}
              >
                {isSaved ? <FaBookmark className="text-[11px]" /> : <FaRegBookmark className="text-[11px]" />}
                {busyAction === "save" ? "Updating..." : isSaved ? "Saved" : "Save"}
              </button>

              <button
                type="button"
                onClick={() => navigate(`/problem/${_id}/sols`)}
                className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--app-text)] transition hover:border-[var(--app-muted)] hover:bg-[var(--app-bg-soft-strong)]"
              >
                View <FiArrowRight className="text-[11px]" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] overflow-hidden">
      <div className="border-b border-[var(--app-border)] px-5 py-5 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold leading-tight text-[var(--app-text)] md:text-[1.75rem]">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[var(--app-muted)]">
              <span>Asked {askedTime}</span>
              <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
              <span>{likes.length} votes</span>
              <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
              <span className="font-medium text-[#1a7f37]">{totalAnswers} answers</span>
              {isSolved && (
                <span className="flex items-center gap-1 rounded-full bg-[#238636]/15 px-2 py-0.5 text-[11px] font-medium text-[#3fb950]">
                  <FiCheckCircle className="text-[10px]" /> solved
                </span>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {isOwner && (
              <span className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold ${isApproved ? "border-[#3fb950]/40 bg-[#238636]/15 text-[#3fb950]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]"}`}>
                {isApproved ? <FiCheckCircle className="text-[11px]" /> : <FiClock className="text-[11px]" />}
                {isApproved ? "Approved" : "Pending review"}
              </span>
            )}

            {user && (
              <button
                type="button"
                onClick={handleSave}
                disabled={busyAction !== ""}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSaved
                    ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
                    : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-text)] hover:bg-[var(--app-bg-soft-strong)]"
                }`}
              >
                {isSaved ? <FaBookmark className="text-[12px]" /> : <FaRegBookmark className="text-[12px]" />}
                {busyAction === "save" ? "Updating..." : isSaved ? "Saved" : "Save"}
              </button>
            )}

            {isOwner && (
              <button
                type="button"
                onClick={handleSolved}
                disabled={busyAction !== "" || (!isSolved && totalAnswers === 0)}
                className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSolved ? <FaToggleOn className="text-[#3fb950]" /> : <FaToggleOff className="text-[var(--app-muted)]" />}
                {busyAction === "solved" ? "Updating..." : isSolved ? "Solved" : "Mark solved"}
              </button>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={busyAction !== ""}
                className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-1.5 text-[13px] font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isApproved ? <FaToggleOn className="text-[#3fb950]" /> : <FaToggleOff className="text-[var(--app-muted)]" />}
                {busyAction === "approve" ? "Updating..." : isApproved ? "Approved" : "Approve"}
              </button>
            )}
            {(isOwner || isAdmin) && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={busyAction !== ""}
                className="flex items-center gap-1.5 rounded-md border border-[#da3633]/40 bg-[#da3633]/10 px-3 py-1.5 text-[13px] font-medium text-[#f85149] transition hover:bg-[#da3633]/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <MdDeleteOutline /> {busyAction === "delete" ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 px-5 py-5 md:grid-cols-[52px_minmax(0,1fr)] md:px-6">
        <aside className="flex flex-row gap-2 md:flex-col md:items-center">
          <button
            type="button"
            onClick={handleLike}
            disabled={busyAction !== ""}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isLiked
                ? "border-[var(--app-accent)] bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
                : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)] hover:border-[var(--app-muted)] hover:text-[var(--app-text)]"
            }`}
          >
            {isLiked ? <AiFillLike /> : <AiOutlineLike />}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-bg-soft)] text-sm font-bold text-[var(--app-text)]">
            {likes.length}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="editor ql-editor !min-h-0 !max-h-none !overflow-visible !px-0 !py-0 text-[var(--app-text)] text-[15px] leading-7" dangerouslySetInnerHTML={{ __html: problem_content }} />

          <div className="mt-5 flex flex-wrap gap-1.5 border-t border-[var(--app-border)] pt-4">
            {tagList.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="flex items-center gap-1 rounded-full bg-[#ddf4ff] px-2.5 py-1 text-[12px] font-medium text-[#0969da]"
              >
                <FiTag className="text-[10px]" />
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--app-border)] pt-4">
            <button
              type="button"
              onClick={() => navigate(`/user_overview/${creator_id}`)}
              className="flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-3 py-2 text-[13px] text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)]"
            >
              <img src={getAssetUrl(profile_img_)} alt={creator_username} className="h-6 w-6 rounded-full object-cover" />
              <div className="min-w-0 text-left leading-tight">
                <div className="truncate font-medium">{creator_name || creator_username}</div>
                <div className="truncate text-[11px] text-[var(--app-muted)]">@{creator_username}</div>
              </div>
            </button>

            {!isOwner && !isAdmin && (
              <button
                type="button"
                onClick={() => setcurrent_pdata?.(pdata)}
                className="flex items-center gap-1.5 rounded-md border border-[#da3633]/40 bg-[#da3633]/10 px-3 py-1.5 text-[13px] font-medium text-[#f85149] transition hover:bg-[#da3633]/20"
              >
                <FiFlag /> Report
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default Problem_comp;






















