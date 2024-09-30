import React from "react";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { MdDeleteOutline } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from 'date-fns';
import { useLocation, useNavigate } from "react-router-dom";
import { approveProblem, deleteProblem, likeProblem } from "../../redux_/actions/problem";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import '../text_editor/Editor.scss'
function Problem_comp({pdata , setcurrent_pdata}) {
  const dispatch=useDispatch();
  const {title,problem_content,tags,likes,total_sol,creator_username,creator_id,_id,createdAt,isApproved,profile_img_}=pdata;
  let user = useSelector((state) => state.userReducer.current_user);
  const navigate = useNavigate();
  const location = useLocation();
 
  function Like() {

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
  const handle_del=()=>{
  dispatch(deleteProblem(pdata._id,navigate))
  }
  
  function Approve() {
    console.log("Savey");
    if (!isApproved) {
      return (
        <span>
         
            <span className="text-[25px]">
            
              <FaToggleOff />
            </span>
        
        </span>
      );
    }
    return ( <> <span className="text-[25px]">   <FaToggleOn />  </span></>);
  }
  return (
    <>
      <div className="w-[100%] m-auto bg-[#ffffff] rounded-md p-3 shadow-md mb-3">
        <div className="w-full p-1 flex gap-3 justify-between items-center rounded-[10px]">
          <div className="w-[90%] flex gap-5 items-center justify-between">
            <span onClick={()=>{navigate(`/user_overview/${creator_id}`)}} className="   p-1 flex-grow-0 basis-auto cursor-pointer  rounded-md flex items-center gap-1 hover:bg-[#ededed]">
              
                <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${profile_img_?`http://localhost:3000/${profile_img_?.destination}/${profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
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
            <div  onClick={()=>{dispatch(approveProblem(_id))}}>
            {
               user?.role==='admin'&& <Approve/>
              }
            </div>
            <MdDeleteOutline  className="cursor-pointer text-[25px]" onClick={handle_del} />
          
            </div>
          )}
        </div>
        <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
        <div className="py-3 px-2 text-pretty text-justify max-h-[400px] overflow-y-auto">
        <div className="editor ql-editor" dangerouslySetInnerHTML={{ __html:  problem_content}} />
      
      
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
          <div className="flex justify-end gap-5 w-[20%]">{

              location.pathname!== `/problem/${_id}/sols` &&     <div onClick={()=>{dispatch(likeProblem(_id))}} className="flex p-[2px] items-center text-[1.2rem] gap-1 hover:bg-[#6e6e6e5a] rounded-md cursor-pointer">
             <Like/> {likes.length}
            </div>
          }
            {
           location.pathname=== `/problem/${_id}/sols` &&  user?._id!==creator_id && user?.role!=='admin'?
            <button onClick={()=>{setcurrent_pdata(pdata);  }} className="text-[#f96666] p-1 rounded-md font-bold hover:bg-[#edededdd]">
              Report
            </button>:""

            }
          </div>
        </div>
      </div>
   
      
    </>
  );
}

export default Problem_comp;
