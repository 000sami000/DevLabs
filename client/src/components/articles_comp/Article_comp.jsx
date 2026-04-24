import React from "react";
import { formatDistanceToNow } from "date-fns";
import { AiFillLike } from "react-icons/ai";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

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

function Article_comp({ adata }) {
  const navigate = useNavigate();

  const {
    _id,
    title,
    description,
    tags = [],
    likes = [],
    creator_name,
    creator_username,
    creator_id,
    createdAt,
    thumbnail,
    profile_img_,
  } = adata;

  const publishedAt = createdAt
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
    : "Recently published";

  return (
    <article
      onClick={() => navigate(`/article/${_id}`)}
      className="group h-full cursor-pointer overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] transition hover:border-[var(--app-accent)]"
    >
      <div className="grid md:h-[280px] md:grid-cols-[260px_minmax(0,1fr)]">
        <div className="relative h-[220px] overflow-hidden bg-[var(--app-bg-soft)] md:h-full">
          {thumbnail?.url || (thumbnail?.destination && thumbnail?.filename) ? (
            <img
              src={getAssetUrl(thumbnail)}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(88,166,255,0.2),transparent_45%),linear-gradient(160deg,#1b2940,var(--app-bg))]" />
          )}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (creator_id) {
                navigate(`/user_overview/${creator_id}`);
              }
            }}
            className="absolute left-3 top-3 z-10 inline-flex max-w-[calc(100%-24px)] items-center gap-2 rounded-md border border-white/35 bg-black/45 px-2.5 py-2 text-left text-white backdrop-blur-sm"
          >
            <img
              src={getAssetUrl(profile_img_)}
              alt={creator_username || "Author"}
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold">
                {creator_name || creator_username || "Anonymous writer"}
              </p>
              <p className="truncate text-[11px] text-white/85">@{creator_username || "unknown"}</p>
            </div>
          </button>
        </div>

        <div className="flex h-full flex-col gap-4 overflow-hidden p-5">
          <div className="flex items-start justify-end gap-3">
            <span className="inline-flex rounded-md border border-[#1a7f37]/35 bg-[#1a7f37]/12 px-2.5 py-1 text-[11px] font-semibold text-[#1a7f37]">
              Posted {publishedAt}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--app-text)]">
              <AiFillLike className="text-[var(--app-accent)]" />
              {likes.length}
            </span>
          </div>

          <div>
            <h2 className="line-clamp-2 text-2xl font-semibold leading-tight text-[var(--app-text)]">{title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-[var(--app-muted)]">
              {description || "A deep-dive article shared by the community."}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--app-border)] pt-3">
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="max-w-[120px] truncate rounded-full bg-[#ddf4ff] px-3 py-1 text-xs font-medium text-[#0969da]"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-[var(--app-muted)]">No tags added yet.</span>
              )}
            </div>

            <button
              type="button"
              className="theme-button-secondary inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold"
            >
              Read
              <FiArrowRight className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default Article_comp;
