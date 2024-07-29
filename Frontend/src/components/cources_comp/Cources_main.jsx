import React from 'react'
import Cource_card from './Cource_card'
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
function Cources_main() {
  const navigate= useNavigate();
  return (
    <>
    <div className='flex justify-end p-2'><button onClick={()=>{navigate("/create-cource/")}} className='bg-[#25b839] p-1 text-[20px] flex items-center gap-2 text-[white] rounded-md'>Create <IoMdAddCircleOutline className='text-[22px] '/></button></div>
    <div className='text-center text-[white] text-[30px] mt-5'>Cources</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-2.5   w-full p-5">
  <Cource_card/>

    </div>
    </>
  )
}

export default Cources_main