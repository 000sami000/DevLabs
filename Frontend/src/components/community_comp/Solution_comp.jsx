import React from "react";
import { FaBookmark } from "react-icons/fa";
import { formatDistanceToNow } from 'date-fns';
import { IoArrowUpCircleOutline } from "react-icons/io5";
import { IoArrowUpCircle } from "react-icons/io5";
import { IoArrowDownCircleOutline } from "react-icons/io5";
import { IoArrowDownCircle } from "react-icons/io5";
import { FaRegBookmark } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useDispatch,useSelector } from "react-redux";
import { deleteSolution, updateSolution, voteSolution ,saveSolution} from "../../redux_/actions/solution";
import 'react-quill/dist/quill.snow.css';
import DOMPurify from "dompurify";
function Solution_comp({sol_props,setSol_ed}) {
  const user=useSelector((state)=>state.userReducer.current_user)
  const {solution_content ,saved_sol_by,vote,up_vote,down_vote,createdAt,_id }=sol_props;
  // const cleanHTML = DOMPurify.sanitize(solution_content);
  // console.log("solution_content=++++",solution_content)
  // console.log("cleanhtml=++++",cleanHTML)
  console.log("///",sol_props)
   const dispatch=useDispatch();
   const handleDelete=()=>{
         dispatch(deleteSolution(_id))
   }
   const handleUpdate=()=>{
    setSol_ed(sol_props)
    //  dispatch(updateSolution())
   }

   function Upvote() {
    console.log("Upvote");
    if (user&&up_vote?.length > 0) {
      return (
        <span>
          {up_vote?.find((u_vote) => u_vote === user._id) ? (
            <span className="text-md ">
              <IoArrowUpCircle className="text-[25px] cursor-pointer" />{" "}
            </span>
          ) : (
            <span className="text-md">
              <IoArrowUpCircleOutline className="text-[25px] cursor-pointer"/>
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <IoArrowUpCircleOutline className="text-[25px] cursor-pointer"/> 
        </span>
      </>
    );
  }
  function Downvote(voting_type) {
    console.log("Downvote");
    if (user&&down_vote?.length > 0) {
      return (
        <span>
          {down_vote?.find((d_vote) => d_vote === user._id) ? (
            <span className="text-md ">
              <IoArrowDownCircle className="text-[25px] cursor-pointer" />{" "}
            </span>
          ) : (
            <span className="text-md">
              <IoArrowDownCircleOutline className="text-[25px] cursor-pointer"/>
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <IoArrowDownCircleOutline className="text-[25px] cursor-pointer"/> 
        </span>
      </>
    );
  }
  function Save() {
    console.log("Savey");
    if (user&&saved_sol_by?.length > 0) {
      return (
        <span>
          {saved_sol_by?.find((saved) => saved === user._id)?(
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
  return (
      <>
        <div className="w-[100%] m-auto bg-[#ffffff] rounded-md p-3 shadow-md">
          <div className="w-full p-1 flex justify-between items-center rounded-[10px] pr-2">
            <div className="w-[88%] flex gap-5 items-center">
              <div className=" cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                <img
                  src="/default_profile.jpg"
                  width={`35px`}
                  className="rounded-[50%]"
                />
                <div className="flex flex-col text-[12px]">
                  <div>tim101</div>
                  <div className="self-start">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div>
                </div>
              </div>
            <div  className="  w-[8%] flex  text-[26px] gap-4 text-[#F99156] items-center">              
            <MdDeleteOutline className="cursor-pointer" onClick={handleDelete}/>  
           <TbEditCircle className="cursor-pointer" onClick={handleUpdate}/>
            </div>
            </div>
            <div className="flex justify-between gap-5 items-center">
            <span onClick={()=>dispatch(saveSolution(_id))} className="text-[#F99156] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
            <Save/>
            </span>
            <span className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
              Report
            </span>
            </div>
          </div>
          <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
          <div className="flex justify-between gap-4 py-3 px-2 text-pretty text-justify max-h-[400px] overflow-y-auto w-[100%]">
            <div className=" tiptap " dangerouslySetInnerHTML={{ __html: solution_content }} />
            <div className="w-[50px] flex flex-col items-center text-[#995731] gap-3 hover:shadow-lg bg-[#F99156] place-self-start p-1 py-2 rounded-lg">
               <span onClick={()=>dispatch(voteSolution(_id,{...sol_props,vote:"upvote"}))}><Upvote/></span>
              <span className="text-[15px]">{vote}</span>
               <span onClick={()=>dispatch(voteSolution(_id,{...sol_props,vote:"downvote"}))}><Downvote/></span>
            
            </div>
          </div>


          <hr className="bg-[#595858] h-[4px] rounded-[2px] mb-2" />


          <div className="bg-[#343434] rounded-lg shadow-lg p-2">
            <div className="text-center text-[#F99156] text-[15px] font-bold">
              Comments
            </div>
            <hr className="bg-[#dadada] h-[2px] rounded-[2px] mb-2"/>
            <div>
              <div className="w-full p-1 flex justify-between items-center rounded-[10px]">
                <div className="w-[88%] flex gap-5 items-center">
                  <div className=" w-[13%] overflow-x-hidden  cursor-pointer p-1 rounded-md flex items-center place-self-start gap-2 hover:bg-[#ededed56]">
                    <img
                      src="/default_profile.jpg"
                      width={`30px`}
                      className="rounded-[50%]"
                    />
                    <div className=" text-[#eaeaea]">
                      <div className="text-wrap text-[11px] inline-block ">Timddddddd ds Cook</div>
                      <div className=" text-[10px]">tim101</div>
                    </div>
                  </div>
                  <div className="w-[84%] break-words  text-[13px] text-[#eaeaea] ">
                    
                    i have been trying to install the quil text editor shdfjksh ds dfuhskfh jhskjfh 87hwkjh wefu le hfuhfiufiuhf ijioj oiweef uhfuhfiuhfiuh 
                    ned
                  </div>
                </div>
                <div className="text-[#f96666] p-1  cursor-pointer rounded-md font-bold hover:bg-[#edededdd]">
                  Report
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    
  );
}

export default Solution_comp;
