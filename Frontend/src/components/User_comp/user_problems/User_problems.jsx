import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { fetch_userProblems ,search_userProblems} from "../../../api";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../formateDate";
import Loader from "../../Loader";
function User_problems() {
  
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [Searchterm,setSearchterm]=useState('')
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [userproblems, setuserproblems] = useState([]);
  const [toggle,settoggle]=useState("get")
  const user_problem = async (id) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userProblems(id);
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
  const search_user_problem = async (query) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_userProblems(query);
      if (Array.isArray(data)) {
        setuserproblems(data);
        settoggle('search');
      } else {
        setuserproblems([]);
      }
      setloading(false);
      
      console.log(data);
    } catch (err) {
      setloading(false);
      
      console.log("searchuserProblem--", err);
    }
  };

  useEffect(() => {
    if(user._id===id)
    user_problem(id);
  }, [id]);

  return <>
    

   {

   loading?<div className=" h-full flex justify-center items-center"><Loader/></div>:

    <>

    
      <div className="flex justify-end">
        <div className="w-[40%] flex gap-2 items-center bg-[white]  rounded-md px-2 ">
          <input
            placeholder="Search Your Posted Problems"
            className="w-[90%] text-[14px] p-1 outline-none"
           onChange={(e)=>{setSearchterm(e.target.value)}}
           value={Searchterm}
          />
          <IoSearchSharp
            onClick={() => { if(Searchterm!=''){search_user_problem(Searchterm);}else{ user_problem(id);}}}
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
              <div className="flex w-[30%] justify-between">
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

export default User_problems;
