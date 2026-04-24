const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const article_Model = require("./article.model");
const {
  ArticleServiceError,
  buildCreatePayload,
  buildNotification,
  buildUpdatePayload,
  deleteFileFromMinio,
  deleteStoredThumbnail,
  escapeRegex,
  getCreatorDetails,
  normalizeTags,
  notifyAdmins,
} = require("./article.service");
const {
  buildPaginatedResponse,
  getPaginationFromQuery,
  paginateArray,
} = require("../../utils/pagination");

const handleArticleError = (res, error, fallbackMessage) => {
  if (error instanceof ArticleServiceError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ message: fallbackMessage });
};

const resolveArticleVisibilityFilter = (req) => {
  const baseFilter = { isDraft: { $ne: true } };
  const token = req.cookies?.access_token;

  if (!token) {
    return { ...baseFilter, isApproved: true };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.role === "admin" ? baseFilter : { ...baseFilter, isApproved: true };
  } catch (error) {
    return { ...baseFilter, isApproved: true };
  }
};

const getTagOverlap = (candidateTags = [], queryTags = []) => {
  const normalizedCandidate = new Set(
    (Array.isArray(candidateTags) ? candidateTags : [])
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean)
  );

  return queryTags.reduce(
    (count, tag) => count + (normalizedCandidate.has(tag) ? 1 : 0),
    0
  );
};

const create_article = async (req, res) => {
  try {
    if (!req.USER_ID) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const creator = await getCreatorDetails(req.USER_ID);
    const payload = buildCreatePayload(req.body, creator, req.file);
    const new_article = await article_Model.create(payload);

    if (!new_article.isDraft) {
      await notifyAdmins(buildNotification("article_create", new_article, creator));
    }

    return res.status(201).json(new_article);
  } catch (error) {
    return handleArticleError(res, error, "Failed to create article");
  }
};

const search_article = async (req, res) => {
  const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const tags = normalizeTags(req.query.tags).map((tag) => String(tag).toLowerCase());
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 5,
    maxLimit: 40,
  });

  try {
    const visibilityFilter = resolveArticleVisibilityFilter(req);

    if (tags.length > 0) {
      const tagFilter = {
        ...visibilityFilter,
        tags: {
          $in: tags.map((tag) => new RegExp(escapeRegex(tag), "i")),
        },
      };

      const excludedId = String(req.query.excludeId || "");
      const rows = await article_Model.find(tagFilter).lean();

      const rankedRows = rows
        .filter((item) => (excludedId ? String(item?._id) !== excludedId : true))
        .map((item) => {
          const overlap = getTagOverlap(item?.tags, tags);
          const likes = Array.isArray(item?.likes) ? item.likes.length : 0;
          const recency = new Date(item?.createdAt || 0).getTime();

          return {
            ...item,
            __overlap: overlap,
            __score: overlap * 100 + likes * 2 + recency / 1_000_000_000,
          };
        })
        .filter((item) => item.__overlap > 0)
        .sort((left, right) => right.__score - left.__score);

      const pagedRows = paginateArray(rankedRows, pagination).map((item) => {
        const next = { ...item };
        delete next.__overlap;
        delete next.__score;
        return next;
      });

      return res.status(200).json(
        buildPaginatedResponse({
          items: pagedRows,
          total: rankedRows.length,
          page: pagination.page,
          limit: pagination.limit,
          pageBase: pagination.pageBase,
          itemKey: "article",
        })
      );
    }

    const filter = { ...visibilityFilter };
    if (rawQuery) {
      filter.title = new RegExp(escapeRegex(rawQuery), "i");
    }

    const [article, total] = await Promise.all([
      article_Model
        .find(filter)
        .sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      article_Model.countDocuments(filter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: article,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "article",
      })
    );
  } catch (error) {
    return handleArticleError(res, error, "Failed to search articles");
  }
};

const update_article = async (req, res) => {
  const { a_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).send("No article with that id");
  }

  try {
    const article = await article_Model.findById(a_id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    if (!req.USER_ID) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const isOwner = String(article.creator_id) === String(req.USER_ID);
    const isAdmin = req.USER_ROLE === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const actor = await getCreatorDetails(req.USER_ID);
    const editor = isOwner ? actor : null;
    const payload = buildUpdatePayload({
      body: req.body,
      article,
      thumbnail: req.file || null,
      editor,
    });

    const updated_art = await article_Model.findByIdAndUpdate(a_id, payload, {
      new: true,
      runValidators: true,
    });

    if (req.file && article.thumbnail) {
      await deleteStoredThumbnail(article.thumbnail);
    }

    if (!updated_art.isDraft) {
      await notifyAdmins(buildNotification("article_update", updated_art, actor));
    }

    return res.status(200).json(updated_art);
  } catch (error) {
    return handleArticleError(res, error, "Failed to update article");
  }
};

