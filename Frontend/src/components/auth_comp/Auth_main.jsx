import React, { useEffect, useState } from 'react'
import { useNavigate ,useLocation} from 'react-router-dom';
import { useForm } from "react-hook-form"
import { colors } from '../..';
 import { useDispatch,useSelector } from 'react-redux';
import { signIn, signUp } from '../../redux_/actions/user';
import Simpleloader from '../Simpleloader';
import { erase_error } from '../../redux_/Slices/userSlice';

function Auth_main() {
  let location=useLocation();
  let navigate=useNavigate();
  let dispatch=useDispatch();
  let {loading,error}=useSelector((state)=>state.userReducer)
  
  console.log(error?error:"no error")
  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm()


 console.log("=====>>",error)
  // let initialdata={
  //  name:"",
  //  username:"",
  //   email:"",
  //   password:"",
  //   confirmpassword:"",
  // }
     const [IsSignup,setIsSignup]=useState(false);
     
    // const [Formdata,setFormdata]=useState(initialdata)


     
      const submit_handler=(data)=>{
        dispatch(erase_error())
        console.log("submit handler")
        if(IsSignup){
          console.log(data);
          dispatch(signUp(data,setIsSignup))
          dispatch(erase_error())
          reset()
          }else{
            
            dispatch(signIn(data,navigate))
          
        }
      }
    const handlechange=()=>{}
    
      const forgotpassword_handler=()=>{
        console.log("forgotpassword_handler")
        dispatch(erase_error())
        navigate("/auth/forgotpassword")
  
      }
     
  let style="  w-[100%] white outline-none p-[2px] pl-2 pr-2 bg-[#ffffff] rounded-[7px] "

    return (
  
      <div className='w-[32%]  bg-[#2a2a2a] rounded-lg shadow-lg m-auto mt-[8%] p-7'>
        
     
        <div className='w-full  flex justify-center p-1'>   
            <div className="text-[27px]">
              <span className="text-[#ff964c]">&lt;</span>
              <span className="text-[#f9f9f9]">DevLabs</span>
              <span className="text-[#ff964c]">&gt;</span>
        
             
            </div>
        </div>
        <div className='text-center text-[red] flex justify-center'>{error?error:""}{loading&&<Simpleloader/>}</div>
           <div className='flex flex-col w-full h-[80%]  '>
             <form onSubmit={handleSubmit(submit_handler)} noValidate>
               {
               IsSignup && (
               <div className='flex flex-col  '>
               
               <label className={`text-[${colors.white}] flex justify-between items-center`} htmlFor='name'><span >Name</span> <span className='text-[red] px-2 text-[12px]'>{errors.name?.message}</span></label>
                <input {...register("name",{required:{value:true,message:"Name is required"}})} className={style} id="name" onChange={handlechange} type={'text'} name={'name'} placeholder={'Enter Your Name'}  label={"Name"}/>
                <label className={`text-[${colors.white}] flex justify-between items-center`} htmlFor='username'><span >Username</span> <span className='text-[red] px-2 text-[12px]'>{errors.username?.message}</span></label>
                <input  {...register("username",{required:"username is required"})} className={style} id='username' onChange={handlechange} type={'text'} name={'username'} placeholder={'Enter username'}  label={"Username"}/>
               </div>)
                }
                
                <label className={`text-[${colors.white}] flex justify-between items-center`} htmlFor='email'><span >Email</span> <span className='text-[red] px-2 text-[12px]'>{errors.email?.message}</span></label>
                <input   {...register("email", {
            required: "Email is required",
            pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Invalid email address"
            }
          })} className={style}  id='email' onChange={handlechange} type={'email'} name={'email'} placeholder={'Enter your Email'}  label={"Email"}/>
                <label className={`text-[${colors.white}] flex justify-between items-center`} htmlFor='password'><span >Password</span> <span className='text-[red] px-2 text-[12px]'>{errors.password?.message}</span></label>
               <input {...register("password",{required:"password is required", minLength: {
      value: 8,
      message: "Password must be at least 8 characters long"
    },
    maxLength: {
      value: 20,
      message: "Password cannot exceed 20 characters"
    }},)}  className={style+"mb-2"} id='password' onChange={handlechange} type={'password'} name={'password'} placeholder={'Enter the Password'}  label={"Password"}/>
                
                {
                  IsSignup&&
                  <input {...register("confirmpassword",{required:"confirm the password",})} className={style+"mt-1"} onChange={handlechange} type={'password'} name={'confirmpassword'} placeholder={'Confirm Password'} label={"Confirm Password"}/>
                }
               
                <div className='mt-3'>
                 {IsSignup?(
                    <span className={`text-[${colors.white}]`}>Have an account ?<b onClick={()=>{dispatch(erase_error()); setIsSignup(false);clearErrors(["name", "password","email","username"]); reset();  }} className='cursor-pointer'>Sign in</b></span> 
                 ): <span className='flex justify-between items-center'><span className={`text-[${colors.white}]`}>Don't have an account ?  <b onClick={()=>{dispatch(erase_error());setIsSignup(true);clearErrors(["name", "password","email","username"]); reset();}} className='cursor-pointer'>Sign up</b></span><span className={`text-[${colors.white}] text-[13px] cursor-pointer`} onClick={forgotpassword_handler}>Forgot Password</span></span>
                 }
                </div>
                <br/>
                <div className='flex justify-center'>
  
                <button type='submit'  disabled={loading} className='bg-[#ff964c] text-[#fffbfb] rounded-md py-1 px-2 '>{IsSignup?"Sign up":"Sign in" }</button>
                </div>
                </form>
         
           </div>
        </div>
            
   
  
    )
  }
  export default Auth_main