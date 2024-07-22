import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdAddBox } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { useSelector,useDispatch } from "react-redux";
import Loader from "../../Loader";
import { fetch_userArticles, fetch_userProblemspublic,  fetch_userSolutionspublic,  user_profilepublic } from "../../../api";
import { getUser } from "../../../redux_/actions/user";
import { useParams } from "react-router-dom";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { formatDate } from "date-fns";
function User_public() {
  const {id}=useParams()
 
  // console.log("temp_data)))",temp_data)
  let user=useSelector((state)=>state.userReducer.current_user)
  const [loading,setloading]=useState(false)
  const [error,seterror]=useState(null);
     const navigate=useNavigate();
   const [Selected, setSelected]=useState('problem')
  const [Profile_info, setProfile_info] = useState({});
   const [userdata,setuserdata]=useState(null);
  const  fetch_userdata = async (id) => {
    try {
      setloading(true);
      seterror(false);
      let data_;
      if(Selected=='problem'){
        let { data } = await fetch_userProblemspublic(id);
        
         data_=data;
      }
      else if(Selected=='article'){
        let { data } = await fetch_userArticles();
       data_=data;
      }
      else if(Selected=='solution'){
        let { data } = await fetch_userSolutionspublic(id);
        console.log("sol---",data)
       data_=data;
      }
      
      if (Array.isArray(data_)) {
        setuserdata(data_);
        console.log(">>",data_)
      
      } else {
        setuserdata([]);
      }
      setloading(false);
      
      // console.log(data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  }
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
  useEffect(()=>{
   
    fetch_profile(id)
    fetch_userdata(id)
  },[id])
  
  console.log(user)


  return (
    <>
    {
   error==null?
      <>
      {
  loading ?<div className="h-full flex justify-center items-center "> <Loader/></div>: 
    
    <div className="mt-[5%] bg-[white]  w-[60%] m-auto p-5 rounded-md pt-10">
    4654
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
          {Profile_info.profile?.experience?Profile_info.profile.experience : <div>No Experience to Show</div>} 
        </div>
        <div>
          <div className="font-bold">Education</div>
          { Profile_info.profile?.education?.length>0 ?
            Profile_info.profile?.education?.map((itm,i) => (
            <div key={itm+i}>{itm}</div>
          )):<div>Nothing to show</div>}
        </div>
        <div>
          <div className="font-bold">Projects</div>
          {
            Profile_info.profile?.project?.length>0?
            Profile_info.profile?.project.map((itm,i) => (
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
            Profile_info.profile?.skills?.length>0?
            Profile_info.profile?.skills.map((itm,i) => (
            <li key={itm+i}>{itm}</li>
          ))
          :<div> No Skills to Show</div>
          }
        </div>
      </div>
    
    </div>
      }
    </>
    :<div className="text-center text-[red] text-[25px]">{error?.message}</div>
    }
     <br/>
     <div className="w-[85%] h-[500px] bg-[#525252] m-auto">
     <div className="flex gap-7 justify-around p-3">
      <div className="bg-[#E5661F] w-[25%] text-center text-[20px] rounded-md p-2 cursor-pointer text-[white] hover:bg-[gray]" onClick={()=>{if(Selected!=="problem"){setSelected('problem');fetch_userdata(id)}}}>Problems <span className="bg-[#ffffff94] p-1 rounded-md text-[green]">{userdata?.length}</span></div>
      <div className="bg-[#7E7777] w-[25%] text-center text-[20px] rounded-md p-2 cursor-pointer text-[white] hover:bg-[#787878]" onClick={()=>{if(Selected!=="soution"){setSelected('solution');fetch_userdata(id)}}}>Solutions</div>
      <div className="bg-[#88EF8C] w-[25%] text-center text-[20px] rounded-md p-2 cursor-pointer text-[white] hover:bg-[gray]" onClick={()=>{setSelected('article')}}>Articles</div>

     </div>
     <br/>
      <div className="p-2 px-4 flex flex-col gap-2">
         {
          userdata?.map((itm)=>{
            return      <div key={itm._id} onClick={()=>{navigate(`/problem/${itm._id}/sols`)}} className="bg-[#888888e6] cursor-pointer hover:bg-[#dbdbdb] p-2 flex justify-between items-center rounded-[10px]">
           
           <div className=" w-[70%] break-words font-semibold">{itm.title}</div>
           <div className="flex w-[30%] justify-between">
           <div className="bg-[orange] text-center  px-2 whitespace-nowrap  rounded-[4px]">
           {/* {itm?.createdAt&&formatDate(itm?.createdAt)} */}
           </div>
           <div className="bg-[orange] w-[25%] text-center  px-2 text-[#6a6a6a] rounded-[4px]">
           {itm.total_sol.length}
           </div>
           </div>
       </div>
          })
         }
        
      </div>
      
     </div>
    </>
  );
}

export default User_public;
