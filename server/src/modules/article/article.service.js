const user_Model = require("../user/user.model");
const { createNotificationForRole } = require("../notification/notification.service");
const { uploadPublicStream, deleteStoredObject } = require("../../utils/objectStorage");

class ArticleServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ArticleServiceError";
    this.statusCode = statusCode;
  }
}

const parseMaybeJson = (value, fallback = null) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const sanitizeText = (value = "") => String(value).trim();

const normalizeTags = (rawTags) => {
  const parsed = parseMaybeJson(rawTags, []);
  const tags = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "string"
      ? parsed.split(",")
      : [];

  return [...new Set(tags.map((tag) => sanitizeText(tag)).filter(Boolean))];
};

const normalizeBoolean = (value, fallback = true) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return fallback;
};

const normalizeArticleContent = (rawContent) => parseMaybeJson(rawContent, null);

const ensureArticleContent = (articleContent) => {
  if (!articleContent) {
    throw new ArticleServiceError("Article content is required", 400);
  }

  return articleContent;
};

const getCreatorDetails = async (userId) => {
  const creator = await user_Model
    .findById(userId)
    .select("_id name username profile_img_")
    .lean();

  if (!creator) {
    throw new ArticleServiceError("Creator not found", 404);
  }

  return creator;
};

const buildCreatePayload = (body, creator, thumbnail) => {
  const isDraft = normalizeBoolean(body.isDraft, false);
  const title = sanitizeText(body.title);
  const description = sanitizeText(body.description);
  const normalizedContent = normalizeArticleContent(body.article_content);
  const article_content = isDraft ? (normalizedContent || null) : ensureArticleContent(normalizedContent);

  if (!isDraft && !title) {
    throw new ArticleServiceError("Title is required", 400);
  }

  if (!isDraft && !description) {
    throw new ArticleServiceError("Description is required", 400);
  }

  return {
    title: title || (isDraft ? "Untitled draft" : title),
    description,
    article_content,
    tags: normalizeTags(body.tags),
    isActive: normalizeBoolean(body.isActive, true),
    isDraft,
    creator_id: String(creator._id),
    creator_name: creator.name || creator.username || "",
    creator_username: creator.username,
    profile_img_: creator.profile_img_ || null,
    thumbnail: thumbnail || null,
  };
};

const buildUpdatePayload = ({ body, article, thumbnail, editor }) => {
  const nextIsDraft = body.isDraft !== undefined
    ? normalizeBoolean(body.isDraft, article.isDraft)
    : Boolean(article.isDraft);

  const nextTitle = body.title !== undefined ? sanitizeText(body.title) : sanitizeText(article.title);
  const nextDescription = body.description !== undefined ? sanitizeText(body.description) : sanitizeText(article.description);
  const nextContent = body.article_content !== undefined
    ? normalizeArticleContent(body.article_content)
    : article.article_content;

  if (!nextIsDraft && !nextTitle) {
    throw new ArticleServiceError("Title is required", 400);
  }

  if (!nextIsDraft && !nextDescription) {
    throw new ArticleServiceError("Description is required", 400);
  }

  if (!nextIsDraft) {
    ensureArticleContent(nextContent);
  }

  return {
    title: nextTitle || (nextIsDraft ? "Untitled draft" : nextTitle),
    description: nextDescription,
    article_content: nextContent || null,
    tags: body.tags !== undefined ? normalizeTags(body.tags) : article.tags,
    isActive: body.isActive !== undefined ? normalizeBoolean(body.isActive, article.isActive) : article.isActive,
    isDraft: nextIsDraft,
    creator_name: editor?.name || article.creator_name || article.creator_username || "",
    profile_img_: editor?.profile_img_ || article.profile_img_ || null,
    thumbnail: thumbnail || article.thumbnail,
  };
};

const buildNotification = (type, article, actor = null) => ({
  notific_id: `${article._id}-${type}-${Date.now()}`,
  notifi_type: type,
  content_title: article.title,
  article_id: article._id,
  creator_username: article.creator_username,
  creator_id: article.creator_id,
  actor_id: String(actor?._id || article.creator_id),
  actor_name: actor?.name || actor?.username || article.creator_username,
  actor_username: actor?.username || article.creator_username,
  actor_profile_img_: actor?.profile_img_ || article.profile_img_ || null,
  createdAt: new Date(),
});

const notifyAdmins = async (notification) => {
  await createNotificationForRole("admin", notification);
};

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = {
  ArticleServiceError,
  buildCreatePayload,
  buildNotification,
  buildUpdatePayload,
  deleteFileFromMinio: deleteStoredObject,
  deleteStoredThumbnail: deleteStoredObject,
  escapeRegex,
  getCreatorDetails,
  normalizeTags,
  notifyAdmins,
  uploadFileToMinio: uploadPublicStream,
};








