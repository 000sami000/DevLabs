import React, { useEffect, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { FaBookmark } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
// import { SiTicktick } from "react-icons/si";s
import { fetch_savedArticles, fetch_userArticles, search_savedArticles, search_userArticles } from "../../../api";
import Loader from "../../Loader";
function User_articles() {
  const [Selected,setSelected]=useState("user_articles")
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [userarticles, setuserarticles] = useState([]);
  const [searchterm,setsearchterm]=useState("")
  const [toggle,settoggle]=useState('get');
  const get_user_article = async () => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userArticles();
      if (Array.isArray(data)) {
        setuserarticles(data);
        settoggle('get')
      } else {
        setuserarticles([]);
      }
      setloading(false);
      
      // console.log(data);
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
        setuserarticles(data);
        settoggle('search')
      } else {
        setuserarticles([]);
      }
      setloading(false);
      
      // console.log(data);
    } catch (err) {
      setloading(false);
       seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  const get_user_article_saved = async () => {
    console.log("poipopoi;")
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_savedArticles();
      if (Array.isArray(data)) {
        setuserarticles(data);
        settoggle('get')
      } else {
        setuserarticles([]);
      }
      setloading(false);
      
      console.log("///////",userarticles);
     
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
        setuserarticles(data);
        settoggle('search')
      } else {
        setuserarticles([]);
      }
      setloading(false);
      
      console.log("///////",userarticles);
     
    } catch (err) {
      setloading(false);
      seterror(err.massage)
      console.log("userArticle-- error", err);
    }
  };
  useEffect(() => {
    if(user._id===id&&Selected==="user_articles"){

      get_user_article();
    }

  }, [id]);
  return (
    <div className=" max-h-[500px]">
      <div className="flex justify-between ">
        
        <div className="flex gap-2">
          <button onClick={()=>{setSelected("user_articles");get_user_article()}} className={`flex items-center gap-2   justify-center rounded-[5px] p-2 text-[13px] text-[white] ${Selected==="user_articles"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Your Articles</button>
          <button onClick={()=>{setSelected("saved"); get_user_article_saved()}} className={`flex items-center gap-2  justify-center rounded-[5px] text-[13px] p-2 text-[white] ${Selected==="saved"?"bg-[#d17635]":"bg-[#ff964c]"}`}>Saved <FaBookmark  className="text-[13px]"/> </button>
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
              else{
                if(searchterm){
                search_user_article_saved(searchterm)
                }

                else{
                get_user_article_saved()
                }
              }}
                } className="text-[23px] text-[#ff964c] rounded-[5px] hover:bg-slate-200" />
        </div>
      </div>

      <br />
      
      {
        
      <div  className="p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
        <span className=" w-[70%] break-words">
      
      { Selected==="user_articles"?<span>{toggle==="get"?"Your total articles :":"Founded articles :"} ({userarticles.length})</span>:<span>{toggle==="get"?"Total Saved articles :":"Founded Saved articles :"} ({userarticles.length})</span> }
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
      Selected==="user_articles"? userarticles? userarticles.map((itm)=>(

        <div  onClick={()=>{navigate(`/article/${itm._id}`)}} className="bg-[#888888e6] p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
        <span className=" w-[70%] break-words">
          {itm.title}
        </span>
        <div className=" flex w-[37%] justify-between">
          <div className="flex gap-3 w-[50%]">
            <span className="flex items-center">
              <AiFillLike />
              <span>{itm.likes.length}</span>
            </span>
            <span className="flex items-center">
              <AiFillDislike />
              <span>{itm.dislikes.length}</span>
            </span>
          </div>
          <div className="flex justify-between w-[50%]">
          
            <div>{itm.comments?.length}</div>
            <div  >{itm.isActive?<span className="bg-[#55d055] p-[3px] rounded-md text-[#fcfcfc]">Active</span>:<span className="bg-[#fc8a51] p-[3px] rounded-md text-[#fcfcfc]">Inactive</span>}</div>
          </div>
        </div>
      </div>

      )):<div>No articles Created</div>:
      userarticles?
      userarticles.map((itm)=>(
           <div onClick={()=>{navigate(`/article/${itm._id}`)}} className="bg-[#888888e6] p-2 flex justify-between items-center rounded-[10px] cursor-pointer">
             <span className=" w-[70%] break-words">{itm.title}</span>
            <div className=" flex w-[37%]  justify-between">
             <div className="flex gap-3 w-[50%]">
             <span className="flex items-center gap-3"><AiFillLike /><span>{itm.likes.length}</span></span>
             <span className="flex items-center gap-3"><AiFillDislike /><span>{itm.dislikes.length}</span></span>
             </div>
            <div className=" w-[38%] text-center">
            <div>{itm.comments?.length}</div>

               </div>
            </div>
          </div>
)):<div>No Saved Articles</div>
      }
      </div>
    </div>
  );
}

export default User_articles;
