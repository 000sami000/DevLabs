import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fetch_single_article,createComment  } from "../../api";
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { FaBookmark, FaComments, FaRegBookmark } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useSelector,useDispatch } from "react-redux";
import WordLimitedTextarea from "../WordLimitedTextarea"
import {fetchComment,like_article,dislike_article,save_article} from "../../api";
import Loader from "../Loader"
import { getUser } from "../../redux_/actions/user";
 import Update_article from "./Update_article";
function Single_article() {
  const dispatch=useDispatch();
  const [Single_article, setSingle_article] = useState({});
  const [Show_comment,setShow_comment]=useState(false)
  let c_obj={content_creator_id:"",type_id:"",comment_type:"",comment_content:"",commentor_username:"",commentor_id:""}
  const [Comments,setComments]=useState([])
  const { a_id } = useParams();
  const user=useSelector((state)=>state.userReducer.current_user)
   const [loading,setloading]=useState(false);
  //  const [error,seterror]=useState(false);
   const [cloading,setcloading]=useState(false);
  //  const [cerror,setcerror]=useState(false);
   const [isopen, setisopen]=useState(false)
   const [Likes,setLikes]=useState(0);
   const [DisLikes,setDisLikes]=useState(0);
   useEffect(() => {
 
    getSinglearticle(a_id);
    console.log(":::::", Single_article);
  }, [a_id]);

  const getSinglearticle = async (a_id) => {
    try {
      setloading(true);
      const { data } = await fetch_single_article(a_id);

      console.log("data---:", data);
      setSingle_article(data[0]);
  
      setloading(false);
      //    dispatch(get_Single_article(data))
    } catch (err) {
      setloading(false);
      console.log("get_Single_article err---", err);
    }
  };
  const { _id,title,article_content,tags,likes,dislikes, creator_username,creator_id,saved_art_by, isApproved, isActive, createdAt,
  } = Single_article;

  useEffect(()=>{
    if(Single_article){
      setLikes(likes?.length)
      setDisLikes(dislikes?.length)
      console.log(",",Likes)
    }
  },[Single_article])


  function Save() {
    console.log("Savey");
    if (user&&saved_art_by?.length > 0) {
      return (
        <span>
          {saved_art_by?.find((saved) => saved === user._id)?(
            <span className="text-md ">
            
              <FaBookmark /> {" "}
            </span>
          ) : (
            <span className="text-md">
            
              <FaRegBookmark />
            </span>
          )}
        </span>
      );
    }
    return ( <> <span>   <FaRegBookmark />  </span></>);
  }
  const savedarticle=async()=>{
    console.log("saved function")
    try{

      const {data}=await save_article(_id);
      setSingle_article(data)
      // setLikes(data.likes.length)
      console.log("hhhhh",data)
    }catch(err){
      console.log("savedarticle-- error", err);
    }
  }
  function DisLike() {
    console.log("dislikkkkyyyy");
    if (user&&dislikes?.length > 0) {
      return (
        <span>
          {dislikes?.find((dislike) => dislike === user._id) ? (
            <span className="text-md ">
              <AiFillDislike />{" "}
            </span>
          ) : (
            <span className="text-md">
              <AiOutlineDislike />
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <AiOutlineDislike /> 
        </span>
      </>
    );
  }
  function Like() {
    console.log("likkkkyyyy");
    if (user&&likes?.length > 0) {
      return (
        <span>
          {likes?.find((like) => like === user._id) ? (
            <span className="text-md ">
              <AiFillLike />{" "}
            </span>
          ) : (
            <span className="text-md">
              <AiOutlineLike />
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <AiOutlineLike /> 
        </span>
      </>
    );
  }
  const likearticle=async ()=>{
    try{

      const {data}=await like_article(_id);
      setSingle_article(data)
      setLikes(data?.likes?.length)
    }catch(err){
      console.log("like_article-- error", err);
    }
  }
  const dislikearticle=async ()=>{
    try{

      const {data}=await dislike_article(_id);
      setSingle_article(data)
      setDisLikes(data.dislikes.length)
    }catch(err){
      console.log("dislike_article-- error", err);
    }
  }
  const fetch_comment= async(type_id)=>{
           
    try{
      setcloading(true);
      const {data}=await fetchComment(type_id)
      setcloading(false);
      console.log("comments====",data)
    setComments(data)
    }catch(err){
      setcloading(false);
      console.log("fetch_comment-- error", err);
    }
  }

  const create_comment= async()=>{
    if(text!=''){

      c_obj={content_creator_id:creator_id,type_id:_id,comment_type:"article",comment_content:text,commentor_username:user.username,commentor_id:user._id}
    }else{
      //error
      return;
    }

        try{
           const {data}=await createComment(c_obj)
           console.log(data)
           setComments((prev) => [data, ...prev])
        }   catch(err){
          console.log("create_comment-- error", err);
        }           
  }

  const [text, setText] = useState('');
  return (
    <>
    {
      loading?<div className="w-[95%]  m-auto mt-[4%] flex justify-center items-center gap-3"><Loader/></div>:
      <div className="w-[95%] m-auto mt-[4%] flex gap-3">
        <div className="w-[75%]  rounded-lg p-2">
        <div className="bg-[#ffffff] p-2">
          <div className="w-full p-1 flex justify-between items-center rounded-[10px] pr-2">
            <div className="w-[88%] flex gap-8 items-center">
              <div className=" cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                <img
                  src="/default_profile.jpg"
                  width={`35px`}
                  className="rounded-[50%]"
                />
                <div className="flex flex-col text-nowrap text-[12px]">
                  <div className="text-[13px]   pt-0 px-1">
                    {creator_username}
                  </div>
                  {/* <div className="text-[13px]   pt-0 px-1">{formatDistanceToNow(createdAt)}</div> */}
                </div>
              </div>

              <div className="flex justify-between w-[8%] text-[1.4rem] text-[#f96666]">
              <MdDeleteOutline className="cursor-pointer hover:bg-[#edededdd]   rounded-md" />  
              <TbEditCircle className="cursor-pointer hover:bg-[#edededdd]   rounded-md" onClick={()=>setisopen(true)}/>
              </div>
              </div>
              <div className="flex justify-between gap-5 items-center">
              <span onClick={()=>{if(!user?._id){alert("Login to Like")}else{savedarticle(); }}}  className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
               <Save/>
              </span>
              <span className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
                Report
              </span>
            </div>
          </div>

          <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
          <div>
            <div className=" text-[35px] pb-3 pl-5">{title}</div>
            <div
              dangerouslySetInnerHTML={{
                __html: article_content,
              }}
              className="editor_article p-5"
            ></div>
            <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
            <div className="flex  justify-between p-2 px-4">
            <div className="flex flex-wrap gap-2 "> 
             { tags?.map((itm,i)=>{return<span  key={i} className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg">{itm}</span>})}
          </div>
            <div className="flex gap-10 items-center text-[20px]">
              <div className="flex gap-3 items-center ">
               <div  className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]" onClick={ ()=>{if(!user?._id){alert("Login to Like")}else{likearticle (); }} } > <Like/>&nbsp;{Likes}</div> 
                <div className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]"  onClick={ ()=>{if(!user?._id){alert("Login to DisLike")}else{dislikearticle (); }} }> <DisLike/>&nbsp;{DisLikes}</div>
              </div>
              <div  onClick={()=>{setShow_comment((prev)=>!prev); if(Show_comment) {fetch_comment(_id)}  }}  className="cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                <FaComments className="cursor-pointer" />
                <span>2k</span>
                
              </div>
            </div>
          </div>
          </div>
          </div>
          {
          Show_comment&&<div className="bg-[#343434] rounded-lg shadow-lg p-2">
            <div className="text-center text-[#F99156] text-[15px] font-bold">
              Comments
            </div>
            <hr className="bg-[#dadada] h-[2px] rounded-[2px] mb-2" />
             { cloading?<div className="flex justify-center p-2"><Loader/></div>: !Comments?.length>0?<div>No Comments</div>: Comments.map((itm)=>(   
              <div key={itm._id} className="w-full p-1 flex justify-between items-center rounded-[10px]">
                <div className="w-[88%] flex gap-5 items-center">
                  <div className=" w-[13%] overflow-x-hidden  cursor-pointer p-1 rounded-md flex items-center place-self-start gap-2 hover:bg-[#ededed56]">
                    <img
                      src="/default_profile.jpg"
                      width={`30px`}
                      className="rounded-[50%]"
                    />
                    <div className=" text-[#eaeaea]">
                      <div className="text-wrap text-[11px] inline-block ">
                        {itm.username}
                      </div>
                      <div className=" text-[10px]">tim101</div>
                    </div>
                  </div>
                  <div className="w-[84%] break-words  text-[13px] text-[#eaeaea] ">
                    {itm.comment_content}
                  </div>
                </div>
                <div className="text-[#f96666] p-1  cursor-pointer rounded-md font-semibold hover:bg-[#ededed88]">
                  Report
                </div>
              </div> ) ) 
             }
             <div className="flex gap-2 w-full items-center">
              <WordLimitedTextarea maxWords={70} text={text} setText={setText}/>
                 <button className="text-[green] p-1 hover:bg-[#49e349cf] rounded-md" onClick={create_comment}>Post</button>
                </div>
          </div>
          }
        </div>
        <div className="w-[25%] bg-[red] self-start">cssc</div>
        <Update_article Single_article={Single_article}  setSingle_article={setSingle_article} setisopen={setisopen} isopen={isopen}/>
      </div>
    }
    </>
  );
}

export default Single_article;
