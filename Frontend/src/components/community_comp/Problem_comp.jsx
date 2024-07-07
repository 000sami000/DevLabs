import DOMPurify from "dompurify";
import React from "react";
import { AiOutlineLike } from "react-icons/ai";
import { BiSolidLike } from "react-icons/bi";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch } from "react-redux";
import { formatDistanceToNow } from 'date-fns';
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { deleteProblem } from "../../redux_/actions/problem";
import "../text_editor/Editor.scss";
import  'react-quill/dist/quill.snow.css';
function Problem_comp({pdata}) {
  const dispatch=useDispatch();
  const {title,problem_content,tags,likes,total_sol,creator_username,creator_id,_id,createdAt}=pdata;
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);
  
  const handle_del=()=>{
  dispatch(deleteProblem(pdata._id,navigate))
  }
  return (
    <>
      <div className="w-[100%] m-auto bg-[#D9D9D9] rounded-md p-3 shadow-md">
        <div className="w-full p-1 flex gap-3 justify-between items-center rounded-[10px]">
          <div className="w-[90%] flex gap-5 items-center justify-between">
            <span className="   p-1 flex-grow-0 basis-auto cursor-pointer  rounded-md flex items-center gap-1 hover:bg-[#ededed]">
              <img
                src="/default_profile.jpg"
                width={`35px`}
                className="rounded-[50%]"
              />
             <div className="flex flex-col text-nowrap ">
                <span className="text-[13px]   pt-0 px-1">@{creator_username} </span>
                <span className="text-[13px]   pt-0 px-1">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                </div>         
            </span>
            <div className="w-[85%]  break-words font-bold text-[17px] max-h-[120px] overflow-y-auto">
             {title}  
            </div> 
          </div>
          {location.pathname != `/problem/${_id}/sols`? (
            <div className="w-[10%]">
              
              <button
                className="text-[white]  bg-[orange] px-2 p-1 text-center rounded-[5px] w-[95%] "
                onClick={() => {
                  navigate(`/problem/${_id}/sols`);
                }}
              >
                Sols({total_sol.length})
              </button>
            </div>
          ):(
            <div className="w-[8%] flex justify-end text-[26px] gap-5 text-[#eb8a44]">
            <MdDeleteOutline  className="cursor-pointer" onClick={handle_del} />
          
            </div>
          )}
        </div>
        <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
        <div className="py-3 px-2 text-pretty text-justify max-h-[400px] overflow-y-auto">
        <div className=" editor " dangerouslySetInnerHTML={{ __html:  problem_content}} />
      
        </div>
        <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
        <div className="flex justify-between items-center gap-2 pl-5 pt-2 pr-2">
          <div className="flex flex-wrap w-[80%] gap-2">
            {tags.map((itm,i) => {
              return (
                <span key={i} className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg">
                  {itm}
                </span>
              );
            })}
          </div>
          <div className="flex justify-end gap-5 w-[20%]">
            <div className="flex items-center text-[1.2rem] gap-1">
              <AiOutlineLike className="text-[1.3rem] cursor-pointer" /> 1.3K
            </div>
            <button className="text-[#f96666] p-1 rounded-md font-bold hover:bg-[#edededdd]">
              Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Problem_comp;
