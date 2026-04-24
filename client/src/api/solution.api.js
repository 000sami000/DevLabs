import API from "./client";

export const createSolution = (id, solutionobj) => {
  return API.post(`/solution/${id}`, solutionobj, { withCredentials: true });
};

export const fetchSolution = (id, page = 0, limit = 5) => {
  return API.get(`/solution/${id}?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const updateSolution = (id, solutionObj) => {
  return API.patch(`/solution/${id}`, solutionObj, { withCredentials: true });
};

export const deleteSolution = (id) => {
  return API.delete(`/solution/${id}`);
};

export const voting = (s_id, solutionobj) => {
  return API.patch(`/solution/voting/${s_id}`, solutionobj, { withCredentials: true });
};

export const save_solution = (s_id) => {
  return API.patch(`/solution/save/${s_id}`, {}, { withCredentials: true });
};

export const approve_solution = (s_id) => {
  return API.patch(`/solution/approve/${s_id}`, {}, { withCredentials: true });
};
