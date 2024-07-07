import React, { useEffect,useState ,useRef} from "react";







function User_account() {
  
  // let userlocalstorage = JSON.parse(localStorage.getItem("profile_"));
  
  return (
    <div className='mt-[3%]'>
    <div className='absolute top-[-45px] rounded-[50%]'>
          <img src='/default_profile.jpg' width={"14%"} className='rounded-[50%] shadow-[20px] '/>
         </div>
         <br />
         <hr className="h-[4px] bg-[white] rounded-[2px]" />
      <br />
         <div className="flex justify-end">
          <button className="bg-[gray] px-4 rounded-lg">Edit</button>
         </div>
         <br/>
         <div className="flex flex-col gap-2">
         <div>
         <label  className="block " htmlFor="email">Email:</label>
         <input id="email" className='text-[14px] w-[250px] p-1 rounded-md outline-none' placeholder='Enter the email' value={"tim@gmail.com"} disabled={true}/>
         </div>
         <div>
         <label className="block " htmlFor="username">Username:</label>
         <input  id="username" className='text-[14px] w-[250px] p-1 rounded-md outline-none' placeholder='Enter the username' value={"tim101"} disabled={true}/>
         </div>
         <div>
         <label  className="block "htmlFor="name">Name:</label>
         <input   id="name" className='text-[14px] w-[250px] p-1 rounded-md outline-none' placeholder='Enter your full name' value={"timcook"} disabled={true}/>
         </div>
         </div>

         <div  className="flex justify-between gap-2 items-end h-[50px]" >
         <div className="flex gap-3">
         <button className="bg-[gray] px-4 rounded-lg">Delete Account</button>
         <button className="bg-[gray] px-4 rounded-lg">Change Password</button>
         </div>
         <div>
         <button className="bg-[gray] px-4 rounded-lg">Logout</button>
         </div>
         </div>
   </div>
  );
}

export default User_account;
