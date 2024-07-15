import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { fetch_single_article,createComment ,fetchComment,like_article,dislike_article,save_article, delete_article } from "../../api";
import { AiFillDislike, AiFillLike, AiOutlineDislike, AiOutlineLike } from "react-icons/ai";
import { FaBookmark, FaComments, FaRegBookmark } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useSelector } from "react-redux";
import Loader from "../Loader"
 import Update_article from "./Update_article";
 import editorjsHTML from 'editorjs-html';
 import "../text_editor/editorpro.css"
import Comment from "../Comment";
import {formatNumber} from "../format_num"
import Report from "../Report";
function Single_article() {
  const navigate=useNavigate();
  const [Single_article, setSingle_article] = useState({});
  const [Show_comment,setShow_comment]=useState(false)
 

  const { a_id } = useParams();
  const user=useSelector((state)=>state.userReducer.current_user)
  const[current_adata,setcurrent_adata]=useState(null)

   const [loading,setloading]=useState(false);
  //  const [error,seterror]=useState(false);

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
    total_comments } = Single_article;
  useEffect(()=>{
    if(Single_article){
      setLikes(likes?.length)
      setDisLikes(dislikes?.length)
      console.log(",",Likes)
    }
  },[Single_article])

 console.log("article------",article_content)
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
      // console.log("hhhhh",data)
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

const del_article=async(_id)=>{
  try{
    const {data}=await delete_article(_id);
    navigate("/articles")

  }catch(err){
    console.log("del_article-- error", err);
  }


  
}

  
  function convertDataToHtml(blocks) {
    var convertedHtml = "";
    blocks.map((block) => {
      switch (block.type) {
        case "header":
          convertedHtml += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          break;
        case "embded":
          convertedHtml += `<div><iframe width="560" height="315" src="${block.data.embed}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></div>`;
          break;
        case "paragraph":
          convertedHtml += `<p>${block.data.text}</p>`;
          break;
        case "delimiter":
          convertedHtml += "<hr />";
          break;
        case "image":
          convertedHtml += `<img class="img-fluid" src="${block.data.file.url}" title="${block.data.caption}" /><br /><em>${block.data.caption}</em>`;
          break;
        case "list":
          convertedHtml += "<ul>";
          block.data.items.forEach(function (li) {
            convertedHtml += `<li>${li}</li>`;
          });
          convertedHtml += "</ul>";
          break;
        default:
          console.log("Unknown block type", block.type);
          break;
      }
    });
    console.log("html}}}", convertedHtml);
    return convertedHtml;
  }
  // convertDataToHtml(article_content.blocks)
  console.log("typeof",typeof(article_content))

  const customParser = editorjsHTML({
    table: (block) => {
      const { withHeadings, content } = block.data;
      let html = '<table>';
      
      content.forEach((row, rowIndex) => {
        html += '<tr>';
        row.forEach(cell => {
          if (withHeadings && rowIndex === 0) {
            html += `<th>${cell}</th>`;
          } else {
            html += `<td>${cell}</td>`;
          }
        });
        html += '</tr>';
      });
      
      html += '</table>';
      return html;
    }
  });

  let htmlContent = '';

  if (typeof article_content === 'object') {
   
    try {
      const html = customParser.parse(article_content);
      htmlContent = html.join('');
      console.log("///////",htmlContent)
    } catch (err) {
      console.error('Error parsing Editor.js content:', err);
    }
  } else {
    htmlContent = article_content;
  }
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
                  <div className="text-[13px]   pt-0 px-1">{createdAt && formatDistanceToNow(createdAt)}</div>
                </div>
              </div>

              <div className="flex justify-between w-[8%] text-[1.4rem] text-[#f96666]">
              <MdDeleteOutline onClick={()=>{ del_article(_id)}} className="cursor-pointer hover:bg-[#edededdd]   rounded-md" />  
              <TbEditCircle className="cursor-pointer hover:bg-[#edededdd]   rounded-md" onClick={()=>setisopen(true)}/>
              </div>
              </div>
              <div className="flex justify-between gap-5 items-center">
              <span onClick={()=>{if(!user?._id){alert("Login to Like")}else{savedarticle(); }}}  className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
               <Save/>
              </span>
              <span onClick={()=>{setcurrent_adata({_id,creator_id,creator_username,title,report_type:"article"})}} className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
                Report
              </span>
            </div>
          </div>

          <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
          <div>
            <div className=" text-[35px] pb-3 pl-5">{title}</div>
            <div
              dangerouslySetInnerHTML={{
                 __html: htmlContent 
              }}
              className="editor_article p-5 ce-block__content"
            ></div>
            <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
            <div className="flex  justify-between p-2 px-4">
            <div className="flex flex-wrap gap-2 "> 
             { tags?.map((itm,i)=>{return<span  key={i} className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg">{itm}</span>})}
          </div>
            <div className="flex gap-10 items-center text-[20px]">
              <div className="flex gap-3 items-center ">
               <div  className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]" onClick={ ()=>{if(!user?._id){alert("Login to Like")}else{likearticle (); }} } > <Like/>&nbsp;{formatNumber(Likes)}</div> 
                <div className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]"  onClick={ ()=>{if(!user?._id){alert("Login to DisLike")}else{dislikearticle (); }} }> <DisLike/>&nbsp;{formatNumber(DisLikes)}</div>
              </div>
              <div  onClick={()=>{setShow_comment((prev)=>!prev);   }}  className="cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                <FaComments className="cursor-pointer" />
                <span>{formatNumber(total_comments)}</span>
                
              </div>
            </div>
          </div>
          </div>
          </div>
          {
          Show_comment&&<Comment _id={_id} creator_id={creator_id} c_type={"article"}/>
          }
        </div>
        <div className="w-[25%] bg-[red] self-start">cssc</div>
        <Update_article Edit_articleobj={Single_article}  setEdit_articleobj={setSingle_article} setisopen={setisopen} isopen={isopen}/>
         <Report current_adata={current_adata} setcurrent_adata={setcurrent_adata}/>
      </div>
    }
    </>
  );
}

export default Single_article;
