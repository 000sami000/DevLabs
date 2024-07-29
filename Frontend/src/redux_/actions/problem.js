import {
  create_problem,
  get_problems,
  get_Single_problem,
  delete_problem,
  like_problem,
  search_problem,
  approve_problem
} from "../Slices/problemSlice";
import * as api from "../../api";

export const createProblem = (problemObj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.createProblem(problemObj);
      //    console.log("data---:",data)
      dispatch(create_problem(data));
    } catch (err) {
      console.log("createProblem err---", err);
    }
  };
};
export const getProblems = (selected) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetchProblem(selected);
      //    console.log("data---:",data)
      dispatch(get_problems(data));
    } catch (err) {
      console.log("getProblems err---", err);
    }
  };
};
export const getSingleproblem = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetch_single_problem(p_id);
      console.log("data---:", data);
      dispatch(get_Single_problem(data));
    } catch (err) {
      console.log("getgetSinglepost err---", err);
    }
  };
};
export const deleteProblem = (p_id, navigate) => {
  return async (dispatch) => {
    try {
      const { data } = await api.delete_problem(p_id);

      console.log("data---:", data);
      dispatch(delete_problem(data));
      navigate("/");
    } catch (err) {
      console.log("deleteProblem err---", err);
    }
  };
};
export const likeProblem = (p_id) => {
  return async (dispatch) => {
    try {
      const { data } = await api.likeproblem(p_id);

      console.log("data---:", data);
      dispatch(like_problem(data));
   
    } catch (err) {
      console.log("likeProblem err---", err);
    }
  };
};

export const search_problem_data = ( inputval) => {
  return async (dispatch) => {
    try {

        console.log("???????",inputval)
        if(typeof(inputval)==="object"){
          const { data } = await api.search_problem(inputval);
    
          dispatch(search_problem(data));
        }else{
          const { data } = await api.search_problem(inputval.trim());
          dispatch(search_problem(data));

        }
      
    } catch (err) {
      console.log("search_data_by_title---err", err);
    }
  };
};

export const approveProblem=(s_id)=>{

  return async(dispatch)=>{
      try
      {
         const {data}=await api.approve_problem(s_id);
      //    console.log("data---:",data)
         dispatch(approve_problem(data))
         window.location.reload() 
      }
      catch(err)
      {
          console.log("updateSolution err---",err)
      }
  }

}