import React from "react";
import { FaStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import getAssetUrl from "../../utils/getAssetUrl";

const formatCompactCount = (value) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    .format(Number(value || 0))
    .replace("K", "k");

function Cource_card({ cource_props }) {
  const {
    _id,
    title,
    description,
    banner,
    topicCount,
    subtopicCount,
    sectionCount,
    total_stars,
  } = cource_props;
  const bannerSrc = getAssetUrl(banner, "");

  return (
    <Link to={`/course/${_id}`} className="block h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] text-[var(--app-text)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--app-accent)]/50">
        <div className="relative h-[170px] overflow-hidden border-b border-[var(--app-border)] bg-[var(--app-bg)]">
          <div className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-[#facc15]/55 bg-[rgba(15,23,42,0.72)] px-3 py-1.5 text-xs font-semibold text-[#facc15] shadow-[0_8px_22px_rgba(0,0,0,0.35)]">
            <FaStar className="text-[12px]" />
            <span>{formatCompactCount(total_stars)}</span>
          </div>
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt={title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(120deg,rgba(240,136,62,0.25),rgba(56,189,248,0.14))] px-6 text-center">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--app-muted)]">Course</div>
                <div className="mt-2 text-sm font-semibold text-[var(--app-text)] line-clamp-2">{title}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="line-clamp-2 text-xl font-semibold leading-tight text-[var(--app-text)]">{title}</h2>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-[var(--app-muted)]">{description}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-[var(--app-muted)]">
              {topicCount || 0} topics
            </span>
            <span className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-[var(--app-muted)]">
              {subtopicCount || 0} subtopics
            </span>
            <span className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-2.5 py-1 text-[var(--app-muted)]">
              {sectionCount || 0} sections
            </span>          </div>
        </div>
      </article>
    </Link>
  );
}

export default Cource_card;



