import { create_solution,get_solutions ,delete_solution,update_solution,approve_solution} from "../Slices/solutionSlice";
import * as api from "../../api"
export const createSolution=(id,solutionObj)=>{

 
    return async(dispatch)=>{
        try
        {
            console.log(id,solutionObj)
           const {data}=await api.createSolution(id,solutionObj)
        //    console.log("data---:",data)
           dispatch(create_solution(data)) 
        }
        catch(err)
        {
          console.log("createSolution err---",err)
        }
    }

}

export const getSolution=(id)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.fetchSolution(id);
        //    console.log("data---:",data)
           dispatch(get_solutions(data)) 
        }
        catch(err)
        {
            console.log("getSolution err---",err)
        }
    }

}
export const deleteSolution=(s_id)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.deleteSolution(s_id);
        //    console.log("data---:",data)
           dispatch(delete_solution(data)) 
        }
        catch(err)
        {
            console.log("deleteSolution err---",err)
        }
    }

}

export const updateSolution=(s_id,sol_obj)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.updateSolution(s_id,sol_obj);
        //    console.log("data---:",data)
           dispatch(update_solution(data)) 
        }
        catch(err)
        {
            console.log("updateSolution err---",err)
        }
    }

}
export const voteSolution=(s_id,sol_obj)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.voting(s_id,sol_obj);
        //    console.log("data---:",data)
           dispatch(update_solution(data)) 
        }
        catch(err)
        {
            console.log("updateSolution err---",err)
        }
    }

}
export const saveSolution=(s_id)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.save_solution(s_id);
        //    console.log("data---:",data)
           dispatch(update_solution(data)) 
        }
        catch(err)
        {
            console.log("updateSolution err---",err)
        }
    }

}
export const approveSolution=(s_id)=>{

    return async(dispatch)=>{
        try
        {
           const {data}=await api.approve_solution(s_id);
        //    console.log("data---:",data)
           dispatch(approve_solution(data)) 
        }
        catch(err)
        {
            console.log("updateSolution err---",err)
        }
    }

}