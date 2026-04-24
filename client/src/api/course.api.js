import API from "./client";

const buildCourseFormData = (courseObj = {}) => {
  const payload = { ...(courseObj || {}) };
  const bannerFile = payload.bannerFile || null;
  delete payload.bannerFile;

  const formData = new FormData();
  formData.append("courseData", JSON.stringify(payload));

  if (bannerFile) {
    formData.append("banner", bannerFile);
  }

  return formData;
};

export const get_all_cources = (page = 0, limit = 9, q = "") => {
  const query = `page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`;
  return API.get(`/cource?${query}`);
};

export const fetch_single_cource = (c_id) => {
  return API.get(`/cource/${c_id}`);
};

export const create_cource = (courseObj) => {
  const formData = buildCourseFormData(courseObj);
  return API.post('/cource', formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const update_cource = (c_id, courseObj) => {
  const formData = buildCourseFormData(courseObj);
  return API.patch(`/cource/${c_id}`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const toggle_cource_star = (c_id) => {
  return API.patch(`/cource/${c_id}/star`, {}, { withCredentials: true });
};

export const delete_single_cource = (c_id) => {
  return API.delete(`/cource/${c_id}`, { withCredentials: true });
};
