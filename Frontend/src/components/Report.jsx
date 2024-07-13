import React, { useState } from 'react'
import WordLimitedTextarea from './WordLimitedTextarea';
import Modal from 'react-modal';
import { IoMdCloseCircle } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { createReport } from '../api';
function Report({current_adata=null,setcurrent_adata,current_pdata=null,setcurrent_pdata,current_sdata=null,setcurrent_sdata,current_cdata=null,setcurrent_cdata}) {
   
    const [Text,setText]=useState('') 
    const user=useSelector((state)=>state.userReducer.current_user)
    const submit_report=async(reportobj)=>{
        console.log("welkjflk}}}}}}",reportobj)
        try{
           const {data}=await createReport(reportobj)
           console.log("the data:",data)
        }catch(err){
          console.log("submit_report --- error",err)
        }
      }
      // console.log("lkljllk",current_pdata)
  return (
    <Modal
   isOpen={current_adata!=null||current_pdata!=null||current_sdata!=null||current_cdata!=null}
      // onRequestClose={() => setEditwindow(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgb(185, 185, 185 )',

        },
      }}>
      <div className="w-[660px]">
 <div className=" flex justify-end"  onClick={()=>{
  if(setcurrent_adata){setcurrent_adata(null);} 
  if(setcurrent_pdata){setcurrent_pdata(null)};
  if(setcurrent_sdata){setcurrent_sdata(null)};
  if(setcurrent_cdata){setcurrent_cdata(null)};
  setText('')}}><IoMdCloseCircle className="text-[25px] text-[white]"/></div>
     
      <div className="flex items-center gap-3  font-bold px-3">  
      <div className=" cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                <img
                  src="/default_profile.jpg"
                  width={`35px`}
                  className="rounded-[50%]"
                />
                <div className="flex flex-col text-[12px]">
                  <div>{current_adata?.creator_username||current_pdata?.creator_username||current_sdata?.creator_username||current_cdata?.creator_username  } </div>
                  {/* <div className="self-start">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</div> */}
                </div>
              </div>
            {
              current_pdata||current_adata?
            <div  className="text-wrap ">{current_adata?.title ||current_pdata?.title}</div>            
              :    <div className="text-wrap ">{current_sdata?"Report this Solution":"Report this Comment"}</div>         
            }
      </div>
      <br/>
     <div className="w-full flex justify-center">
     <WordLimitedTextarea maxWords={70} text={Text} setText={setText} place_holder="write report reason"/>
    </div>
    <div className="mt-4 flex justify-end px-4"> <button onClick={()=>{submit_report(current_adata?{
      content_creator_id:current_adata?.creator_id,
      content_creator_username:current_adata?.creator_username,
      report_content:Text,
      report_type:"article",
      type_id:current_adata?._id,
      reporter_username:user?.username,
      reporter_id:""
       }:current_pdata?{
      content_creator_id:current_pdata?.creator_id,
      content_creator_username:current_pdata?.creator_username,
      report_content:Text,
      report_type:"problem",
      type_id:current_pdata?._id,
      reporter_username:user?.username,
      reporter_id:""
      }:current_sdata?{
      content_creator_id:current_sdata?.creator_id,
      content_creator_username:current_sdata?.creator_username,
      report_content:Text,
      report_type:"solution",
      type_id:current_sdata?._id,
      reporter_username:user?.username,
      reporter_id:""
    }:current_cdata?{
      content_creator_id:current_cdata?.creator_id,
      content_creator_username:current_cdata?.creator_username,
      report_content:Text,
      report_type:"comment",
      type_id:current_cdata?._id,
      reporter_username:user?.username,
      reporter_id:""
    }:{})
    if(setcurrent_adata){setcurrent_adata(null);} 
  if(setcurrent_pdata){setcurrent_pdata(null)};
  if(setcurrent_sdata){setcurrent_sdata(null)};
  if(setcurrent_cdata){setcurrent_cdata(null)};
  setText('') }} className="bg-[#ff9639]  rounded-[5px] p-2 text-[white] self-start gap-2 cursor-pointer">Submit</button></div>
 </div>
       </Modal>
  )
}

export default Report