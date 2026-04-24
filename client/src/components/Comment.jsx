import React, { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { createComment, deleteComment, fetchComment, updateComment } from "../api";
import { useToast } from "./common/ToastProvider";
import AppPagination from "./common/AppPagination";
import Loader from "./Loader";
import Report from "./Report";
import WordLimitedTextarea from "./WordLimitedTextarea";

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

const formatCommentTime = (value) => {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return `${format(date, "MMM d, yyyy 'at' hh:mm a")} (${formatDistanceToNow(date, { addSuffix: true })})`;
};

function Comment({
  _id,
  creator_id,
  c_type,
  content_title,
  content_creator_username,
}) {
  const user = useSelector((state) => state.userReducer.current_user);
  const toast = useToast();

  const [text, setText] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateCommentItem, setUpdateCommentItem] = useState(null);
  const [current_cdata, setcurrent_cdata] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const pageCount = Math.max(1, Math.ceil((total || 0) / (limit || 10)));

  const loadComments = async (page = 0) => {
    try {
      setLoading(true);
      const { data } = await fetchComment(_id, page, limit);
      setComments(Array.isArray(data?.comments) ? data.comments : []);
      setTotal(Number(data?.total) || 0);
      setLimit(Number(data?.limit) || 10);
    } catch (err) {
      console.log("fetch_comment-- error", err);
      setComments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(currentPage);
  }, [_id, currentPage]);

  const create_comment = async () => {
    if (!text || !user) {
      return;
    }

    const commentPayload = {
      content_creator_id: creator_id,
      type_id: _id,
      comment_type: c_type,
      comment_content: text,
      commentor_username: user?.username,
      content_title,
      content_creator_username,
      profile_img_: user?.profile_img_,
    };

    try {
      setSubmitting(true);
      toast.info("Creating...", "Posting your comment.");
      await createComment(commentPayload);
      toast.success("Comment posted", "Your comment is now visible.");
      setText("");
      setCurrentPage(0);
      await loadComments(0);
    } catch (err) {
      console.log("create_comment-- error", err);
      toast.error("Create failed", err?.response?.data?.message || "Unable to post comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const update_comment = async (comment) => {
    if (!text) {
      return;
    }

    try {
      setSubmitting(true);
      toast.info("Updating...", "Saving your changes.");
      await updateComment(comment._id, { comment_content: text });
      toast.success("Comment updated", "Changes saved.");
      setUpdateCommentItem(null);
      setText("");
      await loadComments(currentPage);
    } catch (err) {
      console.log("update_comment-- error", err);
      toast.error("Update failed", err?.response?.data?.message || "Unable to update comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const delete_comment = async (c_id) => {
    try {
      setDeletingId(c_id);
      toast.info("Deleting...", "Removing comment.");
      await deleteComment(c_id);
      toast.success("Comment deleted", "The comment was removed.");
      await loadComments(currentPage);
    } catch (err) {
      console.log("delete_comment-- error", err);
      toast.error("Delete failed", err?.response?.data?.message || "Unable to delete comment.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="theme-panel rounded-lg border p-4 md:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Comments</h3>
          <p className="theme-text-muted mt-1 text-sm">Join the discussion.</p>
        </div>
        <div className="theme-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
          {total} total
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader />
        </div>
      ) : comments?.length > 0 ? (
        <div className="space-y-3">
          {comments.map((item) => {
            const canManage = user?._id === item.commentor_id || user?.role === "admin";
            const canReport =
              Boolean(user?._id) &&
              user?._id !== item.commentor_id &&
              user?.role !== "admin";

            return (
              <div
                key={item._id}
                className="theme-soft-surface rounded-md border px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 flex-1 gap-3">
                    <img
                      src={getAssetUrl(item.profile_img_)}
                      alt={item.commentor_username || "Comment author"}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-semibold">
                          {item.commentor_username}
                        </span>
                        <span className="theme-text-subtle text-xs">
                          {formatCommentTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="theme-text-muted mt-2 break-words text-sm leading-6">
                        {item.comment_content}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-start">
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => delete_comment(item._id)}
                          disabled={deletingId === item._id || submitting}
                          className="theme-button-secondary rounded-md p-2 text-[var(--app-danger-text)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <MdDeleteOutline />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUpdateCommentItem(item);
                            setText(item.comment_content);
                          }}
                          disabled={submitting}
                          className="theme-button-secondary rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <TbEditCircle />
                        </button>
                      </>
                    )}
                    {canReport && (
                      <button
                        type="button"
                        onClick={() =>
                          setcurrent_cdata({
                            creator_id: item.commentor_id,
                            creator_username: item.commentor_username,
                            comment_content: item.comment_content,
                            _id: item._id,
                          })
                        }
                        className="theme-button-secondary rounded-md px-3 py-2 text-sm font-semibold"
                      >
                        Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-center pt-1">
            <AppPagination
              pageCount={pageCount}
              currentPage={currentPage}
              onPageChange={(event) => setCurrentPage(event.selected)}
            />
          </div>
        </div>
      ) : (
        <div className="theme-soft-surface rounded-md border px-4 py-8 text-center text-sm">
          No comments yet.
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <WordLimitedTextarea maxWords={70} text={text} setText={setText} />
        </div>
        <button
          className="theme-button-primary rounded-md px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting || loading}
          onClick={() => {
            if (!user?._id) {
              toast.info("Authentication required", "Login to comment.");
              return;
            }

            if (updateCommentItem) {
              update_comment(updateCommentItem);
              return;
            }

            create_comment();
          }}
        >
          {submitting
            ? updateCommentItem
              ? "Updating..."
              : "Posting..."
            : updateCommentItem
              ? "Update comment"
              : "Post comment"}
        </button>
      </div>

      <Report current_cdata={current_cdata} setcurrent_cdata={setcurrent_cdata} />
    </div>
  );
}

export default Comment;

