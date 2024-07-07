import { createSlice } from "@reduxjs/toolkit";
const initialState={
    single_recent_post:{},
    problems:[]
}
export const problemSlice=createSlice({
   name:"problem_",
   initialState,
   reducers:{
    create_problem:(state,action)=>{
      console.log("create_problem action",action)
      state.problems.unshift(action.payload)

    },
    get_problems:(state,action)=>{
      console.log("get_problem action",action)
        return  {...state,problems:action.payload}
    },
    get_Single_problem:(state,action)=>{
      console.log("get_single_post action",action)
      return {...state,single_recent_post:action.payload};
    },
    delete_problem:(state,action)=>{
      return {...state,problems:state.problems.filter((itm)=>(itm._id!==action.payload._id))};
    }
   }
   
})
export const {create_problem,get_problems,get_Single_problem,delete_problem}=problemSlice.actions;
export default problemSlice.reducer;