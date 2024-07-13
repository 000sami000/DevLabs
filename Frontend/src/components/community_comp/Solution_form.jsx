import React ,{useRef, useState}from 'react'

import QuilEditor from "../text_editor/QuilEditor";
import { IoAddCircle } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux'
import { createSolution, updateSolution } from '../../redux_/actions/solution';

function Solution_form({p_id,Sol_ed,setSol_ed}) {
  const dispatch=useDispatch();
  const [content,setcontent]=useState("")
  const [ContentHtml,setContentHtml]=useState(Sol_ed?Sol_ed.solution_content:'')
  // console.log("///???",Sol_ed)
   const user=useSelector((state)=>state.userReducer.current_user)
    // console.log(ContentHtml)
    console.log("[]]",p_id)
    const submit_handler=()=>{
        if(Sol_ed){
          if(ContentHtml){
          
            dispatch(updateSolution(Sol_ed._id,{...Sol_ed,solution_content:ContentHtml}))
            setSol_ed(null);
            setContentHtml('')
          }
          else{
            alert("you can't upload empty solution")
          }
        }else{
          if(ContentHtml){
            // console.log(user)
            dispatch(createSolution(p_id,{ContentHtml,creator_username:user.username}))
            setContentHtml('')
          }
          else{
            alert("you can't upload emty solution")
          }
        }
        // console.log("------",ContentHtml)
        
     
      }

    
  return (
    <>
   <div className="w-[100%] mt-8  px-6 py-3 flex flex-col gap-3 m-auto bg-[white] rounded-lg">
  
    <div > <QuilEditor ContentHtml={ContentHtml} setContentHtml={setContentHtml}/></div>
     <div className="flex justify-end  gap-5">
     <button className="bg-[#ff9639] flex items-center rounded-[5px] p-2 text-[white]  gap-2" onClick={submit_handler}>{Sol_ed ? "Edit":"Create"} <IoAddCircle /></button>
     {

      Sol_ed!=null&&
     <button  className="bg-[#ff9639] flex items-center rounded-[5px] p-2 text-[white]  gap-2" onClick={()=>setSol_ed(null)}>Cancel <IoAddCircle /></button>
     }
    </div>
    </div>

    </>
  )
}

export default Solution_form