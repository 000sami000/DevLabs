import {
  create_solution,
  get_solutions,
  delete_solution,
  update_solution,
  approve_solution,
} from "../Slices/solutionSlice";
import * as api from "../../api";

export const createSolution = (id, solutionObj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.createSolution(id, solutionObj);
      dispatch(create_solution(data));
      return data;
    } catch (err) {
      console.log("createSolution err---", err);
      throw err;
    }
  };
};

export const getSolution = (id, page = 0, limit = 5) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetchSolution(id, page, limit);
      dispatch(get_solutions(data));
      return data;
    } catch (err) {
      console.log("getSolution err---", err);
      throw err;
    }
  };
};

export const deleteSolution = (s_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.deleteSolution(s_id);
      dispatch(delete_solution(data));
      return data;
    } catch (err) {
      console.log("deleteSolution err---", err);
      throw err;
    }
  };
};

export const updateSolution = (s_id, sol_obj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.updateSolution(s_id, sol_obj);
      dispatch(update_solution(data));
      return data;
    } catch (err) {
      console.log("updateSolution err---", err);
      throw err;
    }
  };
};

export const voteSolution = (s_id, sol_obj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.voting(s_id, sol_obj);
      dispatch(update_solution(data));
      return data;
    } catch (err) {
      console.log("voteSolution err---", err);
      throw err;
    }
  };
};

export const saveSolution = (s_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.save_solution(s_id);
      dispatch(update_solution(data));
      return data;
    } catch (err) {
      console.log("saveSolution err---", err);
      throw err;
    }
  };
};

export const approveSolution = (s_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.approve_solution(s_id);
      dispatch(approve_solution(data));
      return data;
    } catch (err) {
      console.log("approveSolution err---", err);
      throw err;
    }
  };
};
