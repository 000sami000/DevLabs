import React, { useState } from 'react'
import { reset_forgot_password } from '../../api'
import Simpleloader from '../Simpleloader'
import { useNavigate } from "react-router-dom";
function Change_password({reset_email_}) {

  const navigate=useNavigate();
    const [passwordobj,setpasswordobj]=useState({password:"",confirmpassword:"",email:reset_email_})
    const [error,seterror]=useState("")
    const [message,setmessage]=useState("")
    const [loading,setloading]=useState(false);
    const submit_handler=async(passwordobj)=>{
        if(!passwordobj.password &&passwordobj.confirmpassword){
           seterror("please fill all fields")
          return 
        }
      try{
            setloading(true);
   console.log(">>>>",loading)
       const {data}=await reset_forgot_password(passwordobj)
       console.log(data)
       setmessage(data.message)
       seterror('')
             setloading(false);
             navigate('/auth')
            }catch(err){
                console.log(err.message)
                seterror(err.message)
                setloading(false);
     }
    }
  return (
    <>    
   
      <div className="w-[400px] m-auto">
   
    
    <br/>
    <div className="text-center text-[white]">Reset password for {reset_email_}</div>
    <br/>
     {
      loading?<div className='flex justify-center'><Simpleloader/></div>:
    <div className="flex flex-col gap-3 w-full ">
      {
        message&&<div className='text-center text-[green]'>{message}</div>
      }
      {
        error&&<div className='text-center text-[red]'>{error}</div>
      }
    <input onChange={(e)=>{setpasswordobj({...passwordobj,password:e.target.value})}} placeholder="Type New Password" type={"password"} className="p-2 rounded-md outline-none"/>
    <input onChange={(e)=>{setpasswordobj({...passwordobj,confirmpassword:e.target.value})}} placeholder="Confirm Password" type={"password"}  className="p-2 rounded-md outline-none"/>
    
    <div  onClick={()=>{if(passwordobj.password && passwordobj.confirmpassword){submit_handler(passwordobj)}}} className="mt-3 flex justify-end"><button className="bg-[orange] px-2 py-1 rounded-md text-[white]">Change</button></div>
    </div>
     }
    
     </div>
     </>

  )
}

export default Change_password

