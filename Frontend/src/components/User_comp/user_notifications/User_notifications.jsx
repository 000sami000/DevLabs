import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { delete_userNotifications, fetch_userNotifications } from '../../../api';
import { IoCloseOutline } from "react-icons/io5";
import { formatDistanceToNow } from 'date-fns';
import Loader from '../../Loader';
function User_notifications() {


  
  let navigate=useNavigate();
  const { id } = useParams();
  console.log("iddd", id);
  let user = useSelector((state) => state.userReducer.current_user);
  const [Searchterm,setSearchterm]=useState('')
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [usernotifications, setusernotifications] = useState([]);

  const user_notifications = async () => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await fetch_userNotifications();
      if (Array.isArray(data)) {
        setusernotifications(data);
   
      } else {
        setusernotifications([]);
      }
      setloading(false);
      
      console.log(data);
    } catch (err) {
      setloading(false);
      
      console.log("userProblem--", err);
    }
  };
 
  const delete_user_notifications = async (id,clear=false) => {
    try {
      setloading(true);
      seterror(false);
      let { data } = await delete_userNotifications(id,clear);
      if (Array.isArray(data)) {
        setusernotifications(data);
   
      } else {
        setusernotifications([]);
      }
      setloading(false);
      
      console.log(data);
    } catch (err) {
      setloading(false);
      
      console.log("userProblem--", err);
    }
  };


  useEffect(() => {
    if(user._id===id)
    user_notifications(id);
  }, [id]);

   function Rander_all_Notification ({usernotifications}){

   return  usernotifications.length>0? usernotifications?.map((itm)=>(
      <div  key={itm.notific_id} className='w-full bg-slate-300 rounded-md p-2'>
   
      <div className='flex  justify-between'>

      <div>
        <span className=' font-semibold italic'>{itm.commentor_username}</span> {itm.notifi_type==='comment'?`commented on your ${itm.comment_type==='solution'?`${itm.comment_type} of this problem`:`${itm.comment_type}`} `:""}
        <span className='font-bold'>
          {itm.content_title}
        </span>
        </div>
        <div className='flex items-center gap-2'>
                 {/* <span>{formatDistanceToNow(itm.createdAt)}</span> */}
                 <span><IoCloseOutline  className=' text-[white] text-[20px] cursor-pointer hover:bg-slate-500 rounded-sm ' onClick={()=>delete_user_notifications(itm.notific_id)}/></span>
        </div>
        </div>
        <br/>
        <div className='bg-[white] p-1 rounded-md'>
          {  itm.comment_content }
        </div>
      
      </div>
    
    ))  :<div className=' text-center text-[20px] text-[white]'>No notifications</div>


   }
  return (
    <div>
     <div className='flex justify-end'>
     {
      usernotifications.length>0&&<button className={`bg-[#e5933c] px-5 rounded-[5px] text-[white]`}  onClick={()=>delete_user_notifications(null,true)}> Clear </button>
     } 
      
     </div>
     <br />
     {

      usernotifications.length>0 && <hr className="h-[4px] bg-[white] rounded-[2px]" />
     }
      <br />
      <div className='flex flex-col gap-3'>
     
          {
            loading?<div className="flex justify-center p-2"><Loader/></div>:<Rander_all_Notification usernotifications={usernotifications}/>
         
          }        
      </div>
    </div>
  )
}

export default User_notifications