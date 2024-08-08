import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
// import { SiTicktick } from "react-icons/si";s
import { fetch_all_users, fetch_savedArticles, fetch_userArticles, search_savedArticles, search_userArticles } from "../../../api";
import Loader from "../../Loader";
import { formatDistanceToNow } from "date-fns";
function Admin_user
() {
  const [Selected,setSelected]=useState("users")
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [Users, setUsers] = useState([]);
  const [searchterm,setsearchterm]=useState("")
  const [toggle,settoggle]=useState('get');
  const get_all_users = async (users_type,searchterm) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_all_users(users_type,searchterm);
      console.log("::::",data)
      if (Array.isArray(data)) {
        setUsers(data);
        settoggle('get')
      } else {
        setUsers([]);
      }
      setloading(false);
      
      // console.log(data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };



  useEffect(() => {
 

    get_all_users(Selected,searchterm);
    

  }, [id]);
  return (
    <div className=" max-h-[500px]">
      <div className="flex justify-between ">
        
        <div className="flex gap-2">
          <button onClick={()=>{setSelected("users");get_all_users("users",searchterm)}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="users"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Users</button>
          <button onClick={()=>{setSelected("blocked"); get_all_users("blocked",searchterm)}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="blocked"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Blocked Users <FaBookmark  className="text-[13px]"/> </button>
        </div>
        <div className="w-[40%] flex gap-2 items-center bg-[white]  rounded-md px-2 ">
          <input
            placeholder="Search Users by Username"
            className="w-[90%] text-[14px] p-1 outline-none"
            onChange={(e)=>setsearchterm(e.target.value)}
            value={searchterm}
          />
          <IoSearchSharp onClick={()=>{
         get_all_users(Selected,searchterm)
               setsearchterm("")
              }
                } className="text-[23px] text-[#ff964c] rounded-[5px] hover:bg-slate-200" />
        </div>
      </div>

      <br />
      
      {
        
      <div  className="p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
        <span className=" w-[70%] break-words">
      
      { Selected==="users"?<span>{toggle==="get"?"Total Users:":"Total User founded"} ({Users.length})</span>:<span>{toggle==="get"?"Total Blocked Users:":"Total Founded Blocked USers:"} ({Users.length})</span> }
        </span>
        <div className=" flex w-[30%] justify-between ">
          
          
        </div>
      </div>
      }
      <hr className="h-[4px] bg-[white] rounded-[2px]" />
      <br />
      
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-visible">
      {
        loading?<div className="flex justify-center "><Loader/></div>:
     Users.length>0? Users.map((itm)=>(

        <div  onClick={()=>{navigate(`/user_overview/${itm._id}`)}} className="bg-[#888888e6] p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
        <div className="flex items-center gap-[2px]  p-1 w-[13%] rounded-md hover:bg-[#ffffff99] cursor-pointer">
        <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${itm.profile_img_?`http://localhost:3000/${itm.profile_img_?.destination}/${itm.profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
              <div className="flex flex-col text-nowrap text-[12px] text-[white]">
                <div className="text-[11px]   pt-0 px-1">
                  {itm?.username}
                </div>
                <div className="text-[10px] pt-0 px-1">
                  {formatDistanceToNow(itm.createdAt)}
                </div>
              </div>
              </div>
        <div className=" flex w-[37%] justify-between">
         
          <div className="flex justify-between w-[50%]">
          
            <div>{itm.article_count}</div>
            <div>{itm.problem_count}</div>
            <div>{itm.solution_count}</div>
            {/* <div  >{itm.isActive?<span className="bg-[#55d055] p-[3px] rounded-md text-[#fcfcfc]">Active</span>:<span className="bg-[#fc8a51] p-[3px] rounded-md text-[#fcfcfc]">Inactive</span>}</div> */}
          </div>
        </div>
      </div>

      )):<div>No User </div>
      }
      </div>
    </div>
  );
}

export default Admin_user
;
