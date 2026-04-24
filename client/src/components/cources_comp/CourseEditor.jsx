import React, { useEffect, useMemo, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { MdDelete, MdOutlineTopic } from "react-icons/md";
import QuilEditor from "../text_editor/QuilEditor";
import { useToast } from "../common/ToastProvider";
import getAssetUrl from "../../utils/getAssetUrl";
import {
  createEmptyCourse,
  createEmptySection,
  createEmptySubtopic,
  createEmptyTopic,
  normalizeCourse,
  prepareCoursePayload,
} from "./courseUtils";

function CourseEditor({ initialCourse, onSubmit, submitLabel }) {
  const [course, setCourse] = useState(createEmptyCourse());
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedSubtopicId, setSelectedSubtopicId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState(null);
  const toast = useToast();

  const clearLocalPreview = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  };

  useEffect(() => {
    const normalizedCourse = normalizeCourse(initialCourse || createEmptyCourse());
    setCourse(normalizedCourse);
    setSelectedTopicId(normalizedCourse.topics[0]?.id || null);
    setSelectedSubtopicId(normalizedCourse.topics[0]?.subtopics[0]?.id || null);
    setBannerFile(null);

    clearLocalPreview();
    const existingBanner = getAssetUrl(normalizedCourse.banner || normalizedCourse.thumbnail || null, "");
    setBannerPreview(existingBanner || "");
  }, [initialCourse]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const selectedTopic = useMemo(
    () => course.topics.find((topic) => topic.id === selectedTopicId) || course.topics[0],
    [course, selectedTopicId]
  );

  const selectedSubtopic = useMemo(
    () =>
      selectedTopic?.subtopics.find((subtopic) => subtopic.id === selectedSubtopicId) ||
      selectedTopic?.subtopics[0] ||
      null,
    [selectedTopic, selectedSubtopicId]
  );

  const updateCourseField = (field, value) => {
    setCourse((currentCourse) => ({ ...currentCourse, [field]: value }));
  };

  const updateTopic = (topicId, updater) => {
    setCourse((currentCourse) => ({
      ...currentCourse,
      topics: currentCourse.topics.map((topic) =>
        topic.id === topicId ? updater(topic) : topic
      ),
    }));
  };

  const updateSubtopic = (topicId, subtopicId, updater) => {
    updateTopic(topicId, (topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((subtopic) =>
        subtopic.id === subtopicId ? updater(subtopic) : subtopic
      ),
    }));
  };

  const updateSection = (topicId, subtopicId, sectionId, updater) => {
    updateSubtopic(topicId, subtopicId, (subtopic) => ({
      ...subtopic,
      sections: subtopic.sections.map((section) =>
        section.id === sectionId ? updater(section) : section
      ),
    }));
  };

  const addTopic = () => {
    const topic = createEmptyTopic(`Topic ${course.topics.length + 1}`);
    setCourse((currentCourse) => ({
      ...currentCourse,
      topics: [...currentCourse.topics, topic],
    }));
    setSelectedTopicId(topic.id);
    setSelectedSubtopicId(topic.subtopics[0]?.id || null);
  };

  const removeTopic = (topicId) => {
    const nextTopics = course.topics.filter((topic) => topic.id !== topicId);
    const safeTopics = nextTopics.length ? nextTopics : [createEmptyTopic("Getting Started")];
    setCourse((currentCourse) => ({
      ...currentCourse,
      topics: safeTopics,
    }));
    setSelectedTopicId(safeTopics[0].id);
    setSelectedSubtopicId(safeTopics[0].subtopics[0]?.id || null);
  };

  const addSubtopic = (topicId) => {
    const subtopic = createEmptySubtopic(
      `Subtopic ${(course.topics.find((topic) => topic.id === topicId)?.subtopics.length || 0) + 1}`
    );
    updateTopic(topicId, (topic) => ({
      ...topic,
      subtopics: [...topic.subtopics, subtopic],
    }));
    setSelectedTopicId(topicId);
    setSelectedSubtopicId(subtopic.id);
  };

  const removeSubtopic = (topicId, subtopicId) => {
    updateTopic(topicId, (topic) => {
      const nextSubtopics = topic.subtopics.filter((subtopic) => subtopic.id !== subtopicId);
      const safeSubtopics = nextSubtopics.length ? nextSubtopics : [createEmptySubtopic("Introduction")];
      setSelectedSubtopicId(safeSubtopics[0].id);
      return {
        ...topic,
        subtopics: safeSubtopics,
      };
    });
  };

  const addSection = (topicId, subtopicId) => {
    updateSubtopic(topicId, subtopicId, (subtopic) => ({
      ...subtopic,
      sections: [...subtopic.sections, createEmptySection(`Section ${subtopic.sections.length + 1}`)],
    }));
  };

  const removeSection = (topicId, subtopicId, sectionId) => {
    updateSubtopic(topicId, subtopicId, (subtopic) => ({
      ...subtopic,
      sections: subtopic.sections.filter((section) => section.id !== sectionId),
    }));
  };

  const handleBannerSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    clearLocalPreview();
    const nextPreview = URL.createObjectURL(file);
    setLocalPreviewUrl(nextPreview);
    setBannerPreview(nextPreview);
    setBannerFile(file);
    updateCourseField("banner", null);
  };

  const handleBannerRemove = () => {
    clearLocalPreview();
    setBannerPreview("");
    setBannerFile(null);
    updateCourseField("banner", null);
  };

  const submitHandler = async () => {
    const payload = prepareCoursePayload(course);

    const hasEmptyTitle = !payload.title || !payload.description;
    const hasNoTopics = payload.topics.length === 0;
    const hasInvalidStructure = payload.topics.some(
      (topic) =>
        !topic.title ||
        topic.subtopics.length === 0 ||
        topic.subtopics.some(
          (subtopic) =>
            !subtopic.title ||
            subtopic.sections.length === 0 ||
            subtopic.sections.some((section) => !section.title)
        )
    );

    if (hasEmptyTitle || hasNoTopics || hasInvalidStructure) {
      toast.info(
        "Missing fields",
        "Fill title, description, and all topic/subtopic/section titles before saving."
      );
      return;
    }

    payload.removeBanner = !payload.banner && !bannerFile;
    if (bannerFile) {
      payload.bannerFile = bannerFile;
    }

    setSubmitting(true);
    try {
      toast.info(
        submitLabel === "Update" ? "Updating..." : "Creating...",
        submitLabel === "Update" ? "Updating course." : "Creating course."
      );
      await onSubmit(payload);
      toast.success(
        submitLabel === "Update" ? "Course updated" : "Course created",
        submitLabel === "Update" ? "Course changes are now saved." : "Course is now published."
      );
    } catch (error) {
      toast.error(
        submitLabel === "Update" ? "Update failed" : "Create failed",
        error?.response?.data?.message || "Unable to save course."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 text-white">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{submitLabel} Course</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">
            Build the course like a professional documentation flow with clear topics, table-of-contents sections, and rich content.
          </p>
        </div>
        <button
          onClick={submitHandler}
          disabled={submitting}
          className="rounded-md bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-2xl border border-[var(--app-border)] bg-[#1a1a1a] p-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">Course Title</label>
            <input
              value={course.title}
              onChange={(event) => updateCourseField("title", event.target.value)}
              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 outline-none"
              placeholder="JavaScript Documentation"
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">Course Description</label>
            <textarea
              value={course.description}
              onChange={(event) => updateCourseField("description", event.target.value)}
              className="min-h-[100px] w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 outline-none"
              placeholder="Short overview of what this course teaches"
            />
          </div>

          <div className="mb-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-3">
            <label className="mb-2 block text-sm font-medium text-[var(--app-text)]">Course Banner (optional)</label>

            <div className="h-[148px] overflow-hidden rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)]">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Course banner preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-[linear-gradient(120deg,rgba(240,136,62,0.25),rgba(56,189,248,0.12))] text-center text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
                  No banner selected
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <label className="cursor-pointer rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--app-text)]">
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerSelect}
                />
              </label>
              {(bannerPreview || course.banner) ? (
                <button
                  type="button"
                  onClick={handleBannerRemove}
                  className="rounded-md border border-[#da3633]/40 bg-[#da3633]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#f85149]"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-[var(--app-accent)]/30 bg-[var(--app-bg)] p-3 text-sm leading-6 text-[var(--app-muted)]">
            <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--app-accent)]">Writing Tips</div>
            <p>Use section start/end media for context and wrap-up: image or video links from YouTube, Instagram, Facebook, and similar platforms.</p>
          </div>

          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--app-muted)]">Topics</div>
            <button onClick={addTopic} className="text-sm text-[var(--app-accent)]">+ Add Topic</button>
          </div>

          <div className="space-y-3">
            {course.topics.map((topic, topicIndex) => (
              <div key={topic.id} className="rounded-xl border border-[var(--app-border)] bg-[#111111] p-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setSelectedSubtopicId(topic.subtopics[0]?.id || null);
                    }}
                    className={`flex-1 text-left text-sm font-medium ${selectedTopic?.id === topic.id ? "text-[#ffd166]" : "text-white"}`}
                  >
                    {topicIndex + 1}. {topic.title}
                  </button>
                  <button onClick={() => removeTopic(topic.id)} className="text-[var(--app-muted)] hover:text-red-400">
                    <MdDelete />
                  </button>
                </div>

                <div className="mt-3 space-y-2 pl-2">
                  {topic.subtopics.map((subtopic) => (
                    <div key={subtopic.id} className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setSelectedSubtopicId(subtopic.id);
                        }}
                        className={`flex-1 rounded-md px-2 py-1 text-left text-xs ${selectedSubtopic?.id === subtopic.id ? "bg-[var(--app-bg-soft)] text-[var(--app-accent)]" : "bg-transparent text-[var(--app-muted)]"}`}
                      >
                        {subtopic.title}
                      </button>
                      <button onClick={() => removeSubtopic(topic.id, subtopic.id)} className="text-white/40 hover:text-red-400">
                        <MdDelete />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={() => addSubtopic(topic.id)} className="mt-3 text-xs text-[var(--app-accent)]">
                  + Add Subtopic
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-2xl border border-[var(--app-border)] bg-[#161616] p-5">
          {selectedTopic && (
            <>
              <div className="mb-6 rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[var(--app-muted)]">
                  <MdOutlineTopic /> Topic
                </div>
                <input
                  value={selectedTopic.title}
                  onChange={(event) =>
                    updateTopic(selectedTopic.id, (topic) => ({ ...topic, title: event.target.value }))
                  }
                  className="mb-3 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-xl font-semibold outline-none"
                  placeholder="Topic title"
                />
                <textarea
                  value={selectedTopic.description}
                  onChange={(event) =>
                    updateTopic(selectedTopic.id, (topic) => ({ ...topic, description: event.target.value }))
                  }
                  className="min-h-[90px] w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 outline-none"
                  placeholder="Topic description shown in the course page"
                />
              </div>

              {selectedSubtopic && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
                    <div className="mb-3 text-sm uppercase tracking-[0.16em] text-[var(--app-muted)]">Subtopic</div>
                    <input
                      value={selectedSubtopic.title}
                      onChange={(event) =>
                        updateSubtopic(selectedTopic.id, selectedSubtopic.id, (subtopic) => ({
                          ...subtopic,
                          title: event.target.value,
                        }))
                      }
                      className="mb-3 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-lg font-semibold outline-none"
                      placeholder="Subtopic title"
                    />
                    <textarea
                      value={selectedSubtopic.summary}
                      onChange={(event) =>
                        updateSubtopic(selectedTopic.id, selectedSubtopic.id, (subtopic) => ({
                          ...subtopic,
                          summary: event.target.value,
                        }))
                      }
                      className="min-h-[110px] w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 outline-none"
                      placeholder="Introductory text for this subtopic"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Sections</h2>
                      <p className="text-sm text-[var(--app-muted)]">Each section supports start/end media and rich content.</p>
                    </div>
                    <button
                      onClick={() => addSection(selectedTopic.id, selectedSubtopic.id)}
                      className="rounded-md border border-[var(--app-accent)]/40 px-3 py-2 text-sm text-[var(--app-accent)]"
                    >
                      <IoMdAddCircleOutline className="inline-block text-base" /> Add Section
                    </button>
                  </div>

                  <div className="space-y-5">
                    {selectedSubtopic.sections.map((section, index) => (
                      <div key={section.id} className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-white/45">Section {index + 1}</div>
                            <div className="mt-1 text-sm text-[var(--app-muted)]">Compose this section like a polished blog post.</div>
                          </div>
                          <button
                            onClick={() => removeSection(selectedTopic.id, selectedSubtopic.id, section.id)}
                            className="text-[var(--app-muted)] hover:text-red-400"
                          >
                            <MdDelete />
                          </button>
                        </div>

                        <div className="mb-3 grid gap-3 md:grid-cols-[180px,1fr]">
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Eyebrow</label>
                            <input
                              value={section.eyebrow}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  eyebrow: event.target.value,
                                }))
                              }
                              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-sm outline-none"
                              placeholder="Example: Deep Dive"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/45">Section Heading</label>
                            <input
                              value={section.title}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 font-semibold outline-none"
                              placeholder="Section title"
                            />
                          </div>
                        </div>

                        <div className="mb-3 grid gap-3 md:grid-cols-2">
                          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-3">
                            <div className="mb-2 text-xs uppercase tracking-[0.14em] text-white/45">Start Media</div>
                            <select
                              value={section.startMedia?.kind || "none"}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  startMedia: {
                                    kind: event.target.value,
                                    url: event.target.value === "none" ? "" : current.startMedia?.url || "",
                                  },
                                }))
                              }
                              className="mb-2 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm outline-none"
                            >
                              <option value="none">No start media</option>
                              <option value="image">Image</option>
                              <option value="video">Video Embed URL</option>
                            </select>
                            <input
                              value={section.startMedia?.url || ""}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  startMedia: {
                                    kind: current.startMedia?.kind || "none",
                                    url: event.target.value,
                                  },
                                }))
                              }
                              disabled={(section.startMedia?.kind || "none") === "none"}
                              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-55"
                              placeholder="https://..."
                            />
                          </div>

                          <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-3">
                            <div className="mb-2 text-xs uppercase tracking-[0.14em] text-white/45">End Media</div>
                            <select
                              value={section.endMedia?.kind || "none"}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  endMedia: {
                                    kind: event.target.value,
                                    url: event.target.value === "none" ? "" : current.endMedia?.url || "",
                                  },
                                }))
                              }
                              className="mb-2 w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm outline-none"
                            >
                              <option value="none">No end media</option>
                              <option value="image">Image</option>
                              <option value="video">Video Embed URL</option>
                            </select>
                            <input
                              value={section.endMedia?.url || ""}
                              onChange={(event) =>
                                updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                  ...current,
                                  endMedia: {
                                    kind: current.endMedia?.kind || "none",
                                    url: event.target.value,
                                  },
                                }))
                              }
                              disabled={(section.endMedia?.kind || "none") === "none"}
                              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-55"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                        <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-3">
                          <div className="mb-3 text-xs uppercase tracking-[0.18em] text-white/45">Section Content</div>
                          <QuilEditor
                            ContentHtml={section.content}
                            setContentHtml={(value) =>
                              updateSection(selectedTopic.id, selectedSubtopic.id, section.id, (current) => ({
                                ...current,
                                content: value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default CourseEditor;



