import React, { useEffect, useState } from "react";

import { IoSearchSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa6";
import { fetch_allSolutions, fetch_savedSolutions, fetch_userSolutions, search_savedSolution, search_userSolution } from "../../../api";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { IoBanOutline } from "react-icons/io5";
import Loader from "../../Loader";
import { FcApproval } from "react-icons/fc";
import { formatDistanceToNow } from "date-fns";
import {formatNumber} from "../../format_num"
function Admin_solutions() {
  const { id } = useParams();
  let navigate=useNavigate();
  const [Selected, setSelected] = useState("user_solutions");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [usersolutions, setusersolutions] = useState([]);
  const [searchterm,setsearchterm]=useState("")
  const [toggle,settoggle]=useState('get');
  let user = useSelector((state) => state.userReducer.current_user);
  
  const get_user_solution = async () => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userSolutions();
      if (Array.isArray(data)) {
        setusersolutions(data);
        
      } else {
        setusersolutions([]);
      }
      setloading(false);
      
      console.log("jkljlkjlk",data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  const search_user_solution = async (query) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_userSolution(query);
      if (Array.isArray(data)) {
        setusersolutions(data);
      } else {
        setusersolutions([]);
      }
      setloading(false);
      
      // console.log(data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  const get_user_solution_saved = async () => {
    console.log("poipopoi;")
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_savedSolutions();
      if (Array.isArray(data)) {
        setusersolutions(data);
      } else {
        setusersolutions([]);
      }
      setloading(false);
      
      console.log("///////",usersolutions);
     
    } catch (err) {
      setloading(false);
      seterror(err.massage)
      console.log("get_user_solution_saved-- error", err);
    }
  };

  const search_user_solution_saved = async (query) => {
    console.log("poipopoi;")
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_savedSolution(query);
      if (Array.isArray(data)) {
        setusersolutions(data);
      } else {
        setusersolutions([]);
      }
      setloading(false);
      
      console.log("///////",usersolutions);
     
    } catch (err) {
      setloading(false);
      seterror(err.massage)
      console.log("search_user_solution_saved-- error", err);
    }
  };
  
  const get_all_solutions = async (searchterm='') => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_allSolutions(searchterm);
      if (Array.isArray(data)) {
        setusersolutions(data);
        settoggle('get');
      } else {
        setuserproblems([]);
      }
      setloading(false);
      
      console.log(data);
    } catch (err) {
      setloading(false);
      
      console.log("userProblem--", err);
    }
  };
  useEffect(() => {
    if(user._id===id){

      get_user_solution();
    }

  }, [id]);
  
  
  return (
    <div className=" max-h-[500px]">
    <div className="flex justify-between ">
      
      <div className="flex gap-2">
        <button onClick={()=>{setSelected("user_solutions");get_user_solution()}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="user_solutions"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Your Solutions</button>
        <button onClick={()=>{setSelected("saved"); get_user_solution_saved()}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="saved"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Saved <FaBookmark  className="text-[13px]"/> </button>
        <button onClick={()=>{setSelected("all_solutions"); get_all_solutions()}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="all_solutions"?"bg-[#d17635]":"bg-[#ff964c]"}`}>All Solution </button>
      </div>
      <div className="w-[40%] flex gap-2 items-center bg-[white]  rounded-md px-2 ">
        <input
          placeholder="Search solution by Problem title "
          className="w-[90%] text-[14px] p-1 outline-none"
          onChange={(e)=>setsearchterm(e.target.value)}
          value={searchterm}
        />
        <IoSearchSharp onClick={()=>{
          if(Selected==="user_solutions"){
             if(searchterm){

              search_user_solution(searchterm)
              settoggle("search")
             }
             else{
              get_user_solution()
              settoggle("get")
             }
            }
            else if(Selected==="saved"){
              if(searchterm){
                search_user_solution_saved(searchterm);
                settoggle("search")
              }

              else{
                get_user_solution_saved()
                settoggle("get")
              }
            }
             else{
              if(searchterm){
                get_all_solutions(searchterm);
                settoggle("search")
              }

              else{
                get_all_solutions()
                settoggle("get")
              }

             }            
            }
              } className="text-[23px] text-[#ff964c] rounded-[5px] hover:bg-slate-200" />
      </div>
    </div>

    <br />
    
    {
      
    <div  className="p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
      <span className=" w-[70%] break-words">
    
    { Selected==="user_solutions"?<span>{toggle==="get"?"Your total solutions :":"Founded solutions :"} ({usersolutions.length})</span>:<span>{toggle==="get"?"Total Saved articles :":"Founded Saved articles :"} ({usersolutions.length})</span> }
      </span>
      <div className=" flex w-[32%] justify-between ">
        <div className=" w-[37%]">
         
        </div>
        <div className={Selected==="user_solutions"?`flex justify-start gap-[50px] w-[100%]`:`text-center  pr-5`}>
        
          <div className="ml-2">Comments</div>
          <div>Score</div>
          {/* <div>{Selected==="user_solutions"&&"Status"}</div> */}
        </div>
      </div>
    </div>
    }
    <hr className="h-[4px] bg-[white] rounded-[2px]" />
    <br />
    
    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-visible">
    {
      loading?<div className="flex justify-center "><Loader/></div>:
   usersolutions.length>0 ? usersolutions.map((itm)=>(

      <div  onClick={()=>{navigate(`/problem/${itm.p_id}/sols?s_id=${itm._id}`)}} className="bg-[#888888e6] p-2 flex gap-2 justify-between items-center rounded-[10px] cursor-pointer">
        <div className="flex gap-7 w-[76%] items-center">
      <span className="   p-1 flex-grow-0 basis-auto   rounded-md flex items-center gap-1 ">
              <img
                src="/default_profile.jpg"
                width={`34px`}
                className="rounded-[50%]"
              />
             <div className="flex flex-col text-nowrap ">
                <span className="text-[10px]   pt-0 px-1">@{itm.p_creator_username} </span>
                <span className="text-[10px]   pt-0 px-1">{formatDistanceToNow(new Date(itm.p_createdAt), { addSuffix: true })}</span>
                </div>         
            </span>
      <div className=" w-[80%]  overflow-x-hidden font-semibold  text-nowrap">
        {itm.p_title}
      </div>
      </div>
      <div className=" flex w-[23%] ">
       
        <div className="flex justify-around gap-3 items-center w-[100%]">
        
          <div className="ml-[30px]">{formatNumber(itm.total_comments)}</div>
          <div className="ml-[60px] bg-[#393939] text-[#00fa00] px-6 rounded-md"> {formatNumber(itm.vote)}</div>
          
          {itm.isApproved?<span className=" p-[3px] rounded-md text-[#fcfcfc]"><FcApproval/></span>:<span className=" p-[3px] rounded-md  text-[#b03a3a]"><IoBanOutline className="text-[18px] "/></span>}
        </div>
      </div>
    </div>

    )):<div>No solutions Created</div>
    }
    </div>
  </div>
  );
}

export default Admin_solutions;
