import React, { useEffect, useState } from "react";
import { IoBanOutline, IoSearchSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {formatNumber} from "../../format_num"
// import { SiTicktick } from "react-icons/si";s
import { fetch_allArticles, fetch_savedArticles, fetch_userArticles, search_allArticles, search_savedArticles, search_userArticles } from "../../../api";
import Loader from "../../Loader";
import { formatDistanceToNow } from "date-fns";
import { FcApproval } from "react-icons/fc";
function Admin_articles() {
  const [Selected,setSelected]=useState("user_articles")
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [Adminarticles, setAdminarticles] = useState([]);
  const [searchterm,setsearchterm]=useState("")
  const [toggle,settoggle]=useState('get');
  const get_user_article = async () => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userArticles();
   
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('get')
      } else {
        setAdminarticles([]);
      }
      setloading(false);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  
  const search_user_article = async (query) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_userArticles(query);
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('search')
      } else {
        setAdminarticles([]);
      }
      setloading(false);

    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  const get_user_article_saved = async () => {

    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_savedArticles();
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('get')
      } else {
        setAdminarticles([]);
      }
      setloading(false);
      

     
    } catch (err) {
      setloading(false);
      seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };

  const search_user_article_saved = async (query) => {
    console.log("poipopoi;")
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_savedArticles(query);
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('search')
      } else {
        setAdminarticles([]);
      }
      setloading(false);
      
      console.log("///////",Adminarticles);
     
    } catch (err) {
      setloading(false);
      seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  const get_total_article =async() =>{
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_allArticles();
      console.log("::::",data)
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('get')
      } else {
        setAdminarticles([]);
      }
      setloading(false);
      
      // console.log(data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  }
  const search_total_article  = async (query) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await search_allArticles(query);
      if (Array.isArray(data)) {
        setAdminarticles(data);
        settoggle('search')
      } else {
        setAdminarticles([]);
      }
      setloading(false);
      
      console.log("?????//",data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  useEffect(() => {
 

      get_user_article();
    

  }, [id]);
  return (
    <div className=" max-h-[500px]">
      <div className="flex justify-between ">
        
        <div className="flex gap-2">
          <button onClick={()=>{setSelected("user_articles");get_user_article()}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="user_articles"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Your Articles</button>
          <button onClick={()=>{setSelected("saved"); get_user_article_saved()}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="saved"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Saved <FaBookmark  className="text-[13px]"/> </button>
          <button onClick={()=>{setSelected("total_articles"); get_total_article()}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="total_articles"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Total Articles </button>
        </div>
        <div className="w-[40%] flex gap-2 items-center bg-[white]  rounded-md px-2 ">
          <input
            placeholder="Search articles by title "
            className="w-[90%] text-[14px] p-1 outline-none"
            onChange={(e)=>setsearchterm(e.target.value)}
            value={searchterm}
          />
          <IoSearchSharp onClick={()=>{
            if(Selected==="user_articles"){
               if(searchterm){

                search_user_article(searchterm)
               }
               else{
                get_user_article()
               }
              }
              else if(Selected==="saved"){
                if(searchterm){
                search_user_article_saved(searchterm)
                }

                else{
                get_user_article_saved()
                }
              }else if(Selected==="total_articles"){
                if(searchterm){
                  search_total_article(searchterm)
                }

                else{
                  get_total_article()
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
      
      {Selected==="total_articles"?<span>{toggle==="get"?"Total articles :":"Founded articles :"} ({Adminarticles.length})</span>: Selected==="user_articles"?<span>{toggle==="get"?"Your total articles :":"Founded articles :"} ({Adminarticles.length})</span>:<span>{toggle==="get"?"Total Saved articles :":"Founded Saved articles :"} ({Adminarticles.length})</span> }
        </span>
        <div className=" flex w-[30%] justify-between ">
          <div className=" w-[37%]">
          
          </div>
          <div className={Selected==="user_articles"?`flex justify-between w-[100%]`:`text-center  pr-5`}>
          
            <div>Comments</div>
            <div>{Selected==="user_articles"&&"Status"}</div>
          </div>
        </div>
      </div>
      }
      <hr className="h-[4px] bg-[white] rounded-[2px]" />
      <br />
      
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-visible">
      {
        loading?<div className="flex justify-center "><Loader/></div>:
      
      Adminarticles.map((itm)=>(
           <div onClick={()=>{navigate(`/article/${itm._id}`)}} className="bg-[#888888e6] shadow-md w-full p-2 flex justify-between gap-2 items-center rounded-[10px] cursor-pointer">

           {

          Selected!=="user_articles"&& <div className="flex items-center gap-[2px]  p-1 w-[13%] rounded-md hover:bg-[#ffffff99] cursor-pointer">
          <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${itm.profile_img_?`http://localhost:3000/${itm.profile_img_?.destination}/${itm.profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
              <div className="flex flex-col text-nowrap text-[12px] text-[white]">
                <div className="text-[11px]   pt-0 px-1">
                  {itm?.creator_username}
                </div>
                <div className="text-[10px] pt-0 px-1">
                  {formatDistanceToNow(itm.createdAt)}
                </div>
              </div>
              </div>
            }
             <span className=" w-[70%] break-words ">{itm.title}</span>
            <div className=" flex w-[37%]  justify-between ">
            <div className="flex gap-5 w-[25%] ">
             <span className="flex items-center gap-2"><AiFillLike /> <span >{itm.likes}</span></span>
             <span className="flex items-center gap-2"><AiFillDislike /> <span>{itm.dislikes}</span></span>
             </div>
            <div className=" w-[55%] text-center  flex justify-between gap-6">
            <div className=" text-center ">{itm.total_comments}</div>
            <div  >{itm.isActive?<span className="bg-[#61ea61] p-[3px] px-2 rounded-md text-[#fcfcfc]">Active</span>:<span className="bg-[#fc8a51] p-[3px] rounded-md text-[#fcfcfc]">Inactive</span>}</div>
            {itm.isApproved?<span className=" p-[3px] rounded-md text-[#fcfcfc]"><FcApproval/></span>:<span className=" p-[3px] rounded-md  text-[#b03a3a]"><IoBanOutline className="text-[18px] "/></span>}
               </div>
            </div>
          </div>
))
     
      }
      </div>
    </div>
  );
}

export default Admin_articles;
