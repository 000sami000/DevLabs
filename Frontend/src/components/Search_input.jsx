import React, { useState } from 'react'
import Tags_input from './Tags_input';
import { IoSearch } from "react-icons/io5";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { useDispatch } from 'react-redux';
import { getProblems, search_problem_data } from '../redux_/actions/problem';
import { getArticles, search_article_data } from '../redux_/actions/article';
function Search_input({placeholder_val,  content_type}) {
    const [Switch,setSwitch]=useState(false);
    const [inputval,setinputval]=useState("");
    const [inputvaltag,setinputvaltag]=useState([]);
    const [searchmode, setsearchmode] = useState(false);
   const dispatch=useDispatch();
    function getter(Tags){
      setinputvaltag(Tags)
        console.log("inputvaltag------",inputvaltag)
        // setArticle_obj({...Article_obj,tags:Tags})
        }

      
        // console.log(placeholder_val)
  return (
    <div className='flex justify-center gap-3 items-center'>
    {
      searchmode&&  
     <button onClick={()=>{setsearchmode(false); 
     if(content_type==="problem"){
      dispatch(getProblems(0));
      }
      else{

      dispatch(getArticles(0));
      }
      }} className='bg-[orange] rounded-md px-3 py-1 text-white'><FaArrowRotateLeft className='text-[23px]'/></button>
    }
    <select className="rounded-md bg-[orange] outline-none p-1 text-[white]  "  onChange={(e)=>{console.log(e.target.value); setSwitch((prev)=>!prev);}  }>
    <option className='bg-[white] text-[orange] ' value={false}>Title</option>
    <option  className='bg-[white]  text-[orange] '  value={true}>Tags</option>
    
  </select>
    {
        !Switch?
    <input placeholder={placeholder_val} onChange={(e)=>setinputval(e.target.value)} className='text-[15px] w-[450px] p-1 rounded-md outline-none'/>
:
   <div className='bg-[white] rounded-md max-w-[50%]'> <Tags_input getter={getter}/></div> 
    }
    <button onClick={()=>{
      if(content_type==="problem"){
      if(!Switch){
      if(inputval.trim()){
      dispatch(search_problem_data(inputval))
      setsearchmode(true)
    }}else{
      if(inputvaltag.length>0){
      dispatch(search_problem_data(inputvaltag))
      setsearchmode(true)
    } 
    }
  }else{
    if(!Switch){
      if(inputval.trim()){
      dispatch(search_article_data(inputval))
      setsearchmode(true)
    }}else{
      if(inputvaltag.length>0){
      dispatch(search_article_data(inputvaltag))
      setsearchmode(true)
    } 
    }
  }
  
  
  }} className='hover:bg-slate-200 p-2 py-1 rounded-md hover:text-[orange]'><IoSearch className='hover:text-[orange] text-[25px] text-[white]'/></button>
    </div>
  )
}

export default Search_input