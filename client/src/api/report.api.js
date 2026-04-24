import API from "./client";

export const createReport = (reportobj) => {
  return API.post("/report/", reportobj, { withCredentials: true });
};

export const fetch_reports = (report_type) => {
  return API.get(`/report?report_type=${report_type}`, { withCredentials: true });
};

export const delete_reports = (id, report_type) => {
  return API.delete(`/report/${id}?report_type=${report_type}`, { withCredentials: true });
};
