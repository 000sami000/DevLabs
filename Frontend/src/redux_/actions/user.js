import axios from "axios"
import {auth_start,auth_success,auth_failure,get_user,get_user_unauth, update_user, deleteuser} from "../Slices/userSlice";
import * as api from "../../api"
// import { useNavigate } from "react-router-dom";
// const navigate=useNavigate();

export const signIn=(userobj,navigate)=>{

 
    return async(dispatch)=>{
        try
        {
              dispatch(auth_start())
           const {data}=await api.signin(userobj)
           dispatch(auth_success(data));
        //    console.log("data---:",data)
            navigate("/")
            window.location.reload()
        }
        catch(err)
        {  
        
            dispatch(auth_failure(err.response.data.message))
            console.log(">>>>>",err.response.data.message)
          console.log("signIn err---",err)
        }
    }

}
export const signUp=(userobj,setIsSignup)=>{

 
    return async(dispatch)=>{
        try
        {
              dispatch(auth_start())
           const {data}=await api.signup(userobj)
           dispatch(auth_success(data));
        //    console.log("data---:",data)
            setIsSignup(false)
        }
        catch(err)
        {
        //    if(err.response.data.message) 
        dispatch(auth_failure(
            err.response.data.message
        ))
          console.log("signUp err---",err)
        }
    }
}
export const getUser=()=>{
    return async(dispatch)=>{
        try{
         const {data}=await api.get_authentic_user()
         console.log("get_data}}",data)
         dispatch(get_user(data))
        }catch(err){
            dispatch(get_user_unauth(err.code))
            console.log("get_user err---",err)

        }
    }
}

export const updateUser=(user_obj)=>{
    console.log("/////////++",user_obj)
    return async(dispatch)=>{
        try{
         const {data}=await api.update_user(user_obj)
         console.log("get_data}}",data)
         dispatch(update_user(data))
        }catch(err){
            dispatch(get_user_unauth(err.code))
            console.log("get_user err---",err)

        }
    }
}
export const deleteUser=(navigate)=>{
    return async(dispatch)=>{
        try{
         const {data}=await api.delete_user()
         console.log("get_data}}",data)
         dispatch(deleteuser(data))
         navigate('/')
        }catch(err){
            dispatch(get_user_unauth(err.code))
            console.log("get_user err---",err)

        }
    }
}