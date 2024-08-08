import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { delete_single_cource, fetch_single_cource } from '../../api';
import { MdModeEdit } from "react-icons/md";

import { FaTrash } from "react-icons/fa6";
import { useSelector } from 'react-redux';
function Single_cource() {
    let user=useSelector((state)=>state.userReducer.current_user)
    const navigate= useNavigate();
     const {c_id}=useParams()
     const [cource,setcource]=useState(null); 
     const [Selected,setSelected]=useState(null)
       const single_cource=async ()=>{
          try{
            const {data}=await  fetch_single_cource(c_id);
//   console.log(">>>",data)
           setcource(data);
           setSelected(data.cource_data[0])
          } catch(err){
            console.log("fetch_single_cource")
          }
       }
     useEffect(()=>{ 
   single_cource()
     },[])

     const delete_cource=async ()=>{
        try{
          const {data}=await  delete_single_cource(c_id);
//   console.log(">>>",data)
        //  setcource(data);
        //  setSelected(data.cource_data[0])
        navigate("/courses")
        } catch(err){
          console.log("fetch_single_cource")
        }
     }
  return (
    <>
    <br/>
    <div className='flex justify-end px-2 gap-2'>
    {
        user.role==='admin' &&<>
    <button onClick={()=>{navigate(`/update-cource/${c_id}`)}} className='bg-[#25b839] p-1 text-[16px] flex items-center gap-2 text-[white] rounded-md'>Update <MdModeEdit className='text-[16px] '/></button>
    <button onClick={delete_cource} className='bg-[#f6412d] p-1 text-[16px] flex items-center gap-2 text-[white] rounded-md'>Delete <FaTrash className='text-[16px] '/></button>
</>
    }
    
    </div>
      <h1 className=" w-full text-center text-[30px] text-white">
       {cource?.title}
      </h1>
    <br/>
      <div className="w-[95%] flex  m-auto gap-4">
        <div className="w-[25%] bg-[#545454b7] rounded-md self-start">
          {cource?.cource_data?.map((itm) => {
            return (
              <div
                className={`w-full text-[white] text-[17px] overflow-x-hidden text-wrap cursor-pointer p-2 ${
                  Selected === itm ? "bg-[orange]" : ""
                }`}
                onClick={() => {
                  setSelected(itm);
                }}
              >
                {itm.title}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center  w-[76%]">
      {
        Selected?
      <embed
        src={`http://localhost:3000${Selected?.pdf}`}
        type="application/pdf"
       className="w-[100%] h-[1000px]"

      />:""
      }
    </div>
      </div>
    </>
  )
}

export default Single_cource