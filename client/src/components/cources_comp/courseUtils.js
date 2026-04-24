const createLocalId = () =>
  globalThis.crypto?.randomUUID?.() || `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createEmptyMedia = () => ({
  kind: "none",
  url: "",
});

export const createEmptySection = (title = "New section") => ({
  id: createLocalId(),
  title,
  eyebrow: "",
  content: "",
  startMedia: createEmptyMedia(),
  endMedia: createEmptyMedia(),
});

export const createEmptySubtopic = (title = "New subtopic") => ({
  id: createLocalId(),
  title,
  summary: "",
  sections: [createEmptySection("Overview")],
});

export const createEmptyTopic = (title = "New topic") => ({
  id: createLocalId(),
  title,
  description: "",
  subtopics: [createEmptySubtopic("Introduction")],
});

export const createEmptyCourse = () => ({
  title: "",
  description: "",
  banner: null,
  topics: [createEmptyTopic("Getting Started")],
});

const normalizeMedia = (media) => {
  const source = media && typeof media === "object" ? media : {};
  const rawKind = String(source?.kind || source?.type || "none").toLowerCase();
  const kind = rawKind === "image" || rawKind === "video" ? rawKind : "none";
  const url = source?.url ? String(source.url) : "";

  if (kind === "none" || !url.trim()) {
    return createEmptyMedia();
  }

  return {
    kind,
    url: url.trim(),
  };
};

const normalizeSections = (sections = []) =>
  (Array.isArray(sections) ? sections : []).map((section, index) => ({
    id: section?._id || section?.id || createLocalId(),
    title: section?.title || `Section ${index + 1}`,
    eyebrow: section?.eyebrow || "",
    content: section?.content || "",
    startMedia: normalizeMedia(section?.startMedia),
    endMedia: normalizeMedia(section?.endMedia),
  }));

const normalizeSubtopics = (subtopics = []) =>
  (Array.isArray(subtopics) ? subtopics : []).map((subtopic, index) => ({
    id: subtopic?._id || subtopic?.id || createLocalId(),
    title: subtopic?.title || `Subtopic ${index + 1}`,
    summary: subtopic?.summary || "",
    sections: normalizeSections(subtopic?.sections),
  }));

const normalizeLegacyTopics = (legacyData = []) =>
  (Array.isArray(legacyData) ? legacyData : []).map((item, index) => ({
    id: createLocalId(),
    title: item?.title || `Topic ${index + 1}`,
    description: "Migrated from the previous course format.",
    subtopics: [
      {
        id: createLocalId(),
        title: item?.title || `Subtopic ${index + 1}`,
        summary: item?.pdf ? "Legacy PDF resource attached to this item." : "",
        sections: item?.pdf
          ? [
              {
                id: createLocalId(),
                title: "Legacy Resource",
                eyebrow: "Legacy",
                content: `Open the previous PDF resource: ${item.pdf}`,
                startMedia: createEmptyMedia(),
                endMedia: createEmptyMedia(),
              },
            ]
          : [createEmptySection("Overview")],
      },
    ],
  }));

export const normalizeCourse = (course) => {
  if (!course) {
    return createEmptyCourse();
  }

  const topics = course.topics?.length
    ? (Array.isArray(course.topics) ? course.topics : []).map((topic, index) => ({
        id: topic?._id || topic?.id || createLocalId(),
        title: topic?.title || `Topic ${index + 1}`,
        description: topic?.description || "",
        subtopics: normalizeSubtopics(topic?.subtopics),
      }))
    : normalizeLegacyTopics(course.cource_data);

  return {
    ...course,
    banner: course.banner || course.thumbnail || null,
    topics: topics.length ? topics : createEmptyCourse().topics,
  };
};

export const prepareCoursePayload = (course) => ({
  title: course.title.trim(),
  description: course.description.trim(),
  banner: course.banner || null,
  topics: course.topics.map((topic) => ({
    title: topic.title.trim(),
    description: topic.description.trim(),
    subtopics: topic.subtopics.map((subtopic) => ({
      title: subtopic.title.trim(),
      summary: subtopic.summary.trim(),
      sections: subtopic.sections.map((section) => ({
        title: section.title.trim(),
        eyebrow: section.eyebrow.trim(),
        content: section.content,
        startMedia: normalizeMedia(section.startMedia),
        endMedia: normalizeMedia(section.endMedia),
      })),
    })),
  })),
});
