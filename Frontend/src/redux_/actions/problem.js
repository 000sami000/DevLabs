

import { create_problem ,get_problems,get_Single_problem,delete_problem} from "../Slices/problemSlice"
import * as api from "../../api"

;

export const createProblem=(problemObj)=>{

 
    return async(dispatch)=>{
        try
        {
           const {data}=await api.createProblem(problemObj)
        //    console.log("data---:",data)
           dispatch(create_problem(data)) 
        }
        catch(err)
        {
          console.log("createProblem err---",err)
        }
    }

}
export const getProblems=(selected)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.fetchProblem(selected);
        //    console.log("data---:",data)
           dispatch(get_problems(data)) 
        }
        catch(err)
        {
            console.log("getProblems err---",err)
        }
    }

}
export const getSingleproblem=(p_id)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.fetch_single_problem(p_id);
           console.log("data---:",data)
           dispatch(get_Single_problem(data)) 
        }
        catch(err)
        {
            console.log("getgetSinglepost err---",err)
        }
    }

}
export const deleteProblem=(p_id,navigate)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.delete_problem(p_id);
        
           console.log("data---:",data)
           dispatch(delete_problem(data)) 
           navigate('/')
        
        }
        catch(err)
        {
            console.log("deleteProblem err---",err)
        }
    }

}