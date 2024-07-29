import React, { useEffect, useState } from "react";

import { IoCloseOutline, IoSearchSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa6";
import { delete_reports, fetch_allSolutions, fetch_reports, fetch_savedSolutions, fetch_userSolutions, search_savedSolution, search_userSolution } from "../../../api";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { IoBanOutline } from "react-icons/io5";
import Loader from "../../Loader";
import { FcApproval } from "react-icons/fc";
import { formatDistanceToNow } from "date-fns";
import {formatNumber} from "../../format_num"
function Admin_report() {
  const { id } = useParams();
  let navigate=useNavigate();
  const [Selected, setSelected] = useState("problem");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [Reports, setReports] = useState([]);

 
  let user = useSelector((state) => state.userReducer.current_user);
  
  const get_report = async (report_type) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_reports(report_type);
      if (Array.isArray(data)) {
        setReports(data);
        
      } else {
        setReports([]);
      }
      setloading(false);
      
      console.log("jkljlkjlk",data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
const delete_report=async(id,report_type)=>{
  try {
    setloading(true);
    seterror(false);
    let { data } = await delete_reports(id,report_type);
    if (Array.isArray(data)) {
      setReports(data);
      
    } else {
      setReports([]);
    }
    setloading(false);
    
    console.log("jkljlkjlk",data);
  } catch (err) {
    setloading(false);
     seterror(err.massage)
    console.log("userArticle-- error", err);
  }
}



  useEffect(() => {
    if(user._id===id){

        get_report(Selected);
    }

  }, [id]);
  
  
  return (
    <div className=" max-h-[500px]">
    <div className="flex justify-between ">
      
      <div className="flex gap-2">
        <button onClick={()=>{setSelected("problem"); get_report(Selected)}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="problem"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Problem Reports</button>
        <button onClick={()=>{setSelected("solution"); get_report(Selected)}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="solution"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Solution Reports</button>
        <button onClick={()=>{setSelected("article"); get_report(Selected)}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="article"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Articles Reports </button>
        <button onClick={()=>{setSelected("comment"); get_report(Selected)}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="comment"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Comment Reports </button>
      </div>
   
    </div>

    <br />

    <hr className="h-[4px] bg-[white] rounded-[2px]" />
    <br />
    
    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-visible">
    {
      loading?<div className="flex justify-center "><Loader/></div>:
  Reports.length>0? Reports.map((itm)=>(
   
   <div className="bg-[#959595aa] p-2 rounded-md shadow-sm" >
      <div className="flex justify-between"> <div><span onClick={()=>navigate(`/user_overview/${itm.reporter_id}`)} className=" italic hover:bg-[white] cursor-pointer p-1 rounded-sm">
      <span className=" font-semibold">{itm.reporter_username}</span></span> reported {itm.report_type} of <span className=" italic hover:bg-[white] p-1 rounded-sm cursor-pointer font-semibold" onClick={()=>navigate(`/user_overview/${itm.content_creator_id}`)}>{itm.content_creator_username}</span>&nbsp; <span className=" font-bold cursor-pointer" onClick={()=>{
    if(itm.report_type=='problem'){
      navigate(`/problem/${itm.type_id}/sols`)
      }else if(itm.report_type=='article'){
        
          navigate(`/article/${itm.type_id}`)
          }}}>{itm.reported_content}</span>
    </div>  <span className="flex gap-2">  <span>{formatDistanceToNow(itm.createdAt)}</span> <IoCloseOutline  className=' text-[white] text-[25px] cursor-pointer hover:bg-slate-500 rounded-sm ' onClick={()=>delete_report(itm._id,Selected)}/></span>  </div>
     <div className="p-2">
        <div  className='bg-[white] p-1 rounded-md'>{itm.report_content}</div>
     </div>
     
   </div>

   )):<div>No reports to show for {Selected}</div>
    }
    </div>
  </div>
  );
}

export default Admin_report;
