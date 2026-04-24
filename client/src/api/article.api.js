import API from "./client";

const buildArticleRequest = (articleObj = {}) => {
  const {
    file,
    title = "",
    description = "",
    article_content = null,
    tags = [],
    isActive = true,
    isDraft = false,
  } = articleObj;

  const hasValidFile = Boolean(
    file &&
    typeof file === "object" &&
    typeof file.size === "number" &&
    file.size > 0 &&
    typeof file.name === "string"
  );

  if (!hasValidFile) {
    return {
      data: {
        title,
        description,
        article_content,
        tags,
        isActive,
        isDraft,
      },
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  const formData = new FormData();
  formData.append("title", String(title));
  formData.append("description", String(description));
  formData.append(
    "article_content",
    typeof article_content === "string" ? article_content : JSON.stringify(article_content)
  );
  formData.append("tags", JSON.stringify(Array.isArray(tags) ? tags : []));
  formData.append("isActive", String(Boolean(isActive)));
  formData.append("isDraft", String(Boolean(isDraft)));
  formData.append("file", file);

  return {
    data: formData,
  };
};

export const createArticle = (articleObj) => {
  const request = buildArticleRequest(articleObj);
  const config = { withCredentials: true };

  if (request.headers) {
    config.headers = request.headers;
  }

  return API.post(`/article/`, request.data, config);
};

export const imgUpload = (formData) => {
  return API.post(`/article/img_upload`, formData, {
    withCredentials: true,
  });
};

export const imgDelete = (filePath) => {
  return API.post(`/article/delete_image`, filePath, {
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const fetchArticle = (selected = 0, limit = 5) => {
  return API.get(`/article?page=${selected}&limit=${limit}`, { withCredentials: true });
};

export const fetch_user_drafts = ({ page = 0, limit = 8, q = "" } = {}) => {
  return API.get(`/article/drafts/me?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`, { withCredentials: true });
};

export const search_article = (query, options = {}) => {
  const page = Number(options.page ?? 0);
  const limit = Number(options.limit ?? 5);
  const excludeId = options.excludeId ? `&excludeId=${options.excludeId}` : "";

  if (typeof query === "object") {
    return API.get(`/article/search?tags=${query}&page=${page}&limit=${limit}${excludeId}`);
  }

  return API.get(`/article/search?q=${encodeURIComponent(query || "")}&page=${page}&limit=${limit}`);
};

export const fetch_single_article = (a_id) => {
  return API.get(`/article/${a_id}`, { withCredentials: true });
};

export const delete_article = (a_id) => {
  return API.delete(`/article/${a_id}`);
};

export const update_article = (a_id, articleObj) => {
  const request = buildArticleRequest(articleObj);
  const config = { withCredentials: true };

  if (request.headers) {
    config.headers = request.headers;
  }

  return API.patch(`/article/${a_id}`, request.data, config);
};

export const like_article = (a_id) => {
  return API.patch(`/article/${a_id}/reaction`, { vote: "like" }, { withCredentials: true });
};

export const dislike_article = (a_id) => {
  return API.patch(`/article/${a_id}/reaction`, { vote: "dislike" }, { withCredentials: true });
};

export const save_article = (a_id) => {
  return API.patch(`/article/save/${a_id}`, {}, { withCredentials: true });
};

export const approve_article = (a_id) => {
  return API.patch(`/article/approve/${a_id}`, {}, { withCredentials: true });
};
