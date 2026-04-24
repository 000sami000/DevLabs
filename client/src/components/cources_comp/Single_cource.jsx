import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdModeEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa6";
import { FaStar } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { delete_single_cource, fetch_single_cource, toggle_cource_star } from "../../api";
import { useToast } from "../common/ToastProvider";
import ReadOnlyQuillEditor from "../text_editor/ReadOnlyQuil";
import { normalizeCourse } from "./courseUtils";
import getAssetUrl from "../../utils/getAssetUrl";

const formatCompactCount = (value) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
    .format(Number(value || 0))
    .replace("K", "k");

const isValidHttpUrl = (value = "") => {
  try {
    const parsed = new URL(String(value));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizeVideoEmbedUrl = (url = "") => {
  if (!isValidHttpUrl(url)) {
    return "";
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.toString();
      }
    }

    if (host.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "").trim();
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (host.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return parsed.toString();
  } catch {
    return "";
  }
};

function SectionMedia({ media, position, title }) {
  if (!media || media.kind === "none" || !media.url || !isValidHttpUrl(media.url)) {
    return null;
  }

  if (media.kind === "image") {
    return (
      <div className={`overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] ${position === "start" ? "mb-5" : "mt-5"}`}>
        <img src={media.url} alt={`${title} ${position} media`} className="h-auto w-full object-cover" loading="lazy" />
      </div>
    );
  }

  const embedUrl = normalizeVideoEmbedUrl(media.url);
  if (!embedUrl) {
    return null;
  }

  return (
    <div className={`overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] ${position === "start" ? "mb-5" : "mt-5"}`}>
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={`${title} ${position} media`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function Single_cource() {
  const user = useSelector((state) => state.userReducer.current_user);
  const toast = useToast();
  const navigate = useNavigate();
  const { c_id } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [busyAction, setBusyAction] = useState("");

  const loadCourse = async () => {
    try {
      const { data } = await fetch_single_cource(c_id);
      const normalized = normalizeCourse(data);
      setCourse(normalized);
      const firstTopic = normalized.topics[0];
      const firstSubtopic = firstTopic?.subtopics[0];
      setSelectedTopicId(firstTopic?.id || null);
      setSelectedSubtopicId(firstSubtopic?.id || null);
      setExpandedTopics(firstTopic ? { [firstTopic.id]: true } : {});
    } catch (error) {
      console.log("fetch_single_cource", error);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [c_id]);

  const selectedTopic = useMemo(
    () => course?.topics.find((topic) => topic.id === selectedTopicId) || course?.topics[0],
    [course, selectedTopicId]
  );

  const selectedSubtopic = useMemo(
    () =>
      selectedTopic?.subtopics.find((subtopic) => subtopic.id === selectedSubtopicId) ||
      selectedTopic?.subtopics[0] ||
      null,
    [selectedTopic, selectedSubtopicId]
  );

  const stats = useMemo(() => {
    if (!course) {
      return { topics: 0, subtopics: 0, sections: 0 };
    }

    const topics = course.topics.length;
    const subtopics = course.topics.reduce((count, topic) => count + topic.subtopics.length, 0);
    const sections = course.topics.reduce(
      (count, topic) => count + topic.subtopics.reduce((subCount, subtopic) => subCount + subtopic.sections.length, 0),
      0
    );

    return { topics, subtopics, sections };
  }, [course]);

  const hasStarred = Boolean(user?._id && Array.isArray(course?.starred_by) && course.starred_by.includes(user._id));

  const delete_cource = async () => {
    try {
      setBusyAction("delete");
      toast.info("Deleting...", "Removing this course.");
      await delete_single_cource(c_id);
      toast.success("Course deleted", "The course has been removed.");
      navigate("/courses");
    } catch (error) {
      console.log("delete course error", error);
      toast.error("Delete failed", error?.response?.data?.message || "Unable to delete course.");
    } finally {
      setBusyAction("");
    }
  };

  const toggleStar = async () => {
    if (!user?._id) {
      toast.info("Authentication required", "Login to star this course.");
      return;
    }

    try {
      setBusyAction("star");
      const { data } = await toggle_cource_star(c_id);
      setCourse(normalizeCourse(data));
    } catch (error) {
      toast.error("Update failed", error?.response?.data?.message || "Unable to update course star.");
    } finally {
      setBusyAction("");
    }
  };

  const toggleTopic = (topicId) => {
    setExpandedTopics((current) => ({
      ...current,
      [topicId]: !current[topicId],
    }));
  };

  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!course) {
    return <div className="p-8 text-center text-[var(--app-text)]">Loading course...</div>;
  }

  const bannerSrc = getAssetUrl(course.banner || course.thumbnail, "");

  return (
    <div className="px-4 py-6 text-[var(--app-text)]">
      <header className="mb-6 overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
        <div className="relative h-[260px] w-full border-b border-[var(--app-border)] bg-[var(--app-bg)] md:h-[320px]">
          {bannerSrc ? (
            <img src={bannerSrc} alt={course.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(120deg,rgba(240,136,62,0.25),rgba(56,189,248,0.16))]">
              <div className="px-4 text-center">
                <div className="text-xs uppercase tracking-[0.25em] text-[var(--app-muted)]">Course Banner</div>
                <div className="mt-2 text-lg font-semibold text-[var(--app-text)]">{course.title}</div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.78)] via-[rgba(0,0,0,0.25)] to-transparent" />

          <button
            type="button"
            onClick={toggleStar}
            disabled={busyAction !== ""}
            className={`absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur disabled:cursor-not-allowed disabled:opacity-60 ${hasStarred ? "border-[#facc15]/70 bg-[#facc15]/22 text-[#facc15]" : "border-white/30 bg-[rgba(15,23,42,0.55)] text-white"}`}
          >
            <FaStar className={`text-[15px] ${hasStarred ? "text-[#facc15]" : "text-white/90"}`} />
            <span>{busyAction === "star" ? "Updating..." : formatCompactCount(course.total_stars)}</span>
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 text-white">
            <h1 className="text-3xl font-semibold md:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 md:text-base">{course.description}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1">{stats.topics} topics</span>
              <span className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1">{stats.subtopics} subtopics</span>
              <span className="rounded-md border border-white/25 bg-white/10 px-2.5 py-1">{stats.sections} sections</span>

            </div>
          </div>
        </div>

        {user?.role === "admin" ? (
          <div className="flex flex-wrap gap-2 px-5 py-4 md:px-7">
            <button
              onClick={() => navigate(`/update-cource/${c_id}`)}
              disabled={busyAction !== ""}
              className="rounded-md bg-[var(--app-accent)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MdModeEdit className="mr-2 inline-block" /> Update
            </button>
            <button
              onClick={delete_cource}
              disabled={busyAction !== ""}
              className="rounded-md bg-[#da3633] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaTrash className="mr-2 inline-block" /> {busyAction === "delete" ? "Deleting..." : "Delete"}
            </button>
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr),240px]">
        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-4">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">Topics</div>
            <div className="space-y-3">
              {course.topics.map((topic, topicIndex) => {
                const isExpanded = expandedTopics[topic.id] ?? topic.id === selectedTopic?.id;
                return (
                  <div key={topic.id} className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
                    <button
                      onClick={() => {
                        toggleTopic(topic.id);
                        setSelectedTopicId(topic.id);
                        setSelectedSubtopicId(topic.subtopics[0]?.id || null);
                      }}
                      className={`flex w-full items-center justify-between gap-3 text-left text-sm font-medium ${selectedTopic?.id === topic.id ? "text-[var(--app-accent)]" : "text-[var(--app-text)]"}`}
                    >
                      <span>{topicIndex + 1}. {topic.title}</span>
                      <span className="text-[var(--app-muted)]">{isExpanded ? "-" : "+"}</span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2 border-l border-[var(--app-border)] pl-3">
                        {topic.subtopics.map((subtopic) => (
                          <button
                            key={subtopic.id}
                            onClick={() => {
                              setSelectedTopicId(topic.id);
                              setSelectedSubtopicId(subtopic.id);
                              setExpandedTopics((current) => ({ ...current, [topic.id]: true }));
                            }}
                            className={`block w-full rounded-md px-2 py-2 text-left text-xs ${selectedSubtopic?.id === subtopic.id ? "bg-[var(--app-bg-soft)] text-[var(--app-accent)]" : "text-[var(--app-muted)]"}`}
                          >
                            {subtopic.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          {selectedTopic && selectedSubtopic ? (
            <article className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-6">
              <div className="mb-2 text-sm uppercase tracking-[0.18em] text-[var(--app-muted)]">{selectedTopic.title}</div>
              <h2 className="text-3xl font-semibold text-[var(--app-text)]">{selectedSubtopic.title}</h2>
              {selectedTopic.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--app-muted)]">{selectedTopic.description}</p>
              ) : null}
              {selectedSubtopic.summary ? (
                <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-[var(--app-text)]">{selectedSubtopic.summary}</p>
              ) : null}

              <div className="mt-10 space-y-12">
                {selectedSubtopic.sections.map((section, index) => {
                  const sectionAnchor = `course-section-${selectedSubtopic.id}-${index}`;
                  return (
                    <section key={section.id} id={sectionAnchor} className="scroll-mt-24 border-t border-[var(--app-border)] pt-8 first:border-t-0 first:pt-0">
                      <SectionMedia media={section.startMedia} position="start" title={section.title || "Section"} />

                      {section.eyebrow ? (
                        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--app-accent)]">{section.eyebrow}</div>
                      ) : null}
                      <h3 className="text-2xl font-semibold text-[var(--app-text)]">{section.title}</h3>

                      <div className="mt-5 overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] p-2">
                        <ReadOnlyQuillEditor content={section.content || "<p>No content added yet.</p>"} />
                      </div>

                      <SectionMedia media={section.endMedia} position="end" title={section.title || "Section"} />
                    </section>
                  );
                })}
              </div>
            </article>
          ) : (
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-8 text-center text-[var(--app-muted)]">
              Select a subtopic to read the course content.
            </div>
          )}
        </main>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-4">
            <div className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">Table of Contents</div>
            {selectedSubtopic?.sections?.length ? (
              <div className="space-y-2">
                {selectedSubtopic.sections.map((section, index) => {
                  const sectionAnchor = `course-section-${selectedSubtopic.id}-${index}`;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(sectionAnchor)}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm text-[var(--app-text)] transition hover:bg-[var(--app-bg-soft-strong)]"
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--app-muted)]">This subtopic does not have any sections yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Single_cource;


