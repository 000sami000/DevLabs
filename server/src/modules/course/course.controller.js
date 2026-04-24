const mongoose = require("mongoose");
const cource_Model = require("./course.model");
const { deleteStoredObject } = require("../../utils/objectStorage");
const {
  buildPaginatedResponse,
  getPaginationFromQuery,
} = require("../../utils/pagination");

const toBoolean = (value) => value === true || value === "true" || value === 1 || value === "1";

const sanitizeMedia = (media = {}) => {
  const source = media && typeof media === "object" ? media : {};
  const rawKind = String(source?.kind || source?.type || "none").trim().toLowerCase();
  const kind = rawKind === "image" || rawKind === "video" ? rawKind : "none";
  const url = String(source?.url || "").trim();

  if (kind === "none" || !url) {
    return { kind: "none", url: "" };
  }

  return { kind, url };
};

const buildLegacyTopics = (legacyData) => {
  if (!Array.isArray(legacyData)) {
    return [];
  }

  return legacyData.map((item, index) => ({
    title: item?.title?.trim() || `Topic ${index + 1}`,
    description: "",
    subtopics: [
      {
        title: item?.title?.trim() || `Subtopic ${index + 1}`,
        summary: item?.pdf ? "Legacy PDF resource migrated from the previous course format." : "",
        sections: item?.pdf
          ? [
              {
                title: "Legacy Resource",
                eyebrow: "Legacy",
                content: `Open the attached PDF resource: ${item.pdf}`,
                startMedia: { kind: "none", url: "" },
                endMedia: { kind: "none", url: "" },
              },
            ]
          : [],
      },
    ],
  }));
};

const sanitizeSections = (sections = []) =>
  (Array.isArray(sections) ? sections : [])
    .map((section, index) => ({
      title: String(section?.title || `Section ${index + 1}`).trim(),
      eyebrow: String(section?.eyebrow || "").trim(),
      content: String(section?.content || ""),
      startMedia: sanitizeMedia(section?.startMedia),
      endMedia: sanitizeMedia(section?.endMedia),
    }))
    .filter(
      (section) =>
        section.title ||
        section.content ||
        section.startMedia.kind !== "none" ||
        section.endMedia.kind !== "none"
    );

const sanitizeSubtopics = (subtopics = []) =>
  (Array.isArray(subtopics) ? subtopics : [])
    .map((subtopic, index) => ({
      title: String(subtopic?.title || `Subtopic ${index + 1}`).trim(),
      summary: String(subtopic?.summary || "").trim(),
      sections: sanitizeSections(subtopic?.sections),
    }))
    .filter((subtopic) => subtopic.title);

const sanitizeTopics = (topics = []) =>
  (Array.isArray(topics) ? topics : [])
    .map((topic, index) => ({
      title: String(topic?.title || `Topic ${index + 1}`).trim(),
      description: String(topic?.description || "").trim(),
      subtopics: sanitizeSubtopics(topic?.subtopics),
    }))
    .filter((topic) => topic.title);

const parseCoursePayload = (body = {}) => {
  const rawPayload = body.courseData || body.payload || body;
  const payload = typeof rawPayload === "string" ? JSON.parse(rawPayload) : rawPayload;

  return {
    title: String(payload?.title || body?.title || "").trim(),
    description: String(payload?.description || payload?.des || body?.description || body?.des || "").trim(),
    topics: sanitizeTopics(payload?.topics),
    banner: payload?.banner || body?.banner || null,
    removeBanner: toBoolean(payload?.removeBanner || body?.removeBanner),
  };
};

const normalizeCourse = (course) => {
  if (!course) {
    return null;
  }

  const plainCourse = course.toObject ? course.toObject() : course;
  const topics = plainCourse.topics?.length
    ? sanitizeTopics(plainCourse.topics)
    : buildLegacyTopics(plainCourse.cource_data);

  return {
    ...plainCourse,
    banner: plainCourse.banner || plainCourse.thumbnail || null,
    topics,
    total_stars: plainCourse.total_stars || 0,
    starred_by: Array.isArray(plainCourse.starred_by) ? plainCourse.starred_by : [],
  };
};

const buildCourseSummary = (course) => {
  const normalizedCourse = normalizeCourse(course);
  const topicCount = normalizedCourse.topics.length;
  const subtopicCount = normalizedCourse.topics.reduce(
    (count, topic) => count + topic.subtopics.length,
    0
  );
  const sectionCount = normalizedCourse.topics.reduce(
    (count, topic) =>
      count + topic.subtopics.reduce((subtopicCountTotal, subtopic) => subtopicCountTotal + subtopic.sections.length, 0),
    0
  );

  return {
    _id: normalizedCourse._id,
    title: normalizedCourse.title,
    description: normalizedCourse.description,
    banner: normalizedCourse.banner || null,
    topicCount,
    subtopicCount,
    sectionCount,
    total_stars: normalizedCourse.total_stars || 0,
  };
};

