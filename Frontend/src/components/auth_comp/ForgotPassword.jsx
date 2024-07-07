import React, { useState } from "react";
import OTPInput from "./OTPInput";
import { colors } from "../..";
import { verifyemail ,verify_otp} from "../../api";

function ForgotPassword() {
  
const [Showotp,setShowotp]=useState(false);
const [Email,setEmail]=useState("");
const [Otp,setOtp]=useState("");
 const [Emailerror,setEmailerror]=useState(""); 
 const [Otperror,setOtperror]=useState(""); 


 const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };


  const otpchangehandler=(val)=>{
    setOtp(val);
    console.log("pppppp",val)
  }
  const email_submit_handler =async () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    if(Email===''){
        setEmailerror('Email is Required')
        return;
        }
    if(!validateEmail(Email)){
        setEmailerror('Enter a valid email')
        return;
    }
        setEmailerror('');
      try{

        const {data}= await verifyemail({email:Email})
        console.log("forgot res :",data);
        setShowotp(true);   
      }catch(err){
        setEmailerror(err?.response?.data.message)
         console.log(err)
      }
    //Code
        
  };
  const submit_handler = async()=>{
  if(Otp===""){
    setOtperror("Enter Otp");
    return;
  }
  try{
   const {data}=await verify_otp({otp:Otp})
  }catch(err){
    console.log("otp verifying err",err)
  }
  console.log("////?",Otp)

  setOtperror("");
  //code
  }
  let style =
    "  w-[100%] white outline-none p-[2px] pl-2 pr-2 bg-[#ffffff] rounded-[7px] ";
 
  return (
    <div className="w-[40%]  bg-[#2a2a2a] rounded-lg shadow-lg m-auto mt-[8%] p-7 ">
      <div className="w-full  flex justify-center p-1 mb-[2%]">
        <div className="text-[27px]">
          <span className="text-[#ff964c]">&lt;</span>
          <span className="text-[#f9f9f9]">DevLabs</span>
          <span className="text-[#ff964c]">&gt;</span>
        </div>
      </div>
      <div className="mb-[2%] h-3 ">
        <div className="text-[red] w-full px-2 text-[12px] text-center">
                  {Emailerror||""}
                </div>
      </div>
        
          <div  className={`flex gap-1 ${Showotp?"hidden":"block"}`}>
            <div className="flex flex-col w-[80%]">
              <label
                className={`text-[${colors.white}] flex justify-between items-center`}
                htmlFor="email"
              >
                <span>Email</span>{" "}
              
              </label>
              <input
                className={style}
               onChange={(e)=>{ setEmailerror(''); setEmail(e.target.value)}}
                id="email"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <button
             onClick={email_submit_handler}
              className="bg-[#ff964c] text-[#fffbfb] rounded-md py-[2px] px-2  self-end w-[20%]"
            >
              Verify
            </button>
          </div>
        
    
    <div className={`${Showotp?"block":"hidden"}`}>
          {/* <div className={`flex gap-1`}>
            <div className="flex flex-col w-[80%]">
              <label
                className={`text-[${colors.white}] flex justify-between items-center`}
                htmlFor="otp"
              >
                <span>OTP</span>{" "}
                <span className="text-[red] px-2 text-[12px]">
                  {Otperror||""}
                </span>
              </label>
              <input
                className={style}
                onChange={otpchangehandler}
                id="otp"
              />
            </div>
            <button
  onClick={submit_handler}
              className="bg-[#ff964c] text-[#fffbfb] rounded-md  px-2  py-[2px]  self-end w-[20%]"
            >
              Submit
            </button>
          </div> */}
          <OTPInput  length={6} onChange={otpchangehandler} />
          <button
  onClick={submit_handler}
              className="bg-[#ff964c] text-[#fffbfb] rounded-md  px-2  py-[2px]  self-end w-[20%]"
            >
              Submit
            </button>
          </div>
    
    </div>
  );
}

export default ForgotPassword;
