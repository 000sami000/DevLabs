import {
  create_problem,
  get_problems,
  get_Single_problem,
  delete_problem,
  like_problem,
  search_problem,
  approve_problem,
} from "../Slices/problemSlice";
import * as api from "../../api";

export const createProblem = (problemObj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.createProblem(problemObj);
      dispatch(create_problem(data));
      return data;
    } catch (err) {
      console.log("createProblem err---", err);
      throw err;
    }
  };
};

export const getProblems = (selected = 0, limit = 5) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetchProblem(selected, limit);
      dispatch(get_problems(data));
      return data;
    } catch (err) {
      console.log("getProblems err---", err);
      throw err;
    }
  };
};

export const getSingleproblem = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetch_single_problem(p_id);
      dispatch(get_Single_problem(data));
      return data;
    } catch (err) {
      console.log("getSingleproblem err---", err);
      throw err;
    }
  };
};

export const deleteProblem = (p_id, navigate) => {
  return async (dispatch) => {
    try {
      const { data } = await api.delete_problem(p_id);
      dispatch(delete_problem(data));

      if (typeof navigate === "function") {
        navigate("/");
      }

      return data;
    } catch (err) {
      console.log("deleteProblem err---", err);
      throw err;
    }
  };
};

export const likeProblem = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.likeproblem(p_id);
      dispatch(like_problem(data));
      return data;
    } catch (err) {
      console.log("likeProblem err---", err);
      throw err;
    }
  };
};

export const search_problem_data = (inputval, options = {}) => {
  return async (dispatch) => {
    try {
      const trimmed = typeof inputval === "string" ? inputval.trim() : inputval;
      const { data } = await api.search_problem(trimmed, options);
      dispatch(search_problem(data));
      return data;
    } catch (err) {
      console.log("search_data_by_title---err", err);
      throw err;
    }
  };
};

export const approveProblem = (s_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.approve_problem(s_id);
      dispatch(approve_problem(data));
      return data;
    } catch (err) {
      console.log("approveProblem err---", err);
      throw err;
    }
  };
};

export const saveProblem = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.save_problem(p_id);
      dispatch(like_problem(data));
      return data;
    } catch (err) {
      console.log("saveProblem err---", err);
      throw err;
    }
  };
};

export const toggleProblemSolved = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.solved_problem(p_id);
      dispatch(like_problem(data));
      return data;
    } catch (err) {
      console.log("toggleProblemSolved err---", err);
      throw err;
    }
  };
};
