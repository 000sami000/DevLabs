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
  thumbnail} = adata;


  return (
    <>
      <div
        onClick={() => {
          navigate(`/article/${_id}`);
        }}
        className="w-[100%] m-auto bg-[#ffffff] rounded-md shadow-md"
      >
        <div className="w-full flex  items-center rounded-[10px] pr-2 ">
          <div className="bg-cover rounded-tl-[6px] rounded-bl-[6px] p-2  bg-no-repeat bg-center w-[40%] h-[320px] " style={{ backgroundImage: `url(http://localhost:3000/${thumbnail.path.replace(/\\/g, "/")})` }}>

            <div className="flex items-center justify-between   p-1">
            <div className="flex items-center gap-2  p-1 rounded-md hover:bg-[#ffffff99] cursor-pointer">
              <img
                src="/default_profile.jpg"
                width={`35px`}
                className="rounded-[50%]"
              />
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
    tags.map((itm)=>{return<span className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg">{itm}</span>})
   }
    </div> 
          </div>
        </div>

  
      </div>
    </>
  );
}

export default Article_comp;
