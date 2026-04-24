import API from "./client";

export const createComment = (commentobj) => {
  return API.post("/comment/", commentobj, { withCredentials: true });
};

export const fetchComment = (type_id_, page = 0, limit = 10) => {
  return API.get(`/comment/${type_id_}?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const updateComment = (c_id, c_obj) => {
  return API.patch(`/comment/${c_id}`, c_obj, { withCredentials: true });
};

export const deleteComment = (c_id) => {
  return API.delete(`/comment/${c_id}`, { withCredentials: true });
};
