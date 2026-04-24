import API from "./client";

export const fetch_whiteboards = () => {
  return API.get(`/whiteboard`, { withCredentials: true });
};

export const fetch_whiteboard = (w_id) => {
  return API.get(`/whiteboard/${w_id}`, { withCredentials: true });
};

export const create_whiteboard = (payload = {}) => {
  return API.post(`/whiteboard`, payload, { withCredentials: true });
};

export const update_whiteboard = (w_id, payload) => {
  return API.patch(`/whiteboard/${w_id}`, payload, { withCredentials: true });
};

export const delete_whiteboard = (w_id) => {
  return API.delete(`/whiteboard/${w_id}`, { withCredentials: true });
};
