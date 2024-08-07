import { createSlice } from "@reduxjs/toolkit";
const initialState={
    single_recent_post:{},
    problems:[],
    total:0,
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
        return  {...state,problems:action.payload.problems,total:action.payload.total}
    },
    get_Single_problem:(state,action)=>{
      console.log("get_single_post action",action)
      return {...state,single_recent_post:action.payload};
    },
    like_problem:(state,action)=>{
      
      return  {...state,problems:state.problems.map((itm)=> (itm._id===action.payload._id?action.payload:itm))};
    },
    delete_problem:(state,action)=>{
      return {...state,problems:state.problems.filter((itm)=>(itm._id!==action.payload._id))};
    },
    search_problem:(state,action)=>{
      return {...state,problems:action.payload.problems,total:action.payload.total}
    },
    approve_problem:(state,action )=>{
      //   let s=state.solutions.filter((itm)=>(itm._id!==action.payload._id));
      //  state.solutions=s;
      console.log("approve_solution action",action)
        return {...state,single_recent_post:action.payload}
          
      }
   }
   
})
export const {create_problem,get_problems,get_Single_problem,delete_problem,like_problem,search_problem,approve_problem}=problemSlice.actions;
export default problemSlice.reducer;