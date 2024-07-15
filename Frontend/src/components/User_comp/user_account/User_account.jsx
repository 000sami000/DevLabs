import React, { useState,useRef } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';
import { IoCloseCircle } from "react-icons/io5";
import { deleteUser, updateUser } from "../../../redux_/actions/user";
import { change_password } from "../../../api";
import { MdAddPhotoAlternate } from "react-icons/md";
function User_account() {
  const navigate=useNavigate()
  const [edit,setedit]=useState(false); 
  // let userlocalstorage = JSON.parse(localStorage.getItem("profile_"));
    const user=useSelector((state)=>state.userReducer.current_user)
    const [temp_user,settemp_user]=useState(user);
    const fileInputRef = useRef(null);
    const [imageUrl,setimageUrl]=useState('')
    // console.log(user)
    const [isopen,setisopen]=useState(false)
    const dispatch=useDispatch();

    const [passwordobj,setpasswordobj]=useState({password:"",confirmpassword:""})

  const [Error,setError]=useState('');
  const [Success,setSuccess]=useState('');
  const [File,setFile]=useState(null)
  const [deletemenu,setdeletemenu]=useState(false)
    const handlesubmit=async()=>{
      if(passwordobj.password===''||passwordobj.confirmpassword===''){
        setError("both fields are required")
        return;
      }
      if(passwordobj.password<8||passwordobj.confirmpassword<8){
        setError("Password must be 8 digit long")
        return;
      }
      if(passwordobj.password!==passwordobj.confirmpassword){
        setError("Password and Confirm password are Different")
        return;
      }

      try{
          
        const {data}=await change_password(passwordobj)
        console.log("tthjkhjkhkhlk:",data)
        setSuccess(data.message)
      }catch(err){
        console.log("Change password error:",err)
      }
    }


    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Handle the selected file (e.g., upload it, display it, etc.)
        console.log(File);
        setimageUrl(URL.createObjectURL(file))
       setFile(file)
      //  settemp_user((prev)=>({...prev,profile_img_:File}))
      }
    };
    const handleImageClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };
  
  return (
    <div className='mt-[3%]'>
    <div className='absolute top-[-45px] rounded-[50%]'>
          <div onClick={handleImageClick} className='w-[80px] h-[80px] rounded-[100%] shadow-[20px] cursor-pointer hover:w-[85px]  hover:h-[85px]  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${!imageUrl&&`http://localhost:3000/${temp_user?.profile_img_?.destination}/${temp_user?.profile_img_?.filename}`||imageUrl||`/default_profile.jpg`})` }}>
             <span className="w-full h-full hover:bg-[#7979792b] flex justify-center items-center rounded-[100%]"><MdAddPhotoAlternate  className="text-[25px] block text-[#ffffffc6]   "/></span>   
          </div>
          <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handleFileChange}
      />
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
         <button onClick={()=>{dispatch(updateUser({...temp_user,file:File}))}} className="bg-[#575757] px-2 py-1 rounded-lg" disabled={temp_user.name===user.name && temp_user.username===user.username}>Save Changes</button>
         <button onClick={()=>{ setdeletemenu(true);setisopen((prev)=>!prev) }} className="bg-[#575757] px-2 py-1 rounded-lg text-[red]" >Delete Account</button>
         <button onClick={()=>{setisopen((prev)=>!prev);setdeletemenu(false);}} className="bg-[#575757] px-2 py-1 rounded-lg">Change Password</button>
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
      { 
          deletemenu?(      <div className="w-[400px]">
      <div className="flex justify-end"> <IoCloseCircle className="text-[25px] text-[white]" onClick={()=>{setisopen((prev)=>!prev)}}/>
      </div>
      <br/>
      <div className="text-center">Are sure about deleting this account</div>
      <br/>
      <div className="flex flex-col gap-3">
        


<div onClick={()=>{dispatch(deleteUser(navigate));}} className="mt-3 flex justify-end"><button className="bg-[orange] px-2 py-1 rounded-md text-[white]">Delete</button></div>
      </div>

       </div>):(
        <div className="w-[400px]">
      <div className="flex justify-end"> <IoCloseCircle className="text-[25px] text-[white]" onClick={()=>{setisopen((prev)=>!prev)}}/>
      </div>
      <br/>
      <div className="text-center">Reset your password</div>
      <br/>
      <div className="flex flex-col gap-3">
        
<input onChange={(e)=>{setpasswordobj({...passwordobj,password:e.target.value})}} placeholder="Type New Password" type={"password"} className="p-2 rounded-md outline-none"/>
<input onChange={(e)=>{setpasswordobj({...passwordobj,confirmpassword:e.target.value})}} placeholder="Confirm Password" type={"password"}  className="p-2 rounded-md outline-none"/>

<div onClick={handlesubmit} className="mt-3 flex justify-end"><button className="bg-[orange] px-2 py-1 rounded-md text-[white]">Change</button></div>
      </div>

       </div>)
      }
     
       </Modal>
   </div>
  );
}

export default User_account;
