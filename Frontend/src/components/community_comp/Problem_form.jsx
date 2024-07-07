import React, { useState } from "react";

import Tags_input from "../Tags_input";
import { IoAddCircle } from "react-icons/io5";
// import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { createProblem } from "../../redux_/actions/problem";
import QuilEditor from "../text_editor/QuilEditor";
import Editorpro from "../text_editor/Editorpro";

function Problem_form({user}) {
  const dispatch=useDispatch();

  const [content,setcontent]=useState("")
  const [ContentHtml,setContentHtml]=useState("")
  const [Problem_obj,setProblem_obj]=useState({title:"",ContentHtml:"",tags:[]});
  function getter(Tags){
  // console.log(Tags)
  setProblem_obj({...Problem_obj,tags:Tags})
  }
// console.log(">>>>>",content)
function submit_handler (){
 
  console.log(Problem_obj)
   if(Problem_obj.title && ContentHtml){
    console.log("problemobj---",Problem_obj)
    dispatch(createProblem({...Problem_obj,ContentHtml:ContentHtml,creator_id:user?._id,creator_username:user?.username}));
    setProblem_obj({title:"",ContentHtml:"",tags:[]})
    setcontent('')
// setcontent("");
setContentHtml("")
   }
   else{
    console.log("\\\\////", Problem_obj.ContentHtml)
   }

}

console.log("++++++",ContentHtml)

  return (
    <div className="w-[75%]  px-6 py-3 flex flex-col gap-3 m-auto bg-[white] rounded-lg">
    {/* <p>please provide title</p> */}
   <textarea className="w-full text-[18px] p-1 bg-[#f1f1f1]  border rounded-md  outline-none  resize-none" onChange={(e)=>{setProblem_obj({...Problem_obj,title:e.target.value})}} value={Problem_obj.title}  placeholder="Enter the Title for the problem"/>
   
    <QuilEditor ContentHtml={ContentHtml} setContentHtml={setContentHtml}/>
    
     <div className="flex justify-between ">
  
   <div className="w-[80%]">
    <Tags_input getter={getter}/> 
    </div>
    <button onClick={ submit_handler} className="bg-[#ff9639] flex items-center rounded-[5px] p-2 text-[white] self-start gap-2 cursor-pointer">Create <IoAddCircle /></button>
     </div>
    </div>
  );
}

export default Problem_form;
