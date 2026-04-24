import API from "./client";

export const fetch_userskills = () => {
  return API.get(`user/getuserskills`, { withCredentials: true });
};

export const block_user = (id) => {
  return API.patch(`user/blockuser/${id}`, {}, { withCredentials: true });
};

export const fetch_userProfile = (id) => {
  return API.get(`user/userprofile/${id}`, { withCredentials: true });
};

export const fetch_userNotifications = (page = 0, limit = 10) => {
  return API.get(`user/usernotifications?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const delete_userNotifications = (id, clear) => {
  if (clear) {
    return API.delete(`user/usernotifications?clear=true`, { withCredentials: true });
  }

  return API.delete(`user/usernotifications/${id}`, { withCredentials: true });
};

export const fetch_savedItems = ({ page = 0, limit = 10, type = "all", q = "" } = {}) => {
  const query = `page=${page}&limit=${limit}&type=${type}&q=${encodeURIComponent(q)}`;
  return API.get(`user/saveditems?${query}`, { withCredentials: true });
};

export const user_profilepublic = (id) => {
  return API.get(`user/userprofilepublic/${id}`);
};

export const fetch_admin_user_overview = (id, { range = "month", start = "", end = "" } = {}) => {
  const query = `range=${encodeURIComponent(range)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  return API.get(`user/adminoverview/${id}?${query}`, { withCredentials: true });
};

export const fetch_userAnalytics = (id, { range = "month", start = "", end = "" } = {}) => {
  const query = `range=${encodeURIComponent(range)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  return API.get(`user/analytics/${id}?${query}`, { withCredentials: true });
};

export const fetch_userProblemspublic = (id, { page = 0, limit = 6, q = "" } = {}) => {
  return API.get(`user/userproblemspublic/${id}?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
};

export const fetch_userArticlespublic = (id, { page = 0, limit = 6, q = "" } = {}) => {
  return API.get(`user/userarticlespublic/${id}?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
};

export const fetch_userSolutionspublic = (id, { page = 0, limit = 6, q = "" } = {}) => {
  return API.get(`user/usersolutionspublic/${id}?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`);
};

export const fetch_all_users = (users_type, searchterm) => {
  if (searchterm !== '') {
    return API.get(`user/allusers?q=${users_type}&searchterm=${searchterm}`, { withCredentials: true });
  }

  return API.get(`user/allusers?q=${users_type}`, { withCredentials: true });
};

export const update_userProfile = (id, profile_obj) => {
  return API.patch(`user/userprofile/${id}`, profile_obj, { withCredentials: true });
};

export const fetch_userProblems = (id, Searchterm) => {
  if (Searchterm !== '' && Searchterm !== undefined) {
    return API.get(`user/userproblems/${id}?searchterm=${Searchterm}`, { withCredentials: true });
  }

  return API.get(`user/userproblems/${id}`, { withCredentials: true });
};

export const fetch_allProblems = (Searchterm) => {
  if (Searchterm !== '') {
    return API.get(`user/userallproblems?searchterm=${Searchterm}`, { withCredentials: true });
  }

  return API.get(`user/userallproblems`, { withCredentials: true });
};

export const search_userProblems = (query) => {
  return API.get(`user/searchuserproblems?q=${query}`, { withCredentials: true });
};

export const fetch_userArticles = () => {
  return API.get(`user/userarticles`, { withCredentials: true });
};

export const fetch_allArticles = () => {
  return API.get(`user/userallarticles`, { withCredentials: true });
};

export const search_allArticles = (query) => {
  return API.get(`user/searchuserallarticles?q=${query}`, { withCredentials: true });
};

export const fetch_savedArticles = (page = 0, limit = 10) => {
  return API.get(`user/savedarticles?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const search_userArticles = (query) => {
  return API.get(`user/searchuserarticles?q=${query}`, { withCredentials: true });
};

export const search_savedArticles = (query, page = 0, limit = 10) => {
  return API.get(`user/searchsavedarticles?q=${query}&page=${page}&limit=${limit}`, { withCredentials: true });
};

export const fetch_userSolutions = () => {
  return API.get(`user/usersolution`, { withCredentials: true });
};

export const fetch_allSolutions = (Searchterm) => {
  if (Searchterm !== '') {
    return API.get(`user/userallsolutions?searchterm=${Searchterm}`, { withCredentials: true });
  }

  return API.get(`user/userallsolutions`, { withCredentials: true });
};

export const fetch_savedSolutions = (page = 0, limit = 10) => {
  return API.get(`user/savedsolution?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const search_userSolution = (query) => {
  return API.get(`user/searchusersolution?q=${query}`, { withCredentials: true });
};

export const search_savedSolution = (query, page = 0, limit = 10) => {
  return API.get(`user/searchsavedsolution?q=${query}&page=${page}&limit=${limit}`, { withCredentials: true });
};

export const update_user = (user_obj) => {
  return API.patch(`user/changeuser`, user_obj, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const change_password = (user_obj) => {
  return API.patch(`user/changepassword`, user_obj, { withCredentials: true });
};

export const delete_user = () => {
  return API.delete(`user/deleteuser`, { withCredentials: true });
};

export const fetch_savedProblems = (page = 0, limit = 10) => {
  return API.get(`user/savedproblems?page=${page}&limit=${limit}`, { withCredentials: true });
};

export const search_savedProblems = (query, page = 0, limit = 10) => {
  return API.get(`user/searchsavedproblems?q=${query}&page=${page}&limit=${limit}`, { withCredentials: true });
};






