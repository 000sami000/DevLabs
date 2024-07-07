import axios from "axios"
import {auth_start,auth_success,auth_failure,get_user,get_user_unauth} from "../Slices/userSlice";
import * as api from "../../api"

export const signIn=(userobj,navigate)=>{

 
    return async(dispatch)=>{
        try
        {
              dispatch(auth_start())
           const {data}=await api.signin(userobj)
           dispatch(auth_success(data));
        //    console.log("data---:",data)
            navigate("/")
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