import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sol_loading: false,
  solutions: [],
  total: 0,
  page: 0,
  limit: 5,
};

export const solutionSlice = createSlice({
  name: "solution_",
  initialState,
  reducers: {
    create_solution: (state, action) => {
      state.solutions.unshift(action.payload);
      state.total += 1;
    },
    get_solutions: (state, action) => {
      const payload = action.payload || {};
      const nextSolutions = Array.isArray(payload.solutions)
        ? payload.solutions
        : Array.isArray(payload)
          ? payload
          : [];

      state.solutions = nextSolutions;
      state.total = Number(payload.total) || nextSolutions.length;
      state.page = Number(payload.page) || 0;
      state.limit = Number(payload.limit) || state.limit;
    },
    delete_solution: (state, action) => {
      state.solutions = state.solutions.filter((itm) => itm._id !== action.payload._id);
      state.total = Math.max(0, state.total - 1);
    },
    update_solution: (state, action) => {
      state.solutions = state.solutions.map((itm) => (itm._id === action.payload._id ? action.payload : itm));
    },
    approve_solution: (state, action) => {
      state.solutions = state.solutions.map((itm) => (itm._id === action.payload._id ? action.payload : itm));
    },
  },
});

export const {
  create_solution,
  get_solutions,
  delete_solution,
  update_solution,
  approve_solution,
} = solutionSlice.actions;
export default solutionSlice.reducer;
