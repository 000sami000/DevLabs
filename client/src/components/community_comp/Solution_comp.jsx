import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBookmark, FaRegBookmark, FaToggleOn } from "react-icons/fa";
import { FaToggleOff } from "react-icons/fa6";
import { FiCheckCircle, FiClock, FiFlag, FiMessageSquare } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { IoArrowDownCircle, IoArrowDownCircleOutline, IoArrowUpCircle, IoArrowUpCircleOutline } from "react-icons/io5";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch, useSelector } from "react-redux";
import { approveSolution, deleteSolution, saveSolution, voteSolution } from "../../redux_/actions/solution";
import { useToast } from "../common/ToastProvider";
import "react-quill/dist/quill.snow.css";
import "../text_editor/Editor.scss";
import Comment from "../Comment";
import { formatNumber } from "../format_num";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

const getAssetUrl = (file, fallback = "/default_profile.jpg") => {
  if (file?.url) return file.url;
  if (!file?.destination || !file?.filename) return fallback;
  return `${API_BASE}/${file.destination}/${file.filename}`;
};

function Solution_comp({ sol_props, setSol_ed, setcurrent_sdata, content_title, content_creator_username = "" }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userReducer.current_user);
  const dispatch = useDispatch();
  const toast = useToast();
  const [showComment, setShowComment] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  const {
    solution_content, saved_sol_by, vote, up_vote, down_vote,
    createdAt, _id, creator_name, creator_username, creator_id, total_comments, isApproved, profile_img_,
  } = sol_props;

  const isOwner = user?._id === creator_id;
  const isAdmin = user?.role === "admin";
  const isSaved = Boolean(user && saved_sol_by?.includes(user._id));
  const upVoted = Boolean(user && up_vote?.includes(user._id));
  const downVoted = Boolean(user && down_vote?.includes(user._id));

  const withAuth = (message, callback) => {
    if (!user?._id) {
      toast.info("Authentication required", message);
      return;
    }

    callback();
  };

  const handleVote = async (voteType) => {
    withAuth("Login to vote on solutions.", async () => {
      try {
        setBusyAction(voteType);
        await dispatch(voteSolution(_id, { ...sol_props, vote: voteType }));
        toast.success("Vote updated", "Solution vote updated.");
      } catch (error) {
        toast.error("Vote failed", error?.response?.data?.message || "Unable to update vote.");
      } finally {
        setBusyAction("");
      }
    });
  };

  const handleSave = async () => {
    withAuth("Login to save solutions.", async () => {
      try {
        setBusyAction("save");
        await dispatch(saveSolution(_id));
      } catch (error) {
        toast.error("Save failed", error?.response?.data?.message || "Unable to update saved state.");
      } finally {
        setBusyAction("");
      }
    });
  };

  const handleDelete = async () => {
    try {
      setBusyAction("delete");
      toast.info("Deleting...", "Removing this solution.");
      await dispatch(deleteSolution(_id));
      toast.success("Solution deleted", "The answer has been removed.");
    } catch (error) {
      toast.error("Delete failed", error?.response?.data?.message || "Unable to delete solution.");
    } finally {
      setBusyAction("");
    }
  };

  const handleApprove = async () => {
    try {
      setBusyAction("approve");
      toast.info("Updating...", "Changing approval status.");
      await dispatch(approveSolution(_id));
      toast.success("Status updated", "Solution approval state changed.");
    } catch (error) {
      toast.error("Update failed", error?.response?.data?.message || "Unable to update solution status.");
    } finally {
      setBusyAction("");
    }
  };

  return (
    <article id={_id} className={`rounded-md border overflow-hidden ${isApproved ? "border-[#238636]/50 bg-[var(--app-bg-panel)]" : "border-[var(--app-border)] bg-[var(--app-bg-panel)]"}`}>
      {isApproved && (
        <div className="flex items-center gap-2 border-b border-[#238636]/30 bg-[#238636]/8 px-5 py-2">
          <FiCheckCircle className="text-[#3fb950] text-[13px]" />
          <span className="text-[12px] font-semibold text-[#3fb950]">Accepted answer</span>
        </div>
      )}

      <div className="grid gap-4 px-5 py-4 md:grid-cols-[44px_minmax(0,1fr)] md:px-5">
        <aside className="flex flex-row gap-2 md:flex-col md:items-center">
          <button
            type="button"
            onClick={() => handleVote("upvote")}
            disabled={busyAction !== ""}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[1.15rem] transition disabled:cursor-not-allowed disabled:opacity-60 ${
              upVoted ? "border-[var(--app-accent)] bg-[var(--app-accent)]/10 text-[var(--app-accent)]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)] hover:text-[var(--app-accent)] hover:border-[var(--app-muted)]"
            }`}
          >
            {upVoted ? <IoArrowUpCircle /> : <IoArrowUpCircleOutline />}
          </button>

          <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-[13px] font-bold tabular-nums ${
            vote > 0 ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]"
            : vote < 0 ? "border-[#da3633]/40 bg-[#da3633]/10 text-[#f85149]"
            : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]"
          }`}>
            {vote}
          </div>

          <button
            type="button"
            onClick={() => handleVote("downvote")}
            disabled={busyAction !== ""}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[1.15rem] transition disabled:cursor-not-allowed disabled:opacity-60 ${
              downVoted ? "border-[#da3633] bg-[#da3633]/10 text-[#f85149]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)] hover:text-[#f85149] hover:border-[var(--app-muted)]"
            }`}
          >
            {downVoted ? <IoArrowDownCircle /> : <IoArrowDownCircleOutline />}
          </button>
        </aside>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--app-muted)]">
              <button
                type="button"
                onClick={() => navigate(`/user_overview/${creator_id}`)}
                className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition hover:text-[var(--app-text)]"
              >
                <img src={getAssetUrl(profile_img_)} alt={creator_username} className="h-6 w-6 rounded-full object-cover" />
                <span className="font-medium text-[var(--app-text)]">{creator_name || creator_username}</span>
                <span>@{creator_username}</span>
              </button>
              <span>answered {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isOwner && (
                <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-semibold ${isApproved ? "border-[#3fb950]/40 bg-[#238636]/15 text-[#3fb950]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]"}`}>
                  {isApproved ? <FiCheckCircle className="text-[11px]" /> : <FiClock className="text-[11px]" />}
                  {isApproved ? "Approved" : "Pending review"}
                </span>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={busyAction !== ""}
                className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isSaved ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)] hover:bg-[var(--app-bg-soft-strong)]"
                }`}
              >
                {isSaved ? <FaBookmark className="text-[11px]" /> : <FaRegBookmark className="text-[11px]" />}
                {busyAction === "save" ? "Updating..." : isSaved ? "Saved" : "Save"}
              </button>

              {(isOwner || isAdmin) && (
                <>
                  <button
                    type="button"
                    onClick={() => setSol_ed(sol_props)}
                    disabled={busyAction !== ""}
                    className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--app-muted)] transition hover:bg-[var(--app-bg-soft-strong)] hover:text-[var(--app-text)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <TbEditCircle /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busyAction !== ""}
                    className="flex items-center gap-1.5 rounded-md border border-[#da3633]/40 bg-[#da3633]/10 px-2.5 py-1.5 text-[12px] font-medium text-[#f85149] transition hover:bg-[#da3633]/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <MdDeleteOutline /> {busyAction === "delete" ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}

              {isAdmin && (
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={busyAction !== ""}
                  className="flex items-center gap-1.5 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApproved ? <FaToggleOn className="text-[#3fb950]" /> : <FaToggleOff className="text-[var(--app-muted)]" />}
                  {busyAction === "approve" ? "Updating..." : isApproved ? "Approved" : "Approve"}
                </button>
              )}
            </div>
          </div>

          <div className="editor ql-editor !min-h-0 !max-h-none !overflow-visible !px-0 !py-0 text-[15px] leading-7 text-[var(--app-text)]" dangerouslySetInnerHTML={{ __html: solution_content }} />

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--app-bg-soft)] pt-3">
            <button
              type="button"
              onClick={() => setShowComment((p) => !p)}
              className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition ${
                showComment ? "border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)] hover:bg-[var(--app-bg-soft-strong)]"
              }`}
            >
              <FiMessageSquare className="text-[11px]" />
              {formatNumber(total_comments)} comments
            </button>

            {!isOwner && !isAdmin && (
              <button
                type="button"
                onClick={() => setcurrent_sdata(sol_props)}
                className="flex items-center gap-1.5 rounded-md border border-[#da3633]/40 bg-[#da3633]/10 px-2.5 py-1.5 text-[12px] font-medium text-[#f85149] transition hover:bg-[#da3633]/20"
              >
                <FiFlag className="text-[11px]" /> Report
              </button>
            )}
          </div>

          {showComment && (
            <div className="mt-4 border-t border-[var(--app-border)] pt-4">
              <Comment
                _id={_id}
                creator_id={creator_id}
                c_type={"solution"}
                content_title={content_title}
                content_creator_username={content_creator_username}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default Solution_comp;









