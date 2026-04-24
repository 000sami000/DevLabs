import API from "./client";

export const fetchProblem = (selected = 0, limit = 5) => {
  return API.get(`/problem?page=${selected}&limit=${limit}`, { withCredentials: true });
};

export const search_problem = (query, options = {}) => {
  const page = Number(options.page ?? 0);
  const limit = Number(options.limit ?? 5);

  if (typeof query === "object") {
    return API.get(`/problem/search?tags=${query}&page=${page}&limit=${limit}`);
  }

  return API.get(`/problem/search?q=${query}&page=${page}&limit=${limit}`);
};

export const createProblem = (problemobj) => {
  return API.post(`/problem`, problemobj, { withCredentials: true });
};

export const fetch_single_problem = (id) => {
  return API.get(`/problem/${id}`, { withCredentials: true });
};

export const delete_problem = (id) => {
  return API.delete(`/problem/${id}`);
};

export const likeproblem = (p_id) => {
  return API.patch(`/problem/likeproblem/${p_id}`, {}, { withCredentials: true });
};

export const approve_problem = (p_id) => {
  return API.patch(`/problem/approve/${p_id}`, {}, { withCredentials: true });
};

export const save_problem = (p_id) => {
  return API.patch(`/problem/save/${p_id}`, {}, { withCredentials: true });
};


export const solved_problem = (p_id) => {
  return API.patch(`/problem/solved/${p_id}`, {}, { withCredentials: true });
};


