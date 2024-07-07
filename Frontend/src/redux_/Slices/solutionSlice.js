import { createSlice } from "@reduxjs/toolkit";

const initialState={
    sol_loading:false,
    solutions:[]
}

export const solutionSlice=createSlice({
   name:"solution_",
   initialState,
   reducers:{
    create_solution:(state,action)=>{
        console.log("create_solution action",action)
        // return {...state,solutions: [...state.solutions,action.payload]}
      state.solutions.unshift(action.payload)
      },
      get_solutions:(state,action)=>{
        console.log("get_solutions action",action)
          return  {...state,solutions:action.payload}
      },
      delete_solution:(state,action )=>{
      //   let s=state.solutions.filter((itm)=>(itm._id!==action.payload._id));
      //  state.solutions=s;
      console.log("delete_solution action",action)
        return {...state,solutions:state.solutions.filter((itm)=>(itm._id!==action.payload._id))};
      },
      update_solution:(state,action )=>{
        //   let s=state.solutions.filter((itm)=>(itm._id!==action.payload._id));
        //  state.solutions=s;
        console.log("update_solution action",action)
          return {...state,solutions:state.solutions.map((itm)=> (itm._id===action.payload._id?action.payload:itm))}
            
        }
   }

})
export const {create_solution,get_solutions,delete_solution,update_solution}=solutionSlice.actions;
export default solutionSlice.reducer;