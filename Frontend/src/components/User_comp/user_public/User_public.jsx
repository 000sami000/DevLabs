import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdAddBox } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { useSelector,useDispatch } from "react-redux";
import Loader from "../../Loader";
import { block_user, fetch_userArticles, fetch_userProblemspublic,  fetch_userSolutionspublic,  user_profilepublic } from "../../../api";
import { getUser } from "../../../redux_/actions/user";
import { useParams } from "react-router-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
// import { formatDate } from "date-fns";
import {formatDate} from "../../formateDate"
function User_public() {
  const {id}=useParams()
 
  // console.log("temp_data)))",temp_data)
  let user=useSelector((state)=>state.userReducer.current_user)
  const [loading,setloading]=useState(false)
  const [error,seterror]=useState(null);
     const navigate=useNavigate();
   const [Selected, setSelected]=useState('problem')
  const [Profile_info, setProfile_info] = useState(null);


  const fetch_profile=async(id)=>{
    try{
      setloading(true)
      let {data}=await user_profilepublic(id)
      console.log("dataaaa",data)
        setProfile_info(data)
        // settemp_data(data);
        setloading(false)
         console.log("\|||||",Profile_info)
    }catch(err){
     seterror(err)
     console.log("profile--errr",err)
     
    }
  }
  const user_block=async(id)=>{
    try{
      setloading(true)
      let {data}=await block_user(id)
      console.log("dataaaa",data)
        setProfile_info(data)
        // settemp_data(data);
        setloading(false)
         console.log("\|||||",Profile_info)
    }catch(err){
     seterror(err)
     console.log("profile--errr",err)
     
    }
  }
  useEffect(()=>{
   
    fetch_profile(id)
   
  },[id])
  
  // console.log(user)


  return (
    <>
    {
   error===null?
      <>
      {
  loading ?<div className="h-full flex justify-center items-center "> <Loader/></div>: <>
      <div className="mt-[2%] flex justify-end gap-5 px-[4%]">
      {
        user&&user?.role==="admin" && user?._id!==Profile_info?._id&&
        <>{
       !Profile_info?.isblock?
        <button onClick={()=>{user_block(id)}} className="bg-[#343434] text-[red] rounded-md text-[16px] p-1">Block</button>:
      <button onClick={()=>{user_block(id)}} className="bg-[#343434] text-[red] rounded-md text-[16px] p-1">UnBlock</button>
      }</>}
      </div>
    <div className="mt-[5%] bg-[white]  w-[60%] m-auto p-5 rounded-md pt-10">

    <div className="w-[100%] flex  justify-center">  
      <div  className='w-[80px] absolute top-[13%] h-[80px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${Profile_info?.profile_img_?`http://localhost:3000/${Profile_info?.profile_img_?.destination}/${Profile_info?.profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
    </div>

       <div>
        <div>
          <strong>{Profile_info?.name}</strong>
        </div>
        <div>
          <strong>Email:</strong>
          { " "+Profile_info?.email}
        </div>
        <br />
        <div>
          <div className="font-bold">Experience</div>
          {Profile_info?.profile?.experience?Profile_info.profile.experience : <div>No Experience to Show</div>} 
        </div>
        <div>
          <div className="font-bold">Education</div>
          { Profile_info?.profile?.education?.length>0 ?
            Profile_info?.profile?.education?.map((itm,i) => (
            <div key={itm+i}>{itm}</div>
          )):<div>Nothing to show</div>}
        </div>
        <div>
          <div className="font-bold">Projects</div>
          {
            Profile_info?.profile?.project?.length>0?
            Profile_info?.profile?.project.map((itm,i) => (
            <div key={itm.Project_title+i}>
              <li>{itm.Project_title}</li>
              <div>{itm.Project_exp}</div>
            </div>
          )):<div>No Projects to Show </div>
          
          }
        </div>
        <div>
          <div className="font-bold">Skills</div>
          {
            Profile_info?.profile?.skills?.length>0?
            Profile_info?.profile?.skills.map((itm,i) => (
            <li key={itm+i}>{itm}</li>
          ))
          :<div> No Skills to Show</div>
          }
        </div>
      </div>
    
    </div>
    </>
      }
    </>
    :<div className="text-center text-[red] text-[25px]">{error?.message}</div>
    }
     <br/>
    
   
      

    </>
  );
}

export default User_public;
