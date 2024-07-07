import React, { useState } from 'react'
import Web from './web_comp/Web'
import Acecompiler_main from './ace_compiler/Acecompiler_main'
function Compiler() {
   const [Selected_comp,setSelected_comp]=useState("comp")
  return (
    <>
    <div className='mt-1 pt-4 ml-7 flex justify-start gap-5'>
     <button onClick={()=>{setSelected_comp("comp")}} className={`${Selected_comp=='comp'?"bg-[#db7836]":"bg-[#f88e47]"} p-1 rounded-lg text-[white]`}>Compiler</button>

     <button onClick={()=>{setSelected_comp("Web")}} className={`${Selected_comp=='Web'?"bg-[#db7836]":"bg-[#f88e47]"} p-1 rounded-lg text-[white]`}>web</button>
   </div>
   {
    Selected_comp==='comp'?
    <div><Acecompiler_main /></div>:
    <div><Web /></div>
   }
    </>
  )
}

export default Compiler