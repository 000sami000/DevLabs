import React, { useEffect, useState } from 'react'
import { createComment, deleteComment, fetchComment, updateComment } from '../api';
import WordLimitedTextarea from './WordLimitedTextarea';
import Loader from './Loader';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from "date-fns";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import Report from './Report';
function Comment({_id,creator_id,c_type,content_title,content_creator_username}) {
    const user=useSelector((state)=>state.userReducer.current_user)
    let c_obj={content_creator_id:"",type_id:"",comment_type:"",comment_content:"",commentor_username:"",commentor_id:"",content_title:"",content_creator_username:""}
    const [text, setText] = useState('');
    const [Comments,setComments]=useState([])
    const [cloading,setcloading]=useState(false);
    const [update_c,setupdate_c]=useState(null)
    
    const fetch_comment= async(type_id)=>{
           
        try{
          setcloading(true);
          const {data}=await fetchComment(type_id)
          setcloading(false);
          console.log("comments====",data)
        setComments(data)
        }catch(err){
          setcloading(false);
          console.log("fetch_comment-- error", err);
        }
      }
      const update_comment=async(c_obj)=>{
         try{
            if(text){

                const {data}=await updateComment(c_obj._id,{comment_content:text})
                console.log("comment--data",data)
                setComments((prev) =>
                    prev.map((itm) =>
                        itm._id === data?._id
                            ? { ...itm, comment_content: data.comment_content }
                            : itm
                    )
                );
     setupdate_c(null)
     setText("")

            }
         }catch(err){
            console.log("update_comment-- error", err);
         }
      }
      const delete_comment=async(c_id)=>{
        try{
          

               const {data}=await deleteComment(c_id)
               console.log("comment--data",data)
               setComments((prev) =>prev.filter((itm) =>itm._id !== data._id));
   

           
        }catch(err){
           console.log("delete_comment-- error", err);
        }
     }

     const [current_cdata,setcurrent_cdata]=useState(null)
  const create_comment= async()=>{
    if(text!=''&& user){

      c_obj={content_creator_id:creator_id,type_id:_id,comment_type:c_type,comment_content:text,commentor_username:user?.username,content_title:content_title,content_creator_username:content_creator_username,profile_img_:user?.profile_img_}
    }else{
      //error
      return;
    }

        try{
           const {data}=await createComment(c_obj)
           console.log(data)
           setComments((prev) => [data, ...prev])
        }   catch(err){
          console.log("create_comment-- error", err);
        }           
  }

  useEffect(()=>{
    fetch_comment(_id)
  },[])
  return (
    <div className="bg-[#343434] rounded-lg shadow-lg p-2">
    <div className="text-center text-[#F99156] text-[15px] font-bold">
      Comments
    </div>
    <hr className="bg-[#dadada] h-[2px] rounded-[2px] mb-2" />
     { cloading?<div className="flex justify-center p-2"><Loader/></div>: !Comments?.length>0?<div>No Comments</div>: Comments.map((itm)=>(   
      <div key={itm._id} className="w-full p-1 flex justify-between items-center rounded-[10px]">
        <div className="w-[88%] flex gap-5 items-center">
          <div className=" w-[13%] overflow-x-hidden  cursor-pointer p-1 rounded-md flex items-center place-self-start gap-2 hover:bg-[#ededed56]">
          <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${itm.profile_img_?`http://localhost:3000/${itm.profile_img_?.destination}/${itm.profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
            <div className=" text-[#eaeaea]">
              <div className="text-wrap text-[11px] inline-block ">
                {itm.commentor_username }
              </div>
              <div className=" text-[10px]">{itm.createdAt && formatDistanceToNow(itm.createdAt)}</div>
            </div>
          </div>
          <div className="w-[84%] break-words  text-[13px] text-[#eaeaea]  ">
            {itm.comment_content}
          </div>
          {
           user?._id===itm.commentor_id || user.role==="admin" ?  
          <div className='flex items-center text-[20px] gap-2 text-[orange]'>
         <MdDeleteOutline onClick={()=>{delete_comment(itm._id)}} className='cursor-pointer'/>
         <TbEditCircle onClick={()=>{setupdate_c(itm); setText(itm.comment_content)}} className='cursor-pointer'/>
          </div>:""
          }
          
        </div>
        {
user._id!==itm.commentor_id && user.role!=='admin'&&
        <div onClick={()=>{setcurrent_cdata({
          creator_id:itm.commentor_id,
         creator_username:itm.commentor_username,
         comment_content:itm.comment_content,
         _id:itm._id,

        })}} className="text-[#f96666] p-1  cursor-pointer rounded-md font-semibold hover:bg-[#ededed88]">
          Report
        </div>
        }
      </div> ) ) 
     }
     <div className="flex gap-2 w-full items-center">
      <WordLimitedTextarea maxWords={70} text={text} setText={setText}/>
      {
         update_c!=null?
         <button className="text-[green] p-1 hover:bg-[#49e349cf] rounded-md" onClick={()=>{update_comment(update_c)}}>Update</button>
         :<button className="text-[green] p-1 hover:bg-[#49e349cf] rounded-md" onClick={()=>{create_comment()}}>Post</button>

      }
        </div>
  <Report current_cdata={current_cdata} setcurrent_cdata={setcurrent_cdata}/>
  </div>
  )
}

export default Comment