import React, { useEffect, useState } from 'react'
import Cource_card from './Cource_card'
import { IoMdAddCircleOutline } from "react-icons/io";
import { Link, Navigate, NavLink, useLocation, useNavigate } from "react-router-dom";
import { get_all_cources } from '../../api';
import { useSelector } from 'react-redux';
function Cources_main() {
  let user=useSelector((state)=>state.userReducer.current_user)
  const navigate= useNavigate();
    const [cources,setcources]=useState(null); 
  async function fetch_cources(){
      try{
      const {data}=await get_all_cources();
    
      setcources(data);
      }catch(err){
        console.log("fetch_cources---err",err)
      }
   }
  useEffect(()=>{
    fetch_cources()

  },[])
  return (
    <>
    {
      user?.role==='admin'&&
    <div className='flex justify-end p-2'><button onClick={()=>{navigate("/create-cource/")}} className='bg-[#25b839] p-1 text-[20px] flex items-center gap-2 text-[white] rounded-md'>Create <IoMdAddCircleOutline className='text-[22px] '/></button></div>
    }
    <div className='text-center text-[white] text-[30px] mt-5'>Cources</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-10   w-full p-5">
    {
      cources?.map((itm)=><Cource_card  cource_props={itm} />)
    }
  

    </div>
    </>
  )
}

export default Cources_main