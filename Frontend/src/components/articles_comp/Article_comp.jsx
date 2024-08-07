import React, { useState } from "react";

import { AiOutlineLike } from "react-icons/ai";
import { AiFillLike } from "react-icons/ai";
import { AiFillDislike } from "react-icons/ai";
import { AiOutlineDislike } from "react-icons/ai";
import { FaComments } from "react-icons/fa";
import Tags_input from "../Tags_input";
import { FaBookmark } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import editorjsHTML from "editorjs-html";
import "../text_editor/Editor.scss";
import { useSelector, useDispatch } from "react-redux";

import { useNavigate } from "react-router-dom";

function Article_comp({ adata }) {
  const navigate = useNavigate();
  const edjsParser = editorjsHTML();
  let user = useSelector((state) => state.userReducer.current_user);
  console.log(555555, adata);
  const {
    _id,
    title,
    description,
    article_content,
    tags,
    likes,
    dislikes,
    creator_username,
    creator_id,
    createdAt,
  thumbnail,profile_img_} = adata;


  return (
    <>
      <div
        onClick={() => {
          navigate(`/article/${_id}`);
        }}
        className="w-[100%] m-auto bg-[#ffffff] rounded-md shadow-md"
      >
        <div className="w-full flex  items-center rounded-[10px] pr-2 ">
          <div className="bg-cover rounded-tl-[6px] rounded-bl-[6px] p-2  bg-no-repeat bg-center w-[40%] h-[320px] " style={{ backgroundImage: `url(http://localhost:3000/${thumbnail.destination}/${thumbnail.filename}` }}>

            <div className="flex items-center justify-between   p-1">
            <div className="flex items-center gap-2  p-1 rounded-md hover:bg-[#ffffff99] cursor-pointer">
            <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${profile_img_?`http://localhost:3000/${profile_img_?.destination}/${profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
              <div className="flex flex-col text-nowrap text-[12px] text-[white]">
                <div className="text-[13px]   pt-0 px-1">
                  {creator_username}
                </div>
                <div className="text-[13px]   pt-0 px-1">
                  {formatDistanceToNow(createdAt)}
                </div>
              </div>
              </div>
              <div className="rounded-md flex items-center text-[white] gap-2 text-[20px] p-1 hover:bg-[#47474794]">
              <AiFillLike/>{likes.length}
              </div>
            </div>
          </div>

          <div className="flex flex-col self-start w-[60%] p-3 pl-4 ">
            <span className="w-[95%] mb-3 break-words font-bold text-[20px] max-h-[90px] overflow-y-auto">
              {title}
            </span>
            <div className="h-[170px] w-[95%] overflow-hidden break-words text-wrap text-justify">{description} </div>
            <div className="flex flex-wrap gap-2 ">  {
    tags.map((itm ,i)=>{return<span key={i} className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg">{itm}</span>})
   }
    </div> 
          </div>
        </div>

  
      </div>
    </>
  );
}

export default Article_comp;
