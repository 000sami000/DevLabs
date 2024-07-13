import React, { useState } from 'react'
import Tags_input from './Tags_input';
import { IoSearch } from "react-icons/io5";
function Search_input({placeholder_val, type}) {
    const [Switch,setSwitch]=useState(false);
    function getter(Tags){
        console.log(Tags)
        // setArticle_obj({...Article_obj,tags:Tags})
        }
        console.log(placeholder_val)
  return (
    <div className='flex justify-center gap-3 items-center'>
    <select className="rounded-md bg-[orange] outline-none p-1 text-[white]  "  onChange={(e)=>{console.log(e.target.value); setSwitch((prev)=>!prev);}  }>
    <option className='bg-[white] text-[orange] ' value={false}>Title</option>
    <option  className='bg-[white]  text-[orange] '  value={true}>Tags</option>
    
  </select>
    {
        !Switch?
    <input placeholder={placeholder_val} className='text-[15px] w-[450px] p-1 rounded-md outline-none'/>
:
   <div className='bg-[white] rounded-md max-w-[50%]'> <Tags_input getter={getter}/></div> 
    }
    <button className='hover:bg-slate-200 p-2 py-1 rounded-md hover:text-[orange]'><IoSearch className='hover:text-[orange] text-[25px] text-[white]'/></button>
    </div>
  )
}

export default Search_input