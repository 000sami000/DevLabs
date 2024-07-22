import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { fetch_allProblems, fetch_userProblems ,search_userProblems} from "../../../api";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../formateDate";
import Loader from "../../Loader";
import { AiFillLike } from "react-icons/ai";

function Admin_problems() {
  
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [Searchterm,setSearchterm]=useState('')
  const [loading, setloading] = useState(false);
  const [Selected, setSelected] = useState("user_problems");
  const [error, seterror] = useState(null);
  const [userproblems, setuserproblems] = useState([]);
  const [toggle,settoggle]=useState("get")


  const get_user_problems = async (Searchterm) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userProblems(id,Searchterm);
      if (Array.isArray(data)) {
        setuserproblems(data);
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
  
  const get_all_problems = async (id) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_allProblems(Searchterm);
      if (Array.isArray(data)) {
        setuserproblems(data);
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
    if(user._id===id)
    get_user_problems(Searchterm);
  }, []);

  return <>
    

   {

   loading?<div className=" h-full flex justify-center items-center"><Loader/></div>:

    <>

    
      <div className="flex justify-between">
        <div className="flex gap-2">
        <button onClick={()=>{setSelected("user_problems");setSearchterm('');get_user_problems(Searchterm);}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="user_problems"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Your Problems</button>
        <button onClick={()=>{setSelected("Total_Problems");setSearchterm(''); get_all_problems(Searchterm);}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="Total_Problems"?"bg-[#d17635]":"bg-[#ff964c]"}`}> Total Problems </button>
      </div> 
        <div className="w-[40%] flex gap-2 items-center bg-[white]  rounded-md px-2 ">
          <input
            placeholder="Search Your Posted Problems"
            className="w-[90%] text-[14px] p-1 outline-none"
           onChange={(e)=>{setSearchterm(e.target.value)}}
           value={Searchterm}
          />
          <IoSearchSharp
            onClick={() => { 
                if(Selected==="user_problems"){

                if(Searchterm!=''){
                    get_user_problems(Searchterm);
                    settoggle("search")}else{ 
                        get_user_problems(Searchterm);   
                }
                        setSearchterm('');    
                }else{
                    if(Searchterm!=''){
                        get_all_problems(Searchterm);
                    settoggle("search")
                    }else{ 
                        get_all_problems(Searchterm);       
                    } 
                    setSearchterm('');
                }
                
                }}
            className="text-[23px] text-[#ff964c] rounded-[5px] hover:bg-slate-200"
          />
        </div>
      </div>

      <br />

      <div className="  flex justify-between items-center p-2">
       {toggle==="get"? <span>Your Problems : {userproblems?.length}</span>:<span> Founded Problems :{userproblems?.length}</span>}
        <div className="flex w-[30%] justify-between">
        <div className=" flex  whitespace-nowrap justify-end">Posted On</div>
        <div className=" flex  justify-end">Solutions</div>
        </div>
      </div>

      <hr className="h-[4px] bg-[white] rounded-[2px]" />
      <br />
      <div className="flex flex-col gap-2">
      {userproblems?.map((itm) => {
        return (
          <div key={itm._id} onClick={()=>{navigate(`/problem/${itm._id}/sols`)}} className="bg-[#888888e6] cursor-pointer hover:bg-[#dbdbdb] p-2 flex justify-between items-center rounded-[10px]">
           
              <div className=" w-[70%] break-words font-semibold">{itm.title}</div>
              <div className="w-[10%] flex items-center gap-2"><AiFillLike/>{itm.likes.length}</div>
              <div className="flex w-[25%] justify-between">
              <div className="bg-[orange] text-center  px-2 whitespace-nowrap  rounded-[4px]">
              {formatDate(itm.createdAt)}
              </div>
              <div className="bg-[orange] w-[25%] text-center  px-2 text-[#6a6a6a] rounded-[4px]">
              {itm.total_sol.length}
              </div>
           
              </div>
          </div>
          
        );
      })}
      </div>
    </>
   }</>
  
}

export default Admin_problems;
