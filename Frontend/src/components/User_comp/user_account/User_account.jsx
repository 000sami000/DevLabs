import React, { useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import { IoCloseCircle } from "react-icons/io5";
import { deleteUser, updateUser } from "../../../redux_/actions/user";
function User_account() {
  const navigate=useNavigate()
  const [edit,setedit]=useState(false); 
  // let userlocalstorage = JSON.parse(localStorage.getItem("profile_"));
    const user=useSelector((state)=>state.userReducer.current_user)
    const [temp_user,settemp_user]=useState(user);
    // console.log(user)
    const [isopen,setisopen]=useState(false)
    const dispatch=useDispatch();

    const [password,setpassword]=useState({password:"",confirmpassword:""})
  return (
    <div className='mt-[3%]'>
    <div className='absolute top-[-45px] rounded-[50%]'>
          <img src='/default_profile.jpg' width={"14%"} className='rounded-[50%] shadow-[20px] '/>
         </div>
         <br />
         <hr className="h-[4px] bg-[white] rounded-[2px]" />
      <br />
         <div className="flex justify-end">
          <button className="bg-[gray] px-4 rounded-lg" onClick={()=>setedit((prev)=>!prev)}>Edit</button>
         </div>
         <br/>
         <div className="flex flex-col gap-2">

         <div>
         <label className="block " htmlFor="username">Username:</label>
         <input onChange={(e)=>{settemp_user((prev)=>({...prev,username:e.target.value}))}} id="username" className='text-[14px] w-[250px] p-1 rounded-md outline-none' placeholder='Enter the username' value={temp_user.username} disabled={!edit}/>
         </div>
         <div>
         <label  className="block "htmlFor="name">Name:</label>
         <input onChange={(e)=>{console.log(temp_user);settemp_user((prev)=>({...prev,name:e.target.value}))}}  id="name" className='text-[14px] w-[250px] p-1 rounded-md outline-none' placeholder='Enter your full name' value={temp_user.name} disabled={!edit}/>
         </div>
         </div>

         <div  className="flex justify-between gap-2 items-end h-[50px]" >
         <div className="flex gap-3 text-[white]">
         <button onClick={()=>{dispatch(updateUser(temp_user))}} className="bg-[#575757] px-2 py-1 rounded-lg" disabled={temp_user.name===user.name && temp_user.username===user.username}>Save Changes</button>
         <button onClick={()=>{dispatch(deleteUser(navigate))}} className="bg-[#575757] px-2 py-1 rounded-lg text-[red]" >Delete Account</button>
         <button onClick={()=>{setisopen((prev)=>!prev)}} className="bg-[#575757] px-2 py-1 rounded-lg">Change Password</button>
         </div>
        
         </div>
         <Modal
          isOpen={ isopen }
      // onRequestClose={() => setEditwindow(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgb(185, 185, 185 )',

        },
      }}>
      <div className="w-[400px]">
      <div className="flex justify-end"> <IoCloseCircle className="text-[25px] text-[white]" onClick={()=>{setisopen((prev)=>!prev)}}/>
      </div>
      <br/>
      <div className="text-center">Reset your password</div>
      <br/>
      <div className="flex flex-col gap-3">
        
<input placeholder="Type New Password" type={"password"} className="p-2 rounded-md outline-none"/>
<input placeholder="Confirm Password" type={"password"}  className="p-2 rounded-md outline-none"/>

<div className="mt-3 flex justify-end"><button className="bg-[orange] px-2 py-1 rounded-md text-[white]">Change</button></div>
      </div>

       </div>
       </Modal>
   </div>
  );
}

export default User_account;
