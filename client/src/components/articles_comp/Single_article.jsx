import React, { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import {
  approve_article,
  delete_article,
  dislike_article,
  fetch_single_article,
  like_article,
  save_article,
  search_article,
} from "../../api";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { FaBookmark, FaComments, FaRegBookmark } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useSelector } from "react-redux";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiEye, FiEyeOff } from "react-icons/fi";
import Loader from "../Loader";
import Comment from "../Comment";
import Report from "../Report";
import { useToast } from "../common/ToastProvider";
import { formatNumber } from "../format_num";
import ReadOnlyEditor from "../text_editor/ReadOnlyEditor";
import Update_article from "./Update_article";
import "../text_editor/Editor.scss";
import "../text_editor/editorpro.css";

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

const normalizeTags = (tags = []) =>
  (Array.isArray(tags) ? tags : [])
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean);

const getTagOverlap = (candidateTags = [], sourceTags = []) => {
  const sourceSet = new Set(normalizeTags(sourceTags));
  return normalizeTags(candidateTags).reduce(
    (acc, tag) => acc + (sourceSet.has(tag) ? 1 : 0),
    0
  );
};

function Single_article() {
  const navigate = useNavigate();
  const { a_id } = useParams();
  const user = useSelector((state) => state.userReducer.current_user);
  const toast = useToast();

  const [singleArticle, setSingleArticle] = useState({});
  const [showComment, setShowComment] = useState(false);
  const [relatedArt, setRelatedArt] = useState(null);
  const [currentAdata, setCurrentAdata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isopen, setisopen] = useState(false);
  const [busyAction, setBusyAction] = useState("");

  const {
    _id,
    title,
    description,
    article_content,
    tags = [],
    likes = [],
    dislikes = [],
    creator_name,
    creator_username,
    creator_id,
    saved_art_by = [],
    isApproved,
    isActive,
    createdAt,
    profile_img_,
    total_comments = 0,
    thumbnail,
  } = singleArticle;

  useEffect(() => {
    const getSinglearticle = async () => {
      try {
        setLoading(true);
        const { data } = await fetch_single_article(a_id);
        setSingleArticle(data || {});
      } catch (err) {
        console.log("get_Single_article err---", err);
      } finally {
        setLoading(false);
      }
    };

    getSinglearticle();
  }, [a_id]);

  useEffect(() => {
    const related_article = async () => {
      if (!singleArticle.tags?.length) {
        setRelatedArt(null);
        return;
      }

      try {
        const { data } = await search_article(singleArticle.tags, { page: 0, limit: 24, excludeId: a_id });
        setRelatedArt(data);
      } catch (err) {
        console.log("search_data_by_title---err", err);
      }
    };

    related_article();
  }, [singleArticle, a_id]);

  const relatedArticles = useMemo(() => {
    const rows = Array.isArray(relatedArt?.article) ? relatedArt.article : [];
    const sourceTags = normalizeTags(tags);

    return rows
      .filter((item) => String(item?._id) !== String(a_id))
      .map((item) => {
        const overlap = getTagOverlap(item?.tags, sourceTags);
        const likesCount = Array.isArray(item?.likes) ? item.likes.length : 0;
        return {
          ...item,
          __overlap: overlap,
          __score: overlap * 100 + likesCount * 2,
          __time: new Date(item?.createdAt || 0).getTime(),
        };
      })
      .filter((item) => item.__overlap > 0)
      .sort((left, right) => right.__score - left.__score || right.__time - left.__time)
      .slice(0, 6);
  }, [a_id, relatedArt, tags]);

  const publishedAt = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "Recently published";

  const isOwner = Boolean(user?._id && user._id === creator_id);
  const canManage = Boolean(
    user?._id && (isOwner || user.role === "admin")
  );
  const isSaved = Boolean(user?._id && saved_art_by.includes(user._id));
  const hasLiked = Boolean(user?._id && likes.includes(user._id));
  const hasDisliked = Boolean(user?._id && dislikes.includes(user._id));
  const hasCoverImage = Boolean(
    thumbnail?.url || (thumbnail?.destination && thumbnail?.filename)
  );

  const requireAuth = (message, action) => {
    if (!user?._id) {
      toast.info("Authentication required", message);
      return;
    }

    action();
  };

  const applyArticleActionResponse = (data, actionName) => {
    if (data && data._id) {
      setSingleArticle(data);
      return;
    }

    console.log(`${actionName} returned unexpected payload`, data);
  };

  const savedarticle = async () => {
    try {
      setBusyAction("save");
      const { data } = await save_article(_id);
      applyArticleActionResponse(data, "save_article");
    } catch (err) {
      console.log("savedarticle-- error", err);
      toast.error("Save failed", err?.response?.data?.message || "Unable to save article.");
    } finally {
      setBusyAction("");
    }
  };

  const likearticle = async () => {
    try {
      setBusyAction("like");
      const { data } = await like_article(_id);
      applyArticleActionResponse(data, "like_article");
      toast.success("Reaction updated", "Like state updated.");
    } catch (err) {
      console.log("like_article-- error", err);
      toast.error("Like failed", err?.response?.data?.message || "Unable to update reaction.");
    } finally {
      setBusyAction("");
    }
  };

  const dislikearticle = async () => {
    try {
      setBusyAction("dislike");
      const { data } = await dislike_article(_id);
      applyArticleActionResponse(data, "dislike_article");
      toast.success("Reaction updated", "Dislike state updated.");
    } catch (err) {
      console.log("dislike_article-- error", err);
      toast.error("Dislike failed", err?.response?.data?.message || "Unable to update reaction.");
    } finally {
      setBusyAction("");
    }
  };

  const del_article = async (articleId) => {
    if (!window.confirm("Delete this article permanently?")) {
      return;
    }

    try {
      setBusyAction("delete");
      toast.info("Deleting...", "Removing this article.");
      await delete_article(articleId);
      toast.success("Article deleted", "The article has been removed.");
      navigate("/articles");
    } catch (err) {
      console.log("del_article-- error", err);
      toast.error("Delete failed", err?.response?.data?.message || "Unable to delete article.");
    } finally {
      setBusyAction("");
    }
  };

  const approve_function = async (articleId) => {
    try {
      setBusyAction("approve");
      const { data } = await approve_article(articleId);
      setSingleArticle(data);
      toast.success("Status updated", "Article approval changed.");
    } catch (err) {
      console.log("approve error", err);
      toast.error("Update failed", err?.response?.data?.message || "Unable to update approval.");
    } finally {
      setBusyAction("");
    }
  };

  const renderLikeIcon = hasLiked ? <AiFillLike /> : <AiOutlineLike />;
  const renderDislikeIcon = hasDisliked ? <AiFillDislike /> : <AiOutlineDislike />;
  const renderSaveIcon = isSaved ? <FaBookmark /> : <FaRegBookmark />;

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {loading ? (
          <div className="theme-surface flex min-h-[240px] items-center justify-center rounded-lg border">
            <Loader />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <main className="flex min-w-0 flex-col gap-6">
              <article className="theme-surface theme-panel overflow-hidden rounded-lg border">
                {/* Cover section with overlay */}
                <div className="relative min-h-[280px] overflow-hidden bg-black/70 md:min-h-[340px]">
                  {/* Background image or placeholder */}
                  {hasCoverImage ? (
                    <img
                      src={getAssetUrl(thumbnail, "/default_profile.jpg")}
                      alt={title}
                      className="mx-auto block max-h-[340px] w-full object-contain md:max-h-[480px]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#1a2a3a] to-[#0d1b2a]" />
                  )}

                  {/* Overlay: author info + delete/update buttons */}
                  <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 via-black/30 to-transparent p-4 md:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      {/* Author info (clickable) */}
                      <button
                        type="button"
                        onClick={() => {
                          if (creator_id) {
                            navigate(`/user_overview/${creator_id}`);
                          }
                        }}
                        className="group flex items-center gap-3 rounded-md transition hover:opacity-90"
                      >
                        <img
                          src={getAssetUrl(profile_img_)}
                          alt={creator_username || "Author"}
                          className="h-12 w-12 rounded-full border-2 border-white/30 object-cover shadow-md md:h-14 md:w-14"
                        />
                        <div className="text-left">
                          <p className="text-base font-semibold text-white md:text-lg">
                            {creator_name || creator_username || "Anonymous writer"}
                          </p>
                          <p className="text-xs text-white/80 md:text-sm">
                            @{creator_username || "unknown"}
                          </p>
                          <p className="text-xs text-white/70">{publishedAt}</p>
                        </div>
                      </button>

                      {/* Action buttons (delete / edit) */}
                      {canManage && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => del_article(_id)}
                            disabled={busyAction !== ""}
                            className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Delete article"
                          >
                            <MdDeleteOutline className="text-xl" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setisopen(true)}
                            disabled={busyAction !== ""}
                            className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Edit article"
                          >
                            <TbEditCircle className="text-xl" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title & description */}
                <div className="mx-auto w-full max-w-4xl px-6 py-7 md:px-10 md:py-9">
                  <div className="mt-6 space-y-4">
                    <h1 className="text-3xl font-semibold leading-tight text-[var(--app-text)] md:text-5xl">
                      {title}
                    </h1>
                    {description && (
                      <p className="max-w-3xl text-base leading-8 text-[var(--app-muted)]">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Interaction bar (likes, saves, comments, etc.) */}
                <div className="border-y border-[var(--app-border)] px-6 py-4 md:px-8">
                  <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center gap-3">
                    {isOwner && (
                      <>
                        <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${isApproved ? "border-[#3fb950]/40 bg-[#238636]/15 text-[#3fb950]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]"}`}>
                          {isApproved ? <FiCheckCircle className="text-[13px]" /> : <FiClock className="text-[13px]" />}
                          {isApproved ? "Approved" : "Pending review"}
                        </span>
                        <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${isActive ? "border-[#6cc9ff]/40 bg-[#6cc9ff]/12 text-[#6cc9ff]" : "border-[var(--app-border)] bg-[var(--app-bg-soft)] text-[var(--app-muted)]"}`}>
                          {isActive ? <FiEye className="text-[13px]" /> : <FiEyeOff className="text-[13px]" />}
                          {isActive ? "Visible" : "Hidden"}
                        </span>
                      </>
                    )}
                    {user?.role === "admin" && (
                      <button
                        type="button"
                        onClick={() => approve_function(_id)}
                        disabled={busyAction !== ""}
                        className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isApproved ? <FaToggleOn /> : <FaToggleOff />}
                        <span>{busyAction === "approve" ? "Updating..." : isApproved ? "Approved" : "Approve now"}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        requireAuth("Login to save articles", savedarticle)
                      }
                      disabled={busyAction !== ""}
                      className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {renderSaveIcon}
                      <span>{busyAction === "save" ? "Updating..." : isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentAdata({
                          _id,
                          creator_id,
                          creator_username,
                          title,
                          report_type: "article",
                        })
                      }
                      className="theme-button-secondary rounded-md px-4 py-2 text-sm font-semibold"
                    >
                      Report
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        requireAuth("Login to like articles", likearticle)
                      }
                      disabled={busyAction !== ""}
                      className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {renderLikeIcon}
                      <span>{formatNumber(likes.length)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        requireAuth("Login to dislike articles", dislikearticle)
                      }
                      disabled={busyAction !== ""}
                      className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {renderDislikeIcon}
                      <span>{formatNumber(dislikes.length)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowComment((prev) => !prev)}
                      className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
                    >
                      <FaComments />
                      <span>
                        {showComment ? "Hide discussion" : "Open discussion"}
                      </span>
                      <span className="theme-text-muted">{formatNumber(total_comments)}</span>
                    </button>
                  </div>
                </div>

                {/* Article content */}
                <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-10">
                  {article_content && typeof article_content === "object" ? (
                    <ReadOnlyEditor data={article_content} />
                  ) : (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: article_content || "<p>No content added yet.</p>",
                      }}
                      className="editor_article ql-editor"
                    />
                  )}
                </div>

                {/* Tags */}
                <div className="border-t border-[var(--app-border)] px-6 py-5 md:px-8">
                  <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {tags.length > 0 ? (
                        tags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="theme-badge rounded-full px-3 py-1 text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="theme-text-subtle text-sm">
                          No tags added.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              {/* Comments section */}
              {showComment && (
                <section className="theme-surface rounded-lg border p-4 md:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-semibold">Discussion</h2>
                      <p className="theme-text-muted mt-1 text-sm">
                        Add context, challenge ideas, or leave feedback for the author.
                      </p>
                    </div>
                    <div className="theme-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                      {formatNumber(total_comments)} comments
                    </div>
                  </div>
                  <Comment
                    _id={_id}
                    creator_id={creator_id}
                    c_type={"article"}
                    content_title={title}
                    content_creator_username={creator_username}
                  />
                </section>
              )}
            </main>

            {/* Related articles sidebar */}
            <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
              <section className="theme-surface rounded-lg border p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Related reads</h2>
                    <p className="theme-text-muted mt-1 text-sm">
                      More articles with overlapping tags.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={() => navigate(`/article/${item._id}`)}
                        className="theme-soft-surface flex items-stretch overflow-hidden rounded-lg border text-left transition hover:border-[var(--app-border-strong)] hover:bg-[var(--app-bg-soft-strong)]"
                      >
                        <div className="h-auto w-[92px] flex-none bg-[#12231c]">
                          <img
                            src={getAssetUrl(item.thumbnail, "/default_profile.jpg")}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3">
                          <div className="line-clamp-2 text-sm font-semibold leading-6">
                            {item.title}
                          </div>
                          <div className="theme-text-muted text-xs">
                            {formatNumber(item.likes?.length || 0)} likes
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="theme-soft-surface rounded-lg border px-4 py-5 text-sm">
                      No related posts yet.
                    </div>
                  )}
                </div>
              </section>
            </aside>

            {/* Modals */}
            <Update_article
              Edit_articleobj={singleArticle}
              setEdit_articleobj={setSingleArticle}
              setisopen={setisopen}
              isopen={isopen}
            />
            <Report
              current_adata={currentAdata}
              setcurrent_adata={setCurrentAdata}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Single_article;