import React, { useState } from 'react'
import Editorpro from '../text_editor/Editorpro';
import QuilEditor from '../text_editor/QuilEditor';
import { MdDone } from "react-icons/md";
function Cource_create() {

    const [Switch,setSwitch]=useState(false);
    let toc=[];
  return (
    <>
    <div className='flex justify-center mt-[4%]'><input  placeholder="Title for the Cource" className='w-[45%] p-1   rounded-md  outline-none '/></div>
    <br/>
    <div className='flex justify-center '><textarea placeholder='Write a small Description' className='w-[45%] text-[15px] p-1   rounded-md  outline-none  resize-none'/></div>
    <br/>
    
    <div className='flex justify-between p-3'>
    <select className="rounded-md bg-[orange] outline-none p-1"  onChange={(e)=>{console.log(e.target.value); setSwitch((prev)=>!prev)}  }>
    <option className='bg-[white] ' value={false}>Editor 1</option>
    <option  className='bg-[white]  '  value={true}>Editor 2</option>
     </select>
  <input type='file' className='w-[100px]' />
   </div>
    
    <div className='flex gap-2 p-2'>
             
    <div className='bg-[green] w-[20%] rounded-md'>
  {
    toc.length==0?<div className='bg-[purple] p-2 text-[20px] flex items-center gap-2'><input className='w-full rounded-md'/><MdDone className='text-[25px] text-[white] hover:bg-[#ffffff91] rounded-sm cursor-pointer'/> </div>:"kl"
  }

    </div>
    <div className='bg-[white] w-[80%] rounded-md'>
    {
  Switch?
  <Editorpro ContentHtml={"hgh"} />:
  <QuilEditor ContentHtml={"bgbx"} />
 }
    </div>
    </div>
    </>
  )
}

export default Cource_create