const create_cource = async (req, res) => {
  if (req.USER_ROLE !== "admin") {
    return res.status(401).json({ message: "your not authorize" });
  }

  try {
    const payload = parseCoursePayload(req.body);

    if (!payload.title || !payload.description || payload.topics.length === 0) {
      return res.status(400).json({ message: "Title, description, and at least one topic are required" });
    }

    const banner = req.file || payload.banner || null;

    const newCourse = await cource_Model.create({
      title: payload.title,
      description: payload.description,
      banner,
      thumbnail: banner,
      topics: payload.topics,
      cource_data: null,
      starred_by: [],
      total_stars: 0,
    });

    return res.status(201).json(normalizeCourse(newCourse));
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to create course" });
  }
};

const get_cources = async (req, res) => {
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 9,
    maxLimit: 30,
  });
  const searchTerm = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const filter = searchTerm
    ? {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      }
    : {};

  try {
    const [courses, total] = await Promise.all([
      cource_Model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      cource_Model.countDocuments(filter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: courses.map(buildCourseSummary),
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "courses",
      })
    );
  } catch (err) {
    return res.status(404).json({ message: err.message || "Failed to fetch courses" });
  }
};

const get_single_cources = async (req, res) => {
  const { c_id } = req.params;

  try {
    const course = await cource_Model.findById(c_id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.status(200).json(normalizeCourse(course));
  } catch (err) {
    return res.status(404).json({ message: err.message || "Failed to fetch course" });
  }
};

const update_single_cource = async (req, res) => {
  if (req.USER_ROLE !== "admin") {
    return res.status(401).json({ message: "your not authorize" });
  }

  const { c_id } = req.params;

  try {
    const existingCourse = await cource_Model.findById(c_id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const payload = parseCoursePayload(req.body);

    if (!payload.title || !payload.description || payload.topics.length === 0) {
      return res.status(400).json({ message: "Title, description, and at least one topic are required" });
    }

    const existingBanner = existingCourse.banner || existingCourse.thumbnail || null;
    let nextBanner = existingBanner;

    if (req.file) {
      nextBanner = req.file;
    } else if (payload.removeBanner) {
      nextBanner = null;
    } else if (payload.banner) {
      nextBanner = payload.banner;
    }

    const updatedCourse = await cource_Model.findByIdAndUpdate(
      c_id,
      {
        title: payload.title,
        description: payload.description,
        banner: nextBanner,
        thumbnail: nextBanner,
        topics: payload.topics,
        cource_data: null,
      },
      { new: true, runValidators: true }
    );

    if ((req.file || payload.removeBanner) && existingBanner) {
      try {
        await deleteStoredObject(existingBanner);
      } catch (storageError) {
        console.log("course banner cleanup error", storageError);
      }
    }

    return res.status(200).json(normalizeCourse(updatedCourse));
  } catch (err) {
    return res.status(400).json({ message: err.message || "Failed to update course" });
  }
};

const delete_single_cource = async (req, res) => {
  if (req.USER_ROLE !== "admin") {
    return res.status(401).json({ message: "your not authorize" });
  }

  const { c_id } = req.params;

  try {
    const deletedCourse = await cource_Model.findByIdAndDelete(c_id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    try {
      await deleteStoredObject(deletedCourse.banner || deletedCourse.thumbnail || null);
    } catch (storageError) {
      console.log("course banner delete error", storageError);
    }

    return res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    return res.status(404).json({ message: err.message || "Failed to delete course" });
  }
};

const toggle_course_star = async (req, res) => {
  const { c_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(c_id)) {
    return res.status(404).json({ message: "Course not found" });
  }

  try {
    const course = await cource_Model.findById(c_id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const userId = String(req.USER_ID);
    const hasStarred = course.starred_by.includes(userId);

    if (hasStarred) {
      course.starred_by = course.starred_by.filter((id) => id !== userId);
    } else {
      course.starred_by.push(userId);
    }

    course.total_stars = course.starred_by.length;
    await course.save();

    return res.status(200).json(normalizeCourse(course));
  } catch (error) {
    return res.status(400).json({ message: error?.message || "Failed to update stars" });
  }
};

module.exports = {
  create_cource,
  get_cources,
  get_single_cources,
  update_single_cource,
  delete_single_cource,
  toggle_course_star,
};