const get_articles = async (req, res) => {
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 5,
    maxLimit: 30,
  });

  try {
    const filter = resolveArticleVisibilityFilter(req);

    const [articles, total] = await Promise.all([
      article_Model
        .find(filter)
        .sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      article_Model.countDocuments(filter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: articles,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "articles",
      })
    );
  } catch (error) {
    return handleArticleError(res, error, "Failed to fetch articles");
  }
};

const get_user_drafts = async (req, res) => {
  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 8,
    maxLimit: 30,
  });

  const searchQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const searchRegex = searchQuery ? new RegExp(searchQuery.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&"), "i") : null;

  try {
    const filter = {
      creator_id: String(req.USER_ID),
      isDraft: true,
    };

    if (searchRegex) {
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const [drafts, total] = await Promise.all([
      article_Model
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      article_Model.countDocuments(filter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: drafts,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "drafts",
      })
    );
  } catch (error) {
    return handleArticleError(res, error, "Failed to load drafts");
  }
};

const get_single_article = async (req, res) => {
  const { a_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).json({ message: "Invalid article id" });
  }

  try {
    const article = await article_Model.findById(a_id).lean();

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    if (article.isDraft || !article.isApproved) {
      const { access_token } = req.cookies || {};

      if (!access_token) {
        return res.status(404).json({ message: "Article not found" });
      }

      let decoded = null;
      try {
        decoded = jwt.verify(access_token, process.env.JWT_SECRET);
      } catch (tokenError) {
        return res.status(404).json({ message: "Article not found" });
      }

      const canView = decoded.role === "admin" || String(decoded.id) === String(article.creator_id);

      if (!canView) {
        return res.status(404).json({ message: "Article not found" });
      }
    }


    return res.status(200).json(article);
  } catch (error) {
    return handleArticleError(res, error, "Failed to fetch article");
  }
};

const update_article_like = async (req, res) => {
  const { a_id } = req.params;
  const voteType = String(req.body?.vote || "").toLowerCase();

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).send("No Article with this id");
  }

  if (voteType !== "like" && voteType !== "dislike") {
    return res.status(400).json({ message: "vote must be 'like' or 'dislike'" });
  }

  try {
    const article = await article_Model.findById(a_id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const userId = String(req.USER_ID);
    const hasLiked = article.likes.includes(userId);
    const hasDisliked = article.dislikes.includes(userId);

    if (voteType === "like") {
      if (hasLiked) {
        article.likes = article.likes.filter((id) => id !== userId);
      } else {
        article.likes.push(userId);
      }

      if (hasDisliked) {
        article.dislikes = article.dislikes.filter((id) => id !== userId);
      }
    } else {
      if (hasDisliked) {
        article.dislikes = article.dislikes.filter((id) => id !== userId);
      } else {
        article.dislikes.push(userId);
      }

      if (hasLiked) {
        article.likes = article.likes.filter((id) => id !== userId);
      }
    }

    const updatedarticle = await article.save();
    return res.status(200).json(updatedarticle);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const saved_article = async (req, res) => {
  const { a_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).send("No Article with this id");
  }

  try {
    const article = await article_Model.findById(a_id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const saveindex = article.saved_art_by.findIndex((id) => id === String(req.USER_ID));

    if (saveindex === -1) {
      article.saved_art_by.push(req.USER_ID);
    } else {
      article.saved_art_by = article.saved_art_by.filter((id) => id !== req.USER_ID);
    }

    const updatedarticle = await article.save();
    return res.status(200).json(updatedarticle);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const delete_article = async (req, res) => {
  const { a_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).send("No article with that id");
  }

  try {
    const article = await article_Model.findById(a_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    await deleteStoredThumbnail(article.thumbnail);
    await article_Model.findByIdAndDelete(a_id);
    return res.status(200).json({ message: "Article and its thumbnail deleted successfully" });
  } catch (err) {
    return handleArticleError(res, err, "Failed to delete article");
  }
};

const upload_article_image = async (req, res) => {
  try {
    if (!req.USER_ID) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    return res.status(200).json({ filePath: req.file.url, file: req.file });
  } catch (error) {
    return handleArticleError(res, error, "Failed to upload article image");
  }
};

const delete_article_image = async (req, res) => {
  try {
    if (!req.USER_ID) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ message: "No file path provided" });
    }

    await deleteFileFromMinio(filePath);
    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    return handleArticleError(res, error, "Failed to delete article image");
  }
};

const approve_article = async (req, res) => {
  const { a_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(a_id)) {
    return res.status(404).send("No Article with this id");
  }

  if (req.USER_ROLE !== "admin") {
    return res.status(401).send("Only admin can approve the article");
  }

  try {
    const article = await article_Model.findById(a_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    article.isApproved = !article.isApproved;
    const updatedarticle = await article.save();

    return res.status(200).json(updatedarticle);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

module.exports = {
  create_article,
  get_articles,
  update_article_like,
  get_user_drafts,
  get_single_article,
  saved_article,
  update_article,
  delete_article,
  upload_article_image,
  delete_article_image,
  search_article,
  approve_article,
};